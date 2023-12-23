import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { sync } from "fast-glob";
import type { Schema } from "@titan/types";
import JSON5 from "json5";
import * as logger from "./logger";
import { getTitanRoot } from "./getTitanRoot";
import type { PackageJson, PNPMWorkspaceConfig } from "./types";

const ROOT_GLOB = "titan.json";
const ROOT_WORKSPACE_GLOB = "package.json";

export interface WorkspaceConfig {
  workspaceName: string;
  workspacePath: string;
  isWorkspaceRoot: boolean;
  titanConfig?: Schema;
}

export interface TitanConfig {
  config: Schema;
  titanConfigPath: string;
  workspacePath: string;
  isRootConfig: boolean;
}

export type TitanConfigs = Array<TitanConfig>;

interface Options {
  cache?: boolean;
}

const titanConfigsCache: Record<string, TitanConfigs> = {};
const workspaceConfigCache: Record<string, Array<WorkspaceConfig>> = {};

// A quick and dirty workspace parser
// TODO: after @titan/workspace-convert is merged, we can leverage those utils here
function getWorkspaceGlobs(root: string): Array<string> {
  try {
    if (fs.existsSync(path.join(root, "pnpm-workspace.yaml"))) {
      const workspaceConfig = yaml.load(
        fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8")
      ) as PNPMWorkspaceConfig;

      return workspaceConfig.packages || [];
    }
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8")
    ) as PackageJson;
    if (packageJson.workspaces) {
      // support nested packages workspace format
      if ("packages" in packageJson.workspaces) {
        return packageJson.workspaces.packages || [];
      }

      if (Array.isArray(packageJson.workspaces)) {
        return packageJson.workspaces;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function getTitanConfigs(cwd?: string, opts?: Options): TitanConfigs {
  const titanRoot = getTitanRoot(cwd, opts);
  const configs: TitanConfigs = [];

  const cacheEnabled = opts?.cache ?? true;
  if (cacheEnabled && cwd && cwd in titanConfigsCache) {
    return titanConfigsCache[cwd];
  }

  // parse workspaces
  if (titanRoot) {
    const workspaceGlobs = getWorkspaceGlobs(titanRoot);
    const workspaceConfigGlobs = workspaceGlobs.map(
      (glob) => `${glob}/titan.json`
    );

    const configPaths = sync([ROOT_GLOB, ...workspaceConfigGlobs], {
      cwd: titanRoot,
      onlyFiles: true,
      followSymbolicLinks: false,
      // avoid throwing when encountering permission errors or unreadable paths
      suppressErrors: true,
    }).map((configPath) => path.join(titanRoot, configPath));

    configPaths.forEach((configPath) => {
      try {
        const raw = fs.readFileSync(configPath, "utf8");
        // eslint-disable-next-line import/no-named-as-default-member -- json5 exports different objects depending on if you're using esm or cjs (https://github.com/json5/json5/issues/240)
        const titanJsonContent: Schema = JSON5.parse(raw);
        // basic config validation
        const isRootConfig = path.dirname(configPath) === titanRoot;
        if (isRootConfig) {
          // invalid - root config with extends
          if ("extends" in titanJsonContent) {
            return;
          }
        } else if (!("extends" in titanJsonContent)) {
          // invalid - workspace config with no extends
          return;
        }
        configs.push({
          config: titanJsonContent,
          titanConfigPath: configPath,
          workspacePath: path.dirname(configPath),
          isRootConfig,
        });
      } catch (e) {
        // if we can't read or parse the config, just ignore it with a warning
        logger.warn(e);
      }
    });
  }

  if (cacheEnabled && cwd) {
    titanConfigsCache[cwd] = configs;
  }

  return configs;
}

export function getWorkspaceConfigs(
  cwd?: string,
  opts?: Options
): Array<WorkspaceConfig> {
  const titanRoot = getTitanRoot(cwd, opts);
  const configs: Array<WorkspaceConfig> = [];

  const cacheEnabled = opts?.cache ?? true;
  if (cacheEnabled && cwd && cwd in workspaceConfigCache) {
    return workspaceConfigCache[cwd];
  }

  // parse workspaces
  if (titanRoot) {
    const workspaceGlobs = getWorkspaceGlobs(titanRoot);
    const workspaceConfigGlobs = workspaceGlobs.map(
      (glob) => `${glob}/package.json`
    );

    const configPaths = sync([ROOT_WORKSPACE_GLOB, ...workspaceConfigGlobs], {
      cwd: titanRoot,
      onlyFiles: true,
      followSymbolicLinks: false,
      // avoid throwing when encountering permission errors or unreadable paths
      suppressErrors: true,
    }).map((configPath) => path.join(titanRoot, configPath));

    configPaths.forEach((configPath) => {
      try {
        const rawPackageJson = fs.readFileSync(configPath, "utf8");
        const packageJsonContent = JSON.parse(rawPackageJson) as PackageJson;

        const workspaceName = packageJsonContent.name;
        const workspacePath = path.dirname(configPath);
        const isWorkspaceRoot = workspacePath === titanRoot;

        // Try and get titan.json
        const titanJsonPath = path.join(workspacePath, "titan.json");
        let rawTitanJson = null;
        let titanConfig: Schema | undefined;
        try {
          rawTitanJson = fs.readFileSync(titanJsonPath, "utf8");
          // eslint-disable-next-line import/no-named-as-default-member -- json5 exports different objects depending on if you're using esm or cjs (https://github.com/json5/json5/issues/240)
          titanConfig = JSON5.parse(rawTitanJson);

          if (titanConfig) {
            // basic config validation
            if (isWorkspaceRoot) {
              // invalid - root config with extends
              if ("extends" in titanConfig) {
                return;
              }
            } else if (!("extends" in titanConfig)) {
              // invalid - workspace config with no extends
              return;
            }
          }
        } catch (e) {
          // It is fine for there to not be a titan.json.
        }

        configs.push({
          workspaceName,
          workspacePath,
          isWorkspaceRoot,
          titanConfig,
        });
      } catch (e) {
        // if we can't read or parse the config, just ignore it with a warning
        logger.warn(e);
      }
    });
  }

  if (cacheEnabled && cwd) {
    workspaceConfigCache[cwd] = configs;
  }

  return configs;
}

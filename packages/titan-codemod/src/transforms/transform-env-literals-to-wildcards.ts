import path from "node:path";
import { readJsonSync, existsSync } from "fs-extra";
import { type PackageJson, getTitanConfigs } from "@titan/utils";
import type { EnvWildcard, Schema as TitanJsonSchema } from "@titan/types";
import type { RootSchema } from "@titan/types/src/types/config";
import type { TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";

// transformer details
const TRANSFORMER = "transform-env-literals-to-wildcards";
const DESCRIPTION = "Rewrite env fields to distinguish wildcards from literals";
const INTRODUCED_IN = "1.10.0";

// Rewriting of environment variable names.
function transformEnvVarName(envVarName: string): EnvWildcard {
  let output = envVarName;

  // Transform leading !
  if (envVarName.startsWith("!")) {
    output = `\\${output}`;
  }

  // Transform literal asterisks
  output = output.replace(/\*/g, "\\*");

  return output;
}

function migrateRootConfig(config: RootSchema) {
  const { globalEnv, globalPassThroughEnv } = config;

  if (Array.isArray(globalEnv)) {
    config.globalEnv = globalEnv.map(transformEnvVarName);
  }
  if (Array.isArray(globalPassThroughEnv)) {
    config.globalPassThroughEnv = globalPassThroughEnv.map(transformEnvVarName);
  }

  return migrateTaskConfigs(config);
}

function migrateTaskConfigs(config: TitanJsonSchema) {
  for (const [_, taskDef] of Object.entries(config.pipeline)) {
    const { env, passThroughEnv } = taskDef;

    if (Array.isArray(env)) {
      taskDef.env = env.map(transformEnvVarName);
    }
    if (Array.isArray(passThroughEnv)) {
      taskDef.passThroughEnv = passThroughEnv.map(transformEnvVarName);
    }
  }

  return config;
}

export function transformer({
  root,
  options,
}: TransformerArgs): TransformerResults {
  const { log, runner } = getTransformerHelpers({
    transformer: TRANSFORMER,
    rootPath: root,
    options,
  });

  // If `titan` key is detected in package.json, require user to run the other codemod first.
  const packageJsonPath = path.join(root, "package.json");
  // package.json should always exist, but if it doesn't, it would be a silly place to blow up this codemod
  let packageJSON = {};

  try {
    packageJSON = readJsonSync(packageJsonPath) as PackageJson;
  } catch (e) {
    // readJSONSync probably failed because the file doesn't exist
  }

  if ("titan" in packageJSON) {
    return runner.abortTransform({
      reason:
        '"titan" key detected in package.json. Run `npx @titan/codemod transform create-titan-config` first',
    });
  }

  log.info("Rewriting env vars to support wildcards");
  const titanConfigPath = path.join(root, "titan.json");
  if (!existsSync(titanConfigPath)) {
    return runner.abortTransform({
      reason: `No titan.json found at ${root}. Is the path correct?`,
    });
  }

  const titanJson = readJsonSync(titanConfigPath) as TitanJsonSchema;
  runner.modifyFile({
    filePath: titanConfigPath,
    after: migrateRootConfig(titanJson),
  });

  // find and migrate any workspace configs
  const allTitanJsons = getTitanConfigs(root);
  allTitanJsons.forEach((workspaceConfig) => {
    const { config, titanConfigPath: filePath, isRootConfig } = workspaceConfig;
    if (!isRootConfig) {
      runner.modifyFile({
        filePath,
        after: migrateTaskConfigs(config),
      });
    }
  });

  return runner.finish();
}

const transformerMeta = {
  name: TRANSFORMER,
  description: DESCRIPTION,
  introducedIn: INTRODUCED_IN,
  transformer,
};

// eslint-disable-next-line import/no-default-export -- transforms require default export
export default transformerMeta;

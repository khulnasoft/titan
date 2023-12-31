import path from "node:path";
import { readJsonSync, existsSync } from "fs-extra";
import { type PackageJson, getTitanConfigs } from "@titan/utils";
import type { Schema as TitanJsonSchema, Pipeline } from "@titan/types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";
import type { TransformerArgs } from "../types";

// transformer details
const TRANSFORMER = "migrate-env-var-dependencies";
const DESCRIPTION =
  'Migrate environment variable dependencies from "dependsOn" to "env" in `titan.json`';
const INTRODUCED_IN = "1.5.0";

export function hasLegacyEnvVarDependencies(config: TitanJsonSchema) {
  const dependsOn = [
    "extends" in config ? [] : config.globalDependencies,
    Object.values(config.pipeline).flatMap(
      (pipeline) => pipeline.dependsOn ?? []
    ),
  ].flat();
  const envVars = dependsOn.filter((dep) => dep?.startsWith("$"));
  return { hasKeys: Boolean(envVars.length), envVars };
}

export function migrateDependencies({
  env,
  deps,
}: {
  env?: Array<string>;
  deps?: Array<string>;
}) {
  const envDeps = new Set<string>(env);
  const otherDeps: Array<string> = [];
  deps?.forEach((dep) => {
    if (dep.startsWith("$")) {
      envDeps.add(dep.slice(1));
    } else {
      otherDeps.push(dep);
    }
  });
  if (envDeps.size) {
    return {
      deps: otherDeps,
      env: Array.from(envDeps),
    };
  }
  return { env, deps };
}

export function migratePipeline(pipeline: Pipeline) {
  const { deps: dependsOn, env } = migrateDependencies({
    env: pipeline.env,
    deps: pipeline.dependsOn,
  });
  const migratedPipeline = { ...pipeline };
  if (dependsOn) {
    migratedPipeline.dependsOn = dependsOn;
  } else {
    delete migratedPipeline.dependsOn;
  }
  if (env?.length) {
    migratedPipeline.env = env;
  } else {
    delete migratedPipeline.env;
  }

  return migratedPipeline;
}

export function migrateGlobal(config: TitanJsonSchema) {
  if ("extends" in config) {
    return config;
  }

  const { deps: globalDependencies, env } = migrateDependencies({
    env: config.globalEnv,
    deps: config.globalDependencies,
  });
  const migratedConfig = { ...config };
  if (globalDependencies?.length) {
    migratedConfig.globalDependencies = globalDependencies;
  } else {
    delete migratedConfig.globalDependencies;
  }
  if (env?.length) {
    migratedConfig.globalEnv = env;
  } else {
    delete migratedConfig.globalEnv;
  }
  return migratedConfig;
}

export function migrateConfig(config: TitanJsonSchema) {
  const migratedConfig = migrateGlobal(config);
  Object.keys(config.pipeline).forEach((pipelineKey) => {
    config.pipeline;
    if (pipelineKey in config.pipeline) {
      const pipeline = migratedConfig.pipeline[pipelineKey];
      migratedConfig.pipeline[pipelineKey] = {
        ...pipeline,
        ...migratePipeline(pipeline),
      };
    }
  });
  return migratedConfig;
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

  log.info(
    `Migrating environment variable dependencies from "globalDependencies" and "dependsOn" to "env" in "titan.json"...`
  );

  // validate we don't have a package.json config
  const packageJsonPath = path.join(root, "package.json");
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

  // validate we have a root config
  const titanConfigPath = path.join(root, "titan.json");
  if (!existsSync(titanConfigPath)) {
    return runner.abortTransform({
      reason: `No titan.json found at ${root}. Is the path correct?`,
    });
  }

  let titanJson = readJsonSync(titanConfigPath) as TitanJsonSchema;
  if (hasLegacyEnvVarDependencies(titanJson).hasKeys) {
    titanJson = migrateConfig(titanJson);
  }

  runner.modifyFile({
    filePath: titanConfigPath,
    after: titanJson,
  });

  // find and migrate any workspace configs
  const workspaceConfigs = getTitanConfigs(root);
  workspaceConfigs.forEach((workspaceConfig) => {
    const { config, titanConfigPath: filePath } = workspaceConfig;
    if (hasLegacyEnvVarDependencies(config).hasKeys) {
      runner.modifyFile({
        filePath,
        after: migrateConfig(config),
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

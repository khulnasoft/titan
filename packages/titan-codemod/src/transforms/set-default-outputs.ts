import path from "node:path";
import { readJsonSync, existsSync } from "fs-extra";
import { type PackageJson, getTitanConfigs } from "@titan/utils";
import type { Schema as TitanJsonSchema } from "@titan/types";
import type { TransformerArgs } from "../types";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerResults } from "../runner";

const DEFAULT_OUTPUTS = ["dist/**", "build/**"];

// transformer details
const TRANSFORMER = "set-default-outputs";
const DESCRIPTION =
  'Add the "outputs" key with defaults where it is missing in `titan.json`';
const INTRODUCED_IN = "1.7.0";

function migrateConfig(config: TitanJsonSchema) {
  for (const [_, taskDef] of Object.entries(config.pipeline)) {
    if (taskDef.cache !== false) {
      if (!taskDef.outputs) {
        taskDef.outputs = DEFAULT_OUTPUTS;
      } else if (
        Array.isArray(taskDef.outputs) &&
        taskDef.outputs.length === 0
      ) {
        delete taskDef.outputs;
      }
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

  log.info(`Adding default \`outputs\` key into tasks if it doesn't exist`);
  const titanConfigPath = path.join(root, "titan.json");
  if (!existsSync(titanConfigPath)) {
    return runner.abortTransform({
      reason: `No titan.json found at ${root}. Is the path correct?`,
    });
  }

  const titanJson = readJsonSync(titanConfigPath) as TitanJsonSchema;
  runner.modifyFile({
    filePath: titanConfigPath,
    after: migrateConfig(titanJson),
  });

  // find and migrate any workspace configs
  const workspaceConfigs = getTitanConfigs(root);
  workspaceConfigs.forEach((workspaceConfig) => {
    const { config, titanConfigPath: filePath } = workspaceConfig;
    runner.modifyFile({
      filePath,
      after: migrateConfig(config),
    });
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

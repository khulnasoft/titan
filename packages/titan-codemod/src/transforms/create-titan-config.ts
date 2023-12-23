import path from "node:path";
import { readJsonSync, existsSync } from "fs-extra";
import { type PackageJson } from "@titan/utils";
import type { Schema } from "@titan/types";
import type { TransformerResults } from "../runner";
import { getTransformerHelpers } from "../utils/getTransformerHelpers";
import type { TransformerArgs } from "../types";

// transformer details
const TRANSFORMER = "create-titan-config";
const DESCRIPTION =
  'Create the `titan.json` file from an existing "titan" key in `package.json`';
const INTRODUCED_IN = "1.1.0";

export function transformer({
  root,
  options,
}: TransformerArgs): TransformerResults {
  const { log, runner } = getTransformerHelpers({
    transformer: TRANSFORMER,
    rootPath: root,
    options,
  });

  log.info(`Migrating "package.json" "titan" key to "titan.json" file...`);
  const titanConfigPath = path.join(root, "titan.json");
  const rootPackageJsonPath = path.join(root, "package.json");
  if (!existsSync(rootPackageJsonPath)) {
    return runner.abortTransform({
      reason: `No package.json found at ${root}. Is the path correct?`,
    });
  }

  // read files
  const rootPackageJson = readJsonSync(rootPackageJsonPath) as PackageJson;
  let rootTitanJson = null;
  try {
    rootTitanJson = readJsonSync(titanConfigPath) as Schema;
  } catch (err) {
    rootTitanJson = null;
  }

  // modify files
  let transformedPackageJson = rootPackageJson;
  let transformedTitanConfig = rootTitanJson;
  if (!rootTitanJson && rootPackageJson.titan) {
    const { titan: titanConfig, ...remainingPkgJson } = rootPackageJson;
    transformedTitanConfig = titanConfig;
    transformedPackageJson = remainingPkgJson;
  }

  runner.modifyFile({
    filePath: titanConfigPath,
    after: transformedTitanConfig,
  });
  runner.modifyFile({
    filePath: rootPackageJsonPath,
    after: transformedPackageJson,
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

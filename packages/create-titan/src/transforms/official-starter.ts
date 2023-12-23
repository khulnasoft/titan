import path from "node:path";
import { readJsonSync, writeJsonSync, rmSync, existsSync } from "fs-extra";
import type { PackageJson } from "@titan/utils";
import semverPrerelease from "semver/functions/prerelease";
import cliPkgJson from "../../package.json";
import { isDefaultExample } from "../utils/isDefaultExample";
import type { TransformInput, TransformResult } from "./types";
import { TransformError } from "./errors";

const meta = {
  name: "official-starter",
};

/**
 * Transform applied to "official starter" examples (those hosted within khulnasoft/titan/examples)
 **/

// eslint-disable-next-line @typescript-eslint/require-await -- must match transform function signature
export async function transform(args: TransformInput): TransformResult {
  const { prompts, example, opts } = args;

  const defaultExample = isDefaultExample(example.name);
  const isOfficialStarter =
    !example.repo ||
    (example.repo.username === "vercel" && example.repo.name === "titan");

  if (!isOfficialStarter) {
    return { result: "not-applicable", ...meta };
  }

  // paths
  const rootPackageJsonPath = path.join(prompts.root, "package.json");
  const rootMetaJsonPath = path.join(prompts.root, "meta.json");
  const hasPackageJson = existsSync(rootPackageJsonPath);

  // 1. remove meta file (used for generating the examples page on titan.build)
  try {
    rmSync(rootMetaJsonPath, { force: true });
  } catch (_err) {
    // do nothing
  }

  if (hasPackageJson) {
    let packageJsonContent;
    try {
      packageJsonContent = readJsonSync(rootPackageJsonPath) as
        | PackageJson
        | undefined;
    } catch {
      throw new TransformError("Unable to read package.json", {
        transform: meta.name,
        fatal: false,
      });
    }

    // if using the basic example, set the name to the project name (legacy behavior)
    if (packageJsonContent) {
      if (defaultExample) {
        packageJsonContent.name = prompts.projectName;
      }

      if (packageJsonContent.devDependencies?.titan) {
        const shouldUsePreRelease =
          semverPrerelease(cliPkgJson.version) !== null;
        // if the user specified a titan version, use that
        if (opts.titanVersion) {
          packageJsonContent.devDependencies.titan = opts.titanVersion;
          // if we're using a pre-release version of create-titan, use titan canary
        } else if (shouldUsePreRelease) {
          packageJsonContent.devDependencies.titan = "canary";
          // otherwise, use the latest stable version
        } else {
          packageJsonContent.devDependencies.titan = "latest";
        }
      }

      try {
        writeJsonSync(rootPackageJsonPath, packageJsonContent, {
          spaces: 2,
        });
      } catch (err) {
        throw new TransformError("Unable to write package.json", {
          transform: meta.name,
          fatal: false,
        });
      }
    }
  }

  return { result: "success", ...meta };
}

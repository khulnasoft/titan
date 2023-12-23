import type { PackageManager } from "@titan/utils";

export type CreateCommandArgument = string | undefined;

export interface CreateCommandOptions {
  packageManager?: PackageManager;
  skipInstall?: boolean;
  skipTransforms?: boolean;
  titanVersion?: string;
  example?: string;
  examplePath?: string;
}

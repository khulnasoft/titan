import type { Project } from "@titan/workspaces";
import type { TitanGeneratorCLIOptions } from "../commands/workspace";
import type { CustomGeneratorCLIOptions } from "../commands/run";

export type WorkspaceType = "app" | "package";
export interface CopyData {
  type: "internal" | "external";
  source: string;
}

export type TitanGeneratorOptions = Omit<
  TitanGeneratorCLIOptions,
  "copy" | "empty"
> & {
  copy: CopyData;
  method: "copy" | "empty";
};

export interface TitanGeneratorArguments {
  project: Project;
  opts: TitanGeneratorOptions;
}

export interface CustomGeneratorArguments {
  generator: string | undefined;
  project: Project;
  opts: CustomGeneratorCLIOptions;
}

import { type Project } from "@titan/workspaces";
import { exec } from "../utils";
import type { MigrateCommandOptions } from "../types";

export function getCurrentVersion(
  project: Project,
  opts: MigrateCommandOptions
): string | undefined {
  const { from } = opts;
  if (from) {
    return from;
  }

  // try global first
  const titanVersionFromGlobal = exec(`titan --version`, {
    cwd: project.paths.root,
  });

  if (titanVersionFromGlobal) {
    return titanVersionFromGlobal;
  }

  const { packageManager } = project;
  if (packageManager === "yarn") {
    return exec(`yarn titan --version`, { cwd: project.paths.root });
  }
  if (packageManager === "pnpm") {
    return exec(`pnpm titan --version`, { cwd: project.paths.root });
  }

  return exec(`npm exec -c 'titan --version'`, { cwd: project.paths.root });
}

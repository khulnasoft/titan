import type { ExecSyncOptions } from "node:child_process";
import type { Project } from "@titan/workspaces";
import { exec } from "../utils";

export function shutdownDaemon({ project }: { project: Project }) {
  try {
    const execOpts: ExecSyncOptions = {
      cwd: project.paths.root,
      stdio: "ignore",
    };
    // see if we have a global install
    const titanBinaryPathFromGlobal = exec(`titan bin`, execOpts);
    // if we do, shut it down
    if (titanBinaryPathFromGlobal) {
      exec(`titan daemon stop`, execOpts);
    } else {
      // call titan using the project package manager to shut down the daemon
      let command = `${project.packageManager} titan daemon stop`;
      if (project.packageManager === "npm") {
        command = `npm exec -c 'titan daemon stop'`;
      }

      exec(command, execOpts);
    }
  } catch (e) {
    // skip
  }
}

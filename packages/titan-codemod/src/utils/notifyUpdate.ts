import chalk from "chalk";
import checkForUpdate from "update-check";
import { logger } from "@titan/utils";
import { getWorkspaceDetails } from "@titan/workspaces";
import cliPkgJson from "../../package.json";

const update = checkForUpdate(cliPkgJson).catch(() => null);

export async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const { packageManager } = await getWorkspaceDetails({
        root: process.cwd(),
      });

      let upgradeCommand = "npm i -g @titan/codemod";
      if (packageManager === "yarn") {
        upgradeCommand = "yarn global add @titan/codemod";
      } else if (packageManager === "pnpm") {
        upgradeCommand = "pnpm i -g @titan/codemod";
      }

      logger.log();
      logger.log(
        chalk.yellow.bold("A new version of `@titan/codemod` is available!")
      );
      logger.log(`You can update by running: ${chalk.cyan(upgradeCommand)}`);
      logger.log();
    }
    process.exit();
  } catch (_) {
    // ignore error
  }
}

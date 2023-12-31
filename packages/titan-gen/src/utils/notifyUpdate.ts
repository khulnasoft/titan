import chalk from "chalk";
import checkForUpdate from "update-check";
import { logger } from "@titan/utils";
import cliPkgJson from "../../package.json";

const update = checkForUpdate(cliPkgJson).catch(() => null);

export async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      logger.log();
      logger.log(
        chalk.yellow.bold(
          `A new version of \`${cliPkgJson.name}\` is available!`
        )
      );
      logger.log();
    }
    process.exit();
  } catch (_) {
    // ignore error
  }
}

import chalk from "chalk";
import ora from "ora";
import gradient from "gradient-string";

const BLUE = "#0099F7";
const RED = "#F11712";
const YELLOW = "#FFFF00";

export const titanGradient = gradient(BLUE, RED);
export const titanBlue = chalk.hex(BLUE);
export const titanRed = chalk.hex(RED);
export const yellow = chalk.hex(YELLOW);

export const titanLoader = (text: string) =>
  ora({
    text,
    spinner: {
      frames: ["   ", titanBlue(">  "), titanBlue(">> "), titanBlue(">>>")],
    },
  });

export const info = (...args: Array<unknown>) => {
  log(titanBlue.bold(">>>"), ...args);
};

export const bold = (...args: Array<string>) => {
  log(chalk.bold(...args));
};

export const dimmed = (...args: Array<string>) => {
  log(chalk.dim(...args));
};

export const item = (...args: Array<unknown>) => {
  log(titanBlue.bold("  •"), ...args);
};

export const log = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- logger
  console.log(...args);
};

export const warn = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- warn logger
  console.error(yellow.bold(">>>"), ...args);
};

export const error = (...args: Array<unknown>) => {
  // eslint-disable-next-line no-console -- error logger
  console.error(titanRed.bold(">>>"), ...args);
};

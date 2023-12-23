// the "≫" symbol
const TITAN_IGNORE_PREFIX = "\u226B  ";

function info(...args: Array<unknown>) {
  // eslint-disable-next-line no-console -- logger
  console.log(TITAN_IGNORE_PREFIX, ...args);
}

function error(...args: Array<unknown>) {
  // eslint-disable-next-line no-console -- logger
  console.error(TITAN_IGNORE_PREFIX, ...args);
}

function warn(...args: Array<unknown>) {
  // eslint-disable-next-line no-console -- logger
  console.warn(TITAN_IGNORE_PREFIX, ...args);
}

function log(...args: Array<unknown>) {
  // eslint-disable-next-line no-console -- logger
  console.log(...args);
}

export { log, info, warn, error };

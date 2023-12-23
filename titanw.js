#!/usr/bin/env node

const path = require("path");

let binPath;
if (path.sep === "\\") {
  binPath = ".\\target\\debug\\titan.exe";
} else {
  binPath = "./target/debug/titan";
}

try {
  require("child_process").execFileSync(binPath, process.argv.slice(2), {
    stdio: "inherit",
  });
} catch (e) {
  if (e && e.status) process.exit(e.status);
  throw e;
}

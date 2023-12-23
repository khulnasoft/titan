module.exports = {};

function f() {
  if (!process.titanpack) {
    throw new Error("Titanpack is not enabled");
  }
  if (process.env.NODE_ENV !== "development") {
    throw new Error("NODE_ENV is not development");
  }
}

f();

// if (f.toString().includes("process.titanpack")) {
//   throw new Error("process.titanpack is not replaced");
// }

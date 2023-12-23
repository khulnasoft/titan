// b.js
export * from "./c";
// This would not be handled, but still need __titanpack__cjs__
// as there are properties dynamically added by __titanpack__cjs__ in c.js

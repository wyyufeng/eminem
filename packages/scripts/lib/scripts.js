#!/usr/bin/env node
"use strict";

const args = process.argv.slice(2);
const spawn = require("cross-spawn");

const scriptIndex = args.findIndex(x => x === "build" || x === "serve");
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const path = require("path");
if (["serve", "build", "analyse"].includes(script)) {
  const result = spawn.sync(
    "node ",
    [path.resolve(__dirname, `./${script}.js`)],
    {
      stdio: "inherit"
    }
  );
  if (result.signal) {
    if (result.signal === "SIGKILL") {
      console.log(
        "The build failed because the process exited too early. " +
          "This probably means the system ran out of memory or someone called " +
          "`kill -9` on the process."
      );
    } else if (result.signal === "SIGTERM") {
      console.log(
        "The build failed because the process exited too early. " +
          "Someone might have called `kill` or `killall`, or the system could " +
          "be shutting down."
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
}

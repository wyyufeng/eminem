#!/usr/bin/env node
const program = require("commander");
const create = require("./create");
program.usage("<command> [options]");

program
  .command("create <app-name>")
  .option(
    "--template <template>",
    "the project template('vanilla','reactapp',default is 'vanilla')"
  )
  .description("create a new project with the template")
  .action((name, arg) => {
    const template = arg.template;
    create(name, template);
  });
program
  .command("generate <schematic> <name>", "创建一个东西", {
    executableFile: "generate"
  })
  .alias("g");
program.on("command:*", function() {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  );
  process.exit(1);
});
program.parse(process.argv);

#!/usr/bin/env node
const commander = require("commander");

const ProjectCreator = require("./tasks/create");
const Generator = require("./tasks/generate");
const program = new commander.Command();
process.on("unhandledRejection", err => {
  throw err;
});
program
  .command("create <app-name>")
  .option(
    "--template <template>",
    "模板名称-vanilla:原生web项目 -reactapp:react项目"
  )
  .description("使用预设的模板创建一个新项目骨架")
  .action((name, arg) => {
    const template = arg.template;
    new ProjectCreator(name, template);
  });

program.command("generate <schematic>").action((schematic, arg) => {
  new Generator(schematic);
});

program.parse(process.argv);

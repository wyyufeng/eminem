const program = require("commander");
const chalk = require("chalk");
const { generateApp } = require("em-tasks");
program.parse(process.argv);

if (program.args.length < 2) {
  console.error(chalk.red.dim(`unvalid commands`));
  process.exit(1);
}
const [schematic, name] = program.args;

if (schematic === "app") {
  generateApp(name);
}

/*eslint no-console:0*/
const validAppName = require("validate-npm-package-name");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const { createProject } = require("./tasks/tasks");

const templateTypes = ["reactapp", "vanilla"];

module.exports = async function(projectName, template) {
  const isCurrent = projectName === ".";
  const name = isCurrent ? path.relative("../", process.cwd()) : projectName;
  const result = validAppName(name);
  const projectMeta = {};
  if (result.errors) {
    result.errors.forEach(err => {
      console.error(chalk.red.dim("Error: " + err));
      process.exit(1);
    });
  }
  const projectDir = path.resolve(process.cwd(), projectName);
  projectMeta.projectDir = projectDir;
  projectMeta.name = name;
  if (fs.existsSync(projectDir)) {
    if (isCurrent) {
      const { ok } = await inquirer.prompt([
        {
          name: "ok",
          type: "confirm",
          message: `Create project in current directory?`
        }
      ]);
      if (!ok) return;
    } else {
      const { ok } = await inquirer.prompt([
        {
          name: "ok",
          type: "confirm",
          message: `Target directory ${chalk.cyan(
            projectDir
          )} already exists. overwrite it?`
        }
      ]);
      if (!ok) {
        return;
      }
      if (ok) {
        console.log(`\nRemoving ${chalk.cyan(projectDir)}...`);
        console.log(projectDir);
        // 为啥有时候remove会失败呢
        try {
          fs.removeSync(projectDir);
          if (fs.existsSync(projectDir)) {
            fs.emptyDirSync(projectDir);
          } else {
            fs.mkdirSync(projectMeta.projectDir);
          }
        } catch (error) {
          console.log("An exception occurred while deleting the file");
          console.error(error);
        }
      }
    }
  }

  console.log();
  console.log(`Creating project ${chalk.blue(name)} in ${projectDir}`);
  if (typeof template === "undefined") {
    template = "vanilla";
  }
  if (templateTypes.every(i => i !== template)) {
    console.error(
      chalk.red.dim(`The template ${chalk.blue(template)} doesn't exists`)
    );
    process.exit(1);
  }
  projectMeta.template = template;

  try {
    createProject(projectMeta);
    console.log(
      chalk.green(`Successfully created project ${chalk.yellow(name)}.`)
    );
  } catch (error) {
    console.log(error);
  }
};

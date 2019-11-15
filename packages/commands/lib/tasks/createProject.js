const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");
const { createTemplateFile, createTemplate } = require("em-template");
const { exec } = require("child_process");
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdout.write("\n");
const project = require("./project");
function create(projectMeta) {
  // return;
  project.name = projectMeta.name;
  const template = projectMeta.template;
  // process.chdir(projectMeta.projectDir);
  createTemplate(projectMeta.projectDir);
  createTemplateFile(template, projectMeta.projectDir, "index");
  fs.writeJSONSync(path.resolve(projectMeta.projectDir, ".eminemrc"), project, {
    spaces: 4,
    replacer: null
  });

  const pkg = {
    dependencies: {
      "em-scripts": "^0.0.0"
    }
  };
  pkg.name = projectMeta.name;
  writePkg(pkg, path.resolve(projectMeta.projectDir, "package.json"));
  process.chdir(projectMeta.projectDir);
  installDeps();
}

function writePkg(pkg, dest) {
  fs.writeJSONSync(dest, pkg, {
    spaces: 4,
    replacer: null
  });
}

function installDeps() {
  process.stdout.write("\n");
  // eslint-disable-next-line no-console
  const o = ora("Installing dependencies!").start();
  exec("npm install --registry https://registry.npm.taobao.org", err => {
    if (!err) {
      process.stdout.write("\n");
      o.succeed("Installation is complete,Enjoy it!");
    } else {
      process.stdout.write("\n");
      o.fail("Installation failed!");
    }
    process.exit(0);
  });
}

module.exports = create;

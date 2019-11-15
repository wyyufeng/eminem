const path = require("path");
const chalk = require("chalk");
const fse = require("fs-extra");
const { resolvePath, updatercFile } = require("em-utils");
const { createTemplateFile } = require("em-template");
function generate(name) {
  const appDir = resolvePath("./src/app");
  const eminemrc = resolvePath("./.eminemrc");
  if (!fse.existsSync(appDir)) {
    console.error(chalk.red.dim(`unvalid dir`));
    process.exit(1);
  }
  const rcJson = fse.readJSONSync(eminemrc);
  if (rcJson.pages.some(i => i.page === name)) {
    console.error(chalk.red.dim(`same name page`));
    process.exit(1);
  }
  const page = {
    page: name,
    entry: "index.js",
    template: "index.html"
  };
  rcJson.pages.push(page);

  const dest = path.resolve(appDir, `./${name}`);
  if (fse.existsSync(dest)) {
    console.log();
    console.error(`${name} already exists`);
    process.exit(1);
  }
  fse
    .mkdir(dest)
    .catch(err => {
      console.log(err);
    })
    .then(() => {
      createTemplateFile("vanilla", process.cwd(), name);
      updatercFile(rcJson);
    });
}
module.exports = generate;

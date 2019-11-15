const fs = require("fs-extra");
const path = require("path");
function createTemplateFile(type, projectDir, name) {
  const dest = path.resolve(projectDir, `./src/app/${name}/`);
  const publicDir = path.resolve(projectDir, "./public");
  if (type === "vanilla") {
    fs.copyFileSync(
      path.resolve(__dirname, "./index.vanilla.js"),
      path.resolve(dest, "./index.js")
    );
    fs.copyFileSync(
      path.resolve(__dirname, "./index.html"),
      path.resolve(publicDir, `./${name}.html`)
    );
  }
}

function createTemplate(projectDir) {
  fs.copySync(path.resolve(__dirname, "./structure"), path.resolve(projectDir));
}
module.exports = { createTemplateFile, createTemplate };

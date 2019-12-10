const fs = require("fs-extra");
const path = require("path");
process.on("unhandledRejection", err => {
  throw err;
});
class Task {
  constructor() {
    this._projectRoot = process.cwd();
  }

  get projectRoot() {
    if (fs.existsSync(path.resolve(this._projectRoot, ".eminemrc"))) {
      return this._projectRoot;
    }
    throw Error("嘤嘤嘤~~当前不是eminem的工作目录！");
  }

  getDir(dest) {
    return path.resolve(this.projectRoot, dest);
  }
  getAppDir(appName) {
    return this.getDir(`src/app/${appName}`);
  }
  getConfig() {
    return fs.readJSONSync(this.getDir(".eminemrc"));
  }
  writeConfig(data) {
    return fs.writeJSONSync(this.getDir(".eminemrc"), data, {
      spaces: 4,
      replacer: null
    });
  }
}

module.exports = Task;

const fs = require("fs-extra");
const path = require("path");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const semver = require("semver");
const util = {
  paths: {
    get appPath() {
      return appDirectory;
    },
    get appSrc() {
      return resolveApp("src");
    },
    get appBuild() {
      const buildDir = resolveApp(`build${util.version.current()}`);
      if (fs.existsSync(buildDir)) {
        return buildDir;
      } else {
        fs.mkdirSync(buildDir);
        return buildDir;
      }
    },
    get appBuildFileName() {
      return `build${util.version.current()}`;
    },
    get dotEnv() {
      return resolveApp(".");
    }
  },
  version: {
    current() {
      const emrc = fs.readJSONSync(resolveApp(".eminemrc"));
      return emrc.version;
    },
    inc() {
      const emrc = fs.readJSONSync(resolveApp(".eminemrc"));
      const nextVersion = semver.inc(emrc.version, "major");
      emrc.version = nextVersion;
      fs.writeJSONSync(resolveApp(".eminemrc"), emrc, {
        replacer: null,
        spaces: 4
      });
    }
  },
  resolveApp
};

module.exports = util;

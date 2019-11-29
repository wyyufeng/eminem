process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
process.on("unhandledRejection", err => {
  throw err;
});

const { base, prod } = require("../config");
const context = require("../config/context");
const webpack = require("webpack");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const FileSizeReporter = require("react-dev-utils/FileSizeReporter");
const printBuildError = require("react-dev-utils/printBuildError");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;
let project;
try {
  project = fs.readJSONSync(resolveApp(".eminemrc"));
} catch (error) {
  console.log();
  console.error("嘤嘤嘤~~当前不是eminem的工作目录！");
  process.exit(1);
}
project.isEnvProduction = true;
project.isEnvDevelopment = false;
project.appDirectory = appDirectory;

let compiler;
const ctxWrapper = Object.keys(Object.assign(base, prod))
  .map(k => base[k](project))
  .reduceRight((a, b) => {
    return ctx => a(b(ctx));
  });

try {
  compiler = webpack(ctxWrapper(context).toConfig());
} catch (err) {
  console.log(chalk.red("Failed to compile."));
  console.log();
  console.log(err.message || err);
  console.log();
  process.exit(1);
}

measureFileSizesBeforeBuild(path.resolve(appDirectory, "build")).then(
  preSize => {
    fs.emptyDirSync(path.resolve(appDirectory, "build"));
    console.log("正在构建生产环境包...");
    compiler.run((err, stats) => {
      if (err) {
        console.log(err.message);
        process.exit(1);
      }

      console.log("编译文件大小变化:\n");
      printFileSizesAfterBuild(
        stats,
        preSize,
        path.resolve(appDirectory, "build"),
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );
      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
    });
  }
);

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
process.on("unhandledRejection", err => {
  throw err;
});

const { base, prod } = require("../config");
const context = require("../config/context");
const webpack = require("webpack");
const filesize = require("filesize");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const gzipSize = require("gzip-size");
const flatten = require("array-flatten").flatten;
const WARN_AFTER_BUNDLE_GZIP_SIZE = 200 * 1024; //kb
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

build();

function build() {
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
  const buildDir = path.resolve(appDirectory, "build");
  fs.emptyDirSync(buildDir);
  console.log("正在构建生产环境包...");
  compiler.run((err, stats) => {
    if (err) {
      console.log(`嘤嘤嘤~ 构建失败！`);
      console.log(err.message);
      process.exit(1);
    }
    const info = stats.toJson();

    if (stats.hasErrors()) {
      return console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    printFileSize(buildDir);
    fs.writeJSON("./stats.json", stats.toJson());
  });
}

function printFileSize(dir) {
  const fileSizes = measureFileSize(dir);
  const result = flatten(fileSizes);
  const msg = result.reduce((a, b) => {
    const str = chalk.greenBright(`${filesize(b.size)}  ${b.file} \n`);
    a = a + str;
    return a;
  }, "");
  console.log();
  console.log("文件Gzip后大小：");
  console.log();
  console.log(msg);
  console.log();
  const warnChunks = result.filter(
    file => file.size > WARN_AFTER_BUNDLE_GZIP_SIZE
  );
  if (warnChunks.length > 0) {
    console.log(
      chalk.yellowBright("当前构建文件过大(200kb),可能会影响网站加载速度：")
    );
    warnChunks.forEach(i => {
      console.log(`${chalk.yellowBright(i.file)} \n`);
    });
    console.log("建议采取以下措施减少文件大小：");
    console.log("1.将过大的bundle拆分为更小的chunk，并使用懒加载");
    console.log("2.压缩图片");
    console.log(
      `3.通过使用${chalk.blue(
        "npm run analyse"
      )} 查看过大的第三方library，并尝试使用数量更少/体积更小的 library`
    );
  }
}
function measureFileSize(file) {
  const fileStats = fs.statSync(file);
  if (fileStats.isDirectory()) {
    return fs.readdirSync(file).map(f => {
      const fStats = fs.statSync(path.resolve(file, f));
      if (fStats.isDirectory()) {
        return measureFileSize(path.resolve(file, f));
      } else {
        return {
          file: path.resolve(file, f).split("build")[1],
          size: gzipSize.fileSync(path.resolve(file, f))
        };
      }
    });
  } else {
    return {
      file: file,
      size: gzipSize.fileSync(file)
    };
  }
}
module.exports = build;

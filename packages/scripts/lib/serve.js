"use strict";

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.on("unhandledRejection", err => {
  throw err;
});
// const { execFile } = require("child_process");
// const cwebp = require("cwebp-bin");
const { dev, base } = require("../config");
const context = require("../config/context");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const fs = require("fs-extra");

const chalk = require("chalk");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const util = require("./util");
const {
  choosePort,
  prepareUrls
} = require("react-dev-utils/WebpackDevServerUtils");
const clearConsole = require("react-dev-utils/clearConsole");
let project;
try {
  project = fs.readJSONSync(util.resolveApp(".eminemrc"));
} catch (error) {
  console.log();
  console.error("嘤嘤嘤~~当前不是eminem的工作目录！");
  process.exit(1);
}

// 记录当前环境
function setup() {
  project.isEnvProduction = false;
  project.isEnvDevelopment = true;
  project.appDirectory = util.paths.appPath;
  project.appSrc = util.paths.appSrc;
}
const port = 3000;
const host = "0.0.0.0";
setup();

choosePort(host, port).then(port => {
  if (port == null) {
    return;
  }
  const urls = prepareUrls("http", host, port);
  project.urls = urls;
  //compose context
  const ctxWrapper = Object.keys(base)
    .map(k => base[k](project))
    .reduceRight((a, b) => {
      return ctx => a(b(ctx));
    });

  let compiler;
  let isFirstCompile = true;
  try {
    // console.log(JSON.stringify(ctxWrapper(context).toConfig(), null, 4));
    compiler = webpack(ctxWrapper(context).toConfig());
  } catch (err) {
    console.log(chalk.red("Failed to compile."));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }
  compiler.hooks.invalid.tap("invalid", () => {
    clearConsole();
    console.log("Compiling...");
  });
  compiler.hooks.done.tap("done", async () => {
    if (isFirstCompile) {
      console.log("项目启动成功，访问如下地址即可访问页面：");
      console.log();
      console.log(chalk.blueBright(`局域网:  -  ${urls.lanUrlForTerminal}`));
      console.log(chalk.blueBright(`本  机:  -  ${urls.localUrlForBrowser}`));
      isFirstCompile = false;
    }
  });
  const devServer = new WebpackDevServer(
    compiler,
    dev
      .devServer(project)(context)
      .toConfig().devServer
  );
  devServer.listen(port, host, err => {
    if (err) {
      return console.log(err);
    }

    console.log(chalk.greenBright("Starting the development server...\n"));
  });
});

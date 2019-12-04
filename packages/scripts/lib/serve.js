"use strict";

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.on("unhandledRejection", err => {
  throw err;
});

const { dev, base } = require("../config");
const context = require("../config/context");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const printBuildError = require("react-dev-utils/printBuildError");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const {
  choosePort,
  prepareUrls
} = require("react-dev-utils/WebpackDevServerUtils");
const clearConsole = require("react-dev-utils/clearConsole");
let project;
try {
  project = fs.readJSONSync(resolveApp(".eminemrc"));
} catch (error) {
  console.log();
  console.error("嘤嘤嘤~~当前不是eminem的工作目录！");
  process.exit(1);
}
// 记录当前环境
project.isEnvProduction = false;
project.isEnvDevelopment = true;
project.appDirectory = appDirectory;
const port = 3000;
const host = "0.0.0.0";

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
  compiler.hooks.done.tap("done", async stats => {
    const statsData = stats.toJson({
      all: false,
      errors: true
    });
    const messages = formatWebpackMessages(statsData);
    if (stats.hasErrors()) {
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red("Failed to compile.\n"));
      console.log(messages.errors.join("\n\n"));
      return;
    }
    if (stats.hasWarnings()) {
      console.log(chalk.yellow("Compiled with warnings.\n"));
      console.log(messages.warnings.join("\n\n"));
    }
    if (isFirstCompile) {
      console.log("项目启动成功，运行在如下地址：");
      console.log();
      console.log(chalk.blueBright(`局域网:  -  ${urls.lanUrlForTerminal}`));
      console.log(chalk.blueBright(`本  机:  -  ${urls.localUrlForBrowser}`));
      isFirstCompile = false;
    } else {
      console.log(chalk.greenBright("Compiled successfully!"));
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

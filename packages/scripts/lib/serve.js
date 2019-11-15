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
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const {
  choosePort,
  prepareUrls
} = require("react-dev-utils/WebpackDevServerUtils");
const project = fs.readJSONSync(resolveApp(".eminemrc"));

project.isEnvProduction = false;
project.isEnvDevelopment = true;

const { host, port } = project;
const urls = prepareUrls("http", project.host, port);
project.urls = urls;
//compose context
const ctxWrapper = Object.keys(base)
  .map(k => base[k](project))
  .reduceRight((a, b) => {
    return ctx => a(b(ctx));
  });

choosePort(host, port).then(port => {
  if (port == null) {
    return;
  }
  let compiler;
  try {
    compiler = webpack(ctxWrapper(context).toConfig());
    console.log(ctxWrapper(context).toConfig());
  } catch (err) {
    console.log(chalk.red("Failed to compile."));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

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

    console.log(chalk.cyan("Starting the development server...\n"));
  });
});

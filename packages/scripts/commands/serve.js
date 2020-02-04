'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.on('unhandledRejection', (err) => {
    throw err;
});

const { dev, base } = require('../config');
const context = require('../config/context');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const fs = require('fs-extra');
const openBrowser = require('react-dev-utils/openBrowser');
const chalk = require('chalk');
const util = require('./util');
const { choosePort, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
let project;
try {
    project = fs.readJSONSync(util.resolveApp('.eminemrc'));
} catch (error) {
    console.log();
    console.error('嘤嘤嘤~~当前不是eminem的工作目录！');
    process.exit(1);
}

// 记录当前环境
function setup() {
    project.version = util.version.current();
    project.isEnvProduction = false;
    project.isEnvDevelopment = true;
    project.appDirectory = util.paths.appPath;
    project.appSrc = util.paths.appSrc;
    project.appPublic = util.paths.appPublic;
}
const port = 3000;
const host = '0.0.0.0';
setup();

choosePort(host, port).then((port) => {
    if (port == null) {
        return;
    }
    const urls = prepareUrls('http', host, port);
    project.urls = urls;

    //compose context
    const ctxMiddlewares = Object.keys(base).map((k) => base[k](project));
    const emCfgPath = util.resolveApp('em.config.js');
    if (fs.existsSync(emCfgPath)) {
        ctxMiddlewares.push(require(emCfgPath)(project));
    }
    const ctxWrappers = ctxMiddlewares.reduceRight((a, b) => {
        return (ctx) => a(b(ctx));
    });
    let compiler;
    let isFirstCompile = true;
    try {
        // console.log(JSON.stringify(ctxWrapper(context).toConfig(), null, 4));
        compiler = webpack(ctxWrappers(context).toConfig());
    } catch (err) {
        console.log(err.message || err);
        process.exit(1);
    }

    compiler.hooks.failed.tap('failed', (err) => {
        console.log(err);
    });
    compiler.hooks.done.tap('done', async () => {
        if (isFirstCompile) {
            console.log('项目启动成功，可通过如下地址访问：');
            console.log();
            console.log(chalk.blueBright(`局域网 :  -  ${urls.lanUrlForTerminal}`));
            console.log(chalk.blueBright(`本 机 :  -  ${urls.localUrlForBrowser}`));
            isFirstCompile = false;
        }
    });
    const devServer = new WebpackDevServer(
        compiler,
        dev
            .devServer(project)(context)
            .toConfig().devServer
    );
    devServer.listen(port, host, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(chalk.greenBright('正在启动开发服务器......\n'));
        openBrowser(urls.localUrlForBrowser);
    });
});

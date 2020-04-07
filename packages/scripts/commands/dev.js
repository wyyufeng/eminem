'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.on('unhandledRejection', (err) => {
    throw err;
});
require('../config/env');
const { dev, base } = require('../config');
const context = require('../config/context');
const WebpackDevServer = require('webpack-dev-server');
const fs = require('fs-extra');
const openBrowser = require('react-dev-utils/openBrowser');
const chalk = require('chalk');
const paths = require('../utils/paths');
const version = require('../utils/version');
const validate = require('schema-utils');

const createCompiler = require('../utils/createCompiler');
const { choosePort, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
let project;
try {
    project = fs.readJSONSync(paths.resolveApp('eminem.json'));
    validate(require('../utils/project.json'), project);
} catch (error) {
    console.log(error.message);
    console.log();
    console.error('嘤嘤嘤~~eminem.json好像有点问题！');
    process.exit(1);
}

// 记录当前环境
function setup() {
    project.version = version.current();
    project.isEnvProduction = false;
    project.isEnvDevelopment = true;
    project.appPath = paths.appPath;
    project.appSrc = paths.appSrc;
    project.appPublic = paths.appPublic;
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
    const compiler = createCompiler(base, project, context);

    let isFirstCompile = true;
    compiler.hooks.failed.tap('failed', (err) => {
        console.log(err);
    });
    compiler.hooks.done.tap('done', async (stats) => {
        const isSuccessful = !stats.hasErrors();
        if (isFirstCompile && isSuccessful) {
            console.log('项目启动成功，可通过如下地址访问：');
            console.log();
            console.log(chalk.blueBright(`局域网 :  - ${urls.lanUrlForTerminal}`));
            console.log(chalk.blueBright(`本  机 :  - ${urls.localUrlForBrowser}`));
            isFirstCompile = false;
        }
    });
    const devServer = new WebpackDevServer(
        compiler,
        dev.devServer(project)(context).toConfig().devServer
    );
    devServer.listen(port, host, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(chalk.greenBright('正在启动开发服务器......\n'));

        openBrowser(urls.localUrlForBrowser);
    });
});

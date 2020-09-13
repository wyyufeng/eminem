'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
    throw err;
});
const fs = require('fs');
const WebpackFinalConfig = require('../core/WebpackFinalConfig');
const {
    choosePort,
    createCompiler,
    prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const argv = require('yargs-parser')(process.argv.slice(2));
const webpack = require('webpack');
const version = require('../util/version');

const options = {};
const defaultPort = argv.port || 3000;
const host = '0.0.0.0';
const protocol = 'http';

function setupOptions() {
    options.port = defaultPort;
    options.host = host;
    options.version = version.current();
    options.appName = process.env.npm_package_name || 'web_app';
    options.tscError = argv.tscerror || true;
}

setupOptions();

choosePort(host, defaultPort).then((port) => {
    options.port = port;
    options.protocol = protocol;
    const urls = prepareUrls(options.protocol, options.host, options.port);
    options.urls = urls;

    const webpackFinalConfig = new WebpackFinalConfig(options);
    const useYarn = fs.existsSync(webpackFinalConfig.paths.yarnLockFile);
    const useTypeScript = fs.existsSync(webpackFinalConfig.paths.tsConfig);

    const finalConfig = webpackFinalConfig.toWebpack();

    const devSocket = {
        warnings: (warnings) => devServer.sockWrite(devServer.sockets, 'warnings', warnings),
        errors: (errors) => devServer.sockWrite(devServer.sockets, 'errors', errors)
    };
    const compiler = createCompiler({
        appName: options.appName,
        config: finalConfig,
        devSocket,
        urls: options.urls,
        useYarn,
        useTypeScript,
        tscCompileOnError: options.tscError,
        webpack
    });
    const devServerConfig = finalConfig.devServer;

    delete finalConfig.devServer;

    const devServer = new WebpackDevServer(compiler, devServerConfig);

    devServer.listen(port, host, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(chalk.cyan('Starting the development server...\n'));
    });
});

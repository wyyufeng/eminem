'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
    throw err;
});
const paths = require('../core/paths');
const fs = require('fs');
const logSymbols = require('log-symbols');
const WebpackFinalConfig = require('../core/WebpackFinalConfig');
const { choosePort, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const argv = require('yargs-parser')(process.argv.slice(2));
const webpack = require('webpack');
const version = require('../util/version');
const clearConsole = require('react-dev-utils/clearConsole');
const formatMessages = require('react-dev-utils/formatWebpackMessages');
const options = {};
const defaultPort = argv.port || 3000;
const host = '0.0.0.0';
const protocol = 'http';

function setupOptions() {
    options.port = defaultPort;
    options.host = host;
    options.version = version.current();
    options.appName = process.env.npm_package_name || 'web_app';
}

setupOptions();

choosePort(host, defaultPort).then((port) => {
    if (port === null) {
        process.exit(1);
    }
    options.port = port;
    options.protocol = protocol;
    const urls = prepareUrls(options.protocol, options.host, options.port);
    options.urls = urls;
    const useTypescript = fs.existsSync(paths.tsConfig);
    options.useTypescript = useTypescript;
    const webpackFinalConfig = new WebpackFinalConfig(options, paths);

    const finalConfig = webpackFinalConfig.toWebpack();

    const devServerConfig = finalConfig.devServer;
    delete finalConfig.devServer;
    const compiler = webpack(finalConfig);
    const devServer = new WebpackDevServer(compiler, devServerConfig);
    let isFirstCompile = true;
    compiler.hooks.invalid.tap('invalid', () => {
        clearConsole();
        console.log('Compiling...');
    });
    compiler.hooks.done.tap('done', (stats) => {
        const statsData = stats.toJson({
            all: false,
            warnings: true,
            errors: true
        });
        clearConsole();
        const messages = formatMessages(statsData);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;
        if (isSuccessful) {
            console.log(chalk.greenBright('Compiled successfully!'));
            console.log(logSymbols.success, chalk.greenBright('Compiled successfully!'));
        }

        if (messages.errors.length) {
            console.log(chalk.redBright('Failed to compile.'));
            console.log(logSymbols.error, chalk.redBright('Failed to compile.'));
            messages.errors.forEach((e) => console.log(e));
            return;
        }

        if (messages.warnings.length) {
            console.log(logSymbols.warning, chalk.yellowBright('Compiled with warnings.'));
            messages.warnings.forEach((w) => console.log(w));
        }
        if (isFirstCompile && isSuccessful) {
            console.log();
            console.log(`You can now view your application in the browser.`);
            console.log();
            console.log(`  ${chalk.bold('Local:')}            ${urls.localUrl}`);
            console.log(`  ${chalk.bold('On Your Network:')}  ${urls.lanUrl}`);
            console.log();
        }
        isFirstCompile = false;
    });
    devServer.listen(port, host, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(chalk.cyan('Starting the development server...\n'));
    });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
        process.on(sig, function () {
            devServer.close();
            process.exit();
        });
    });
});

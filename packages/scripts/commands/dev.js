'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
    throw err;
});
const logSymbols = require('log-symbols');
const { WebpackFinalConfig } = require('@eminemjs/core');
const formatMessages = require('webpack-format-messages');
const WebpackDevServer = require('webpack-dev-server');
const portfinder = require('portfinder');
const createCompiler = require('../util/createCompiler');
const { formatAddress } = require('../util/formatAddress');
const clearConsole = require('../util/clearConsole');
const chalk = require('chalk');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const version = require('../util/version');

const args = {};
const port = 3000;
const host = '0.0.0.0';
const protocol = 'http';

function setupArgs() {
    args.port = port;
    args.host = host;
    args.NODE_ENV = process.env.NODE_ENV;
    args.version = version.current();
}

setupArgs();

portfinder.getPortPromise({ host, port }).then((p) => {
    if (p == null) {
        return console.error('\n no free port');
    }
    if (port !== p) {
        console.warn(`\n The port ${port} is busy and will fallback to ${p}`);
    }
    const urls = formatAddress(p, protocol);
    args.port = p;
    args.urls = urls;
    args.protocol = protocol;
    const webpackFinalCompiler = new WebpackFinalConfig(args);
    const finalConfig = webpackFinalCompiler.toWebpack();
    const compiler = createCompiler(finalConfig);
    const devServerOptions = finalConfig.devServer;

    delete finalConfig.devServer;
    let isFirstCompile = true;

    const devServer = new WebpackDevServer(compiler, devServerOptions);

    compiler.hooks.done.tap('done', (stats) => {
        clearConsole();
        const messages = formatMessages(stats);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;
        if (isSuccessful) {
            console.log(logSymbols.success, chalk.greenBright('Compiled successfully!'));
        }

        if (messages.errors.length) {
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

    devServer.listen(p, host, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(`${chalk.blueBright('The dev server is starting...')}`);
    });
});

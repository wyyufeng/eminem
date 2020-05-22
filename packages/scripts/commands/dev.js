'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
    throw err;
});

const { WebpackFinalConfig } = require('@eminemjs/core');
const formatMessages = require('webpack-format-messages');
const WebpackDevServer = require('webpack-dev-server');
const getPort = require('get-port');
const createCompiler = require('../util/createCompiler');
const { formatAddress } = require('../util/formatAddress');
const chalk = require('chalk');
const options = {};
const port = 3000;
const host = '0.0.0.0';
const protocol = 'http';

function setupOptions() {
    options.port = port;
    options.host = host;
    options.isEnvProduction = false;
    options.isEnvDevelopment = true;
}

setupOptions();

getPort({ host, port }).then((p) => {
    if (p == null) {
        return console.error('\n no free port');
    }
    if (port !== p) {
        console.warn(`\n The port ${port} is busy and will use ${p}`);
    }
    const urls = formatAddress(p, protocol);
    options.port = p;
    options.urls = urls;
    options.protocol = protocol;
    const webpackFinalCompiler = new WebpackFinalConfig(options);
    const finalConfig = webpackFinalCompiler.toWebpack();
    const compiler = createCompiler(finalConfig);

    const devServerOptions = finalConfig.devServer;

    delete finalConfig.devServer;
    const devServer = new WebpackDevServer(compiler, devServerOptions);

    compiler.hooks.done.tap('done', (stats) => {
        const messages = formatMessages(stats);

        if (!messages.errors.length && !messages.warnings.length) {
            console.log(chalk.greenBright('Compiled successfully!'));
        }

        if (messages.errors.length) {
            console.log(chalk.redBright('Failed to compile.'));
            messages.errors.forEach((e) => console.log(e));
            return;
        }

        if (messages.warnings.length) {
            console.log(chalk.yellowBright('Compiled with warnings.'));
            messages.warnings.forEach((w) => console.log(w));
        }
    });

    devServer.listen(p, host, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(`${chalk.blueBright('The dev server is starting...')}`);
    });
});

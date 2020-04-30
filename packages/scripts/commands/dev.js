'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
    throw err;
});

const { WebpackFinalConfig } = require('@eminemjs/core');
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

getPort({ host, port }).then((port) => {
    if (port == null) {
        return console.error('\n no free port');
    }
    const urls = formatAddress(port, protocol);
    options.port = port;
    options.urls = urls;
    options.protocol = protocol;
    const webpackFinalCompiler = new WebpackFinalConfig(options);
    const finalConfig = webpackFinalCompiler.toWebpack();
    const compiler = createCompiler(finalConfig);

    const devServerOptions = finalConfig.devServer;

    delete finalConfig.devServer;

    const devServer = new WebpackDevServer(compiler, devServerOptions);
    devServer.listen(port, host, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(`${chalk.blueBright('The dev server is starting...')}`);
    });
});

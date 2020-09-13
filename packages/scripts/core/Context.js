'use strict';

const WebpackChain = require('webpack-chain');

class Context extends WebpackChain {
    constructor(webpackEnv, paths, config) {
        super();
        this.webpackEnv = webpackEnv;
        this.paths = paths;
        this.config = config;
        this.buildVersion = config.buildVersion;
        this.buildTime = new Date().toLocaleString();
        this.isEnvProduction = webpackEnv === 'production';
        this.isEnvDevelopment = webpackEnv === 'development';
    }
}
module.exports = Context;

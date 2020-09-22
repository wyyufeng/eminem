'use strict';
const fs = require('fs');
const path = require('path');
const Context = require('./Context');
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => {
    return path.resolve(appDirectory, relativePath);
};

const isFunction = (source) => typeof source === 'function';
class WebpackFinalConfig {
    constructor(scriptsOptions, paths) {
        this.configPath = resolvePath('.emrc.js');
        const userConfig = require(this.configPath);

        this.userConfig = userConfig;
        this.options = scriptsOptions;

        this.middlewareMap = new Map();
        this.paths = paths;
        const env = this.parseEnv(this.paths.dotEnv);
        const config = Object.assign(this.userConfig, { env: env }, scriptsOptions);
        this.context = new Context(process.env.NODE_ENV, this.paths, config);
    }
    parseEnv(dotEnvPath) {
        const dotenvFiles = [`${dotEnvPath}.${process.env.NODE_ENV}`].filter(Boolean);
        dotenvFiles.forEach((dotenvFile) => {
            if (fs.existsSync(dotenvFile)) {
                require('dotenv-expand')(
                    require('dotenv').config({
                        path: dotenvFile
                    })
                );
            }
        });

        const raw = Object.keys(process.env)
            .filter((env) => {
                return env.includes('ENV_');
            })
            .reduce(
                (env, key) => {
                    env[key] = process.env[key];
                    return env;
                },
                {
                    NODE_ENV: process.env.NODE_ENV || 'development',
                    APP_VERSION: this.options.version,
                    APP_NAME: this.options.appName
                }
            );
        const stringified = {
            'process.env': Object.keys(raw).reduce((env, key) => {
                env[key] = JSON.stringify(raw[key]);
                return env;
            }, {})
        };

        return {
            raw,
            stringified
        };
    }

    computeFinalContext() {
        const { use } = this.userConfig;

        // 如果是函数，将重写整个context
        try {
            if (isFunction(use)) {
                return use(this.context);
            }
            if (Array.isArray(use)) {
                use.reduce((a, b) => {
                    return (ctx) => b(a(ctx));
                })(this.context);
            } else {
                use(this.context);
            }
        } catch (error) {
            console.error('\nAn error occurred when loading the middleware.\n');
            console.log();
            console.error(error);
            process.exit(1);
        }
        return this.context;
    }
    toWebpack() {
        const finalContext = this.computeFinalContext();
        return finalContext.toConfig();
    }
}

module.exports = WebpackFinalConfig;

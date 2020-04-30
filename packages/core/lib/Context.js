'use strict';

const fs = require('fs');
const path = require('path');
const WebpackChain = require('webpack-chain');
const extensions = require('./extensions');
const appDirectory = fs.realpathSync(process.cwd());

/**
 * @extends WebpackChain
 */
class Context extends WebpackChain {
    /**
     *Creates an instance of Context.
     * @param {Object} options
     * @memberof Context
     */
    constructor(options) {
        super();

        const NODE_ENV = process.env.NODE_ENV;
        if (!NODE_ENV) {
            throw new Error('The NODE_ENV environment variable is required but was not specified.');
        }

        this.options = options;
        this.paths = {};
        this.extensions = extensions;
        this.env = { raw: {}, stringified: '' };
        this.NODE_ENV = NODE_ENV;
        this.parseEnv();
        this.setupPaths();
    }
    resolveApp(relativePath) {
        return path.resolve(appDirectory, relativePath);
    }
    parseEnv() {
        const dotenvFiles = [`${this.paths.dotEnv}.${this.NODE_ENV}`].filter(Boolean);
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
                    NODE_ENV: process.env.NODE_ENV || 'development'
                    // PUBLIC_URL: publicUrl
                }
            );
        const stringified = {
            'process.env': Object.keys(raw).reduce((env, key) => {
                env[key] = JSON.stringify(raw[key]);
                return env;
            }, {})
        };
        this.env.raw = raw;
        this.env.stringified = stringified;
    }
    setupPaths() {
        this.paths.appSource = this.resolveApp('src');
        this.paths.appPublic = this.resolveApp('public');
        this.paths.appOutput = this.resolveApp('build');
        this.paths.nodeModules = this.resolveApp('node_modules');
        this.paths.dotEnv = this.resolveApp('.env');
    }
    getRegexFromExt(type) {
        if (typeof type === 'undefined') {
            return Object.keys(this.extensions).map((_type) => {
                return this.getRegexFromExt(_type);
            });
        }
        const extensions = this.extensions[type];
        if (extensions.length === 1) return new RegExp(String.raw`\.${extensions[0]}$`);
        return new RegExp(String.raw`\.(${extensions.join('|')})$`);
    }
}
module.exports = Context;

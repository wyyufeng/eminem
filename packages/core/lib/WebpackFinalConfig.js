const fs = require('fs');
const path = require('path');
const Context = require('./Context');
const extensions = require('./extensions');
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => {
    return path.resolve(appDirectory, relativePath);
};

const isFunction = (source) => typeof source === 'function';
class WebpackFinalConfig {
    constructor(scriptsArgs) {
        const NODE_ENV = process.env.NODE_ENV;
        if (!NODE_ENV) {
            throw new Error('The NODE_ENV environment variable is required but was not specified.');
        }

        this.configPath = resolvePath('.emrc.js');
        const userConfig = require(this.configPath);

        this.config = userConfig;

        this.extensions = extensions;

        this.middlewareMap = new Map();
        const paths = this.setupPaths();
        const contextOptions = {
            paths: paths,
            env: this.parseEnv(paths),
            apps: userConfig.apps,
            shouldUseSourceMap: userConfig.sourceMap,
            strict: typeof userConfig.strict === 'undefined' ? true : userConfig.strict,
            ...scriptsArgs
        };
        this.context = new Context(
            NODE_ENV,
            contextOptions,
            contextOptions.paths,
            extensions,
            contextOptions.env
        );
    }
    parseEnv(paths) {
        const dotenvFiles = [`${paths.dotEnv}.${this.NODE_ENV}`].filter(Boolean);
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

        return {
            raw,
            stringified
        };
    }
    setupPaths() {
        const paths = {};
        paths.appSource = resolvePath('src');
        paths.appPublic = resolvePath('public');
        paths.appOutput = resolvePath('build');
        paths.nodeModules = resolvePath('node_modules');
        paths.dotEnv = resolvePath('.env');
        return paths;
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
    computeFinalContext() {
        const { use } = this.config;

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

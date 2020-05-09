const fs = require('fs');
const path = require('path');
const Context = require('./Context');
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => {
    return path.resolve(appDirectory, relativePath);
};

const isFunction = (source) => typeof source === 'function';
class WebpackFinalConfig {
    constructor(envVars) {
        this.configPath = resolvePath('.emrc.js');
        const userConfig = require(this.configPath);

        this.config = require(this.configPath);
        this.config.shouldUseSourceMap = userConfig.sourceMap;
        this.middlewareMap = new Map();
        this.context = new Context({ ...this.config, ...envVars });
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
                    b(a(this.context));
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
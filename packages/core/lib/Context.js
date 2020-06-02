'use strict';

const WebpackChain = require('webpack-chain');

/**
 * @extends WebpackChain
 */
class Context extends WebpackChain {
    /**
     *Creates an instance of Context.
     * @param {Object} options
     * @memberof Context
     */
    constructor(NODE_ENV, options, paths, extensions, env) {
        super();

        this.options = options;
        this.paths = paths || {};
        this.extensions = extensions || {};
        this.env = env || { raw: {}, stringified: '' };
        this.NODE_ENV = NODE_ENV;
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

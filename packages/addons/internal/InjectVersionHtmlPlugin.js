const HtmlWebpackPlugin = require('html-webpack-plugin');

class InjectVersionHtmlPlugin {
    constructor({ version = 'unknown', buildTime = 'unknown' } = {}) {
        this.version = version;
        this.buildTime = buildTime;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('InjectVersionHtmlPlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
                'InjectVersionHtmlPlugin',
                ({ assetTags }) => {
                    assetTags.scripts.push({
                        tagName: 'script',
                        innerHTML: `console.log('%c v${this.version},build on ${this.buildTime}', 'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');`
                    });
                }
            );
        });
    }
}

module.exports = InjectVersionHtmlPlugin;

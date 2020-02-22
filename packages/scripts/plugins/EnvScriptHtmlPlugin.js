const cheerio = require('cheerio');
class EnvScriptPlugin {
    constructor(htmlWebpackPlugin) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('EnvScriptPlugin', (compilation) => {
            const hooks = this.htmlWebpackPlugin.getHooks(compilation);
            hooks.afterTemplateExecution.tap('EnvScriptPlugin', (assets) => {
                const $ = cheerio.load(assets.html);
                const env = process.env.NODE_ENV || '';
                if (env === 'development') {
                    $(`[data-production]`).remove();
                }
                if (env === 'production') {
                    $(`[data-development]`).remove();
                }
                assets.html = $.root().html();
            });
        });
    }
}
module.exports = EnvScriptPlugin;

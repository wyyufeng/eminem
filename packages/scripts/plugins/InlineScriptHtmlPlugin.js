class InlineScriptHtmlPlugin {
    constructor(htmlWebpackPlugin, sourceCode) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
        this.source = sourceCode;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('InlineScriptHtmlPlugin', (compilation) => {
            const hooks = this.htmlWebpackPlugin.getHooks(compilation);
            hooks.alterAssetTagGroups.tap('InlineScriptHtmlPlugin', (assets) => {
                if (this.source) {
                    assets.headTags.push({
                        tagName: 'script',
                        innerHTML: this.source,
                        closeTag: true
                    });
                }
            });
        });
    }
}
module.exports = InlineScriptHtmlPlugin;

const tapable = require('tapable');
const crypto = require('crypto');

const hash = (string) =>
    crypto
        .createHash('md5')
        .update(string)
        .digest('hex');
const hooks = {
    pushCodeAssets: new tapable.AsyncSeriesWaterfallHook(['codeAssets'])
};
class InlineCodeHtmlPlugin {
    constructor(htmlWebpackPlugin) {
        this.htmlWebpackPlugin = htmlWebpackPlugin;
        this.codeAssets = {
            assetsMap: new Map(),
            push(...args) {
                // console.log(args);
                args.forEach((codeAsset) => {
                    if (typeof codeAsset.innerHTML === 'undefined') {
                        return;
                    }
                    const contenthash = hash(codeAsset.innerHTML);
                    if (this.assetsMap.has(contenthash)) return;
                    codeAsset.head = typeof codeAsset.head === 'undefined' ? true : codeAsset.head;
                    codeAsset.attributes = Object.assign(
                        { 'data-hash': contenthash },
                        codeAsset.attributes
                    );
                    // console.log(codeAsset);
                    this.assetsMap.set(contenthash, codeAsset);
                });
            },
            remove(contenthash) {
                this.assetsMap.delete(contenthash);
            }
        };
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('InlineCodeHtmlPlugin', (compilation) => {
            hooks.pushCodeAssets.promise(this.codeAssets).then((codeAssets) => {
                const htmlhooks = this.htmlWebpackPlugin.getHooks(compilation);
                htmlhooks.alterAssetTagGroups.tap('InlineCodeHtmlPlugin', (assets) => {
                    const assetsArr = Array.from(this.codeAssets.assetsMap.values());
                    const headAssets = assetsArr.filter((asset) => asset.head);
                    const bodyAssets = assetsArr.filter((asset) => !asset.head);

                    assets.headTags.unshift(...headAssets);
                    assets.bodyTags.push(...bodyAssets);
                });
                return codeAssets;
            });
        });
    }
}
InlineCodeHtmlPlugin.hooks = hooks;
module.exports = InlineCodeHtmlPlugin;

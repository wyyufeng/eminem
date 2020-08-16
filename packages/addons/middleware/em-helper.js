const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = () => (context) => {
    context
        .plugin('ModuleNotFoundPlugin')
        .use(require.resolve('react-dev-utils/ModuleNotFoundPlugin'), [context.paths.appSource])
        .end()
        .plugin('EnvScriptHtmlPlugin')
        .use(require('../internal/EnvScriptHtmlPlugin'), [HtmlWebpackPlugin])
        .end();

    context.when(
        context.isEnvProduction,
        (ctx) => {
            ctx.plugin('InlineChunkHtmlPlugin')
                .use(require.resolve('react-dev-utils/InlineChunkHtmlPlugin'), [
                    HtmlWebpackPlugin,
                    [/runtime-.+[.]js/]
                ])
                .end()
                .plugin('InjectVersionHtmlPlugin')
                .use(require('../internal/InjectVersionHtmlPlugin'), [
                    { version: context.buildVersion, buildTime: context.buildTime }
                ])
                .end();
        },
        (ctx) => {
            ctx.plugin('WatchMissingNodeModulesPlugin')
                .use(require.resolve('react-dev-utils/WatchMissingNodeModulesPlugin'), [
                    context.paths.nodeModules
                ])
                .end();
            ctx.plugin('CaseSensitivePathsPlugin')
                .use(require.resolve('case-sensitive-paths-webpack-plugin'))
                .end();
        }
    );

    return context;
};

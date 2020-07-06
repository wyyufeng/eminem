const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = ({ inlineChunk, version, build }) => (context) => {
    context
        .plugin('WatchMissingNodeModulesPlugin')
        .use(require.resolve('react-dev-utils/WatchMissingNodeModulesPlugin'), [
            context.paths.nodeModules
        ])
        .end()
        .plugin('InlineChunkHtmlPlugin')
        .use(require.resolve('react-dev-utils/InlineChunkHtmlPlugin'), [
            HtmlWebpackPlugin,
            inlineChunk
        ])
        .end()
        .plugin('ModuleNotFoundPlugin')
        .use(require.resolve('react-dev-utils/ModuleNotFoundPlugin'), [context.paths.appSource])
        .end()
        .plugin('CaseSensitivePathsPlugin')
        .use(require.resolve('case-sensitive-paths-webpack-plugin'))
        .end()
        .plugin('EnvScriptHtmlPlugin')
        .use(require('../internal/EnvScriptHtmlPlugin'), [HtmlWebpackPlugin])
        .end()
        .when(context.options.isEnvProduction, (config) => {
            config
                .plugin('InjectVersionHtmlPlugin')
                .use(require('../internal/InjectVersionHtmlPlugin'), [{ version, build }])
                .end();
        });

    return context;
};

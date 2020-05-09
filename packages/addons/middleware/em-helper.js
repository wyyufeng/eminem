const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = (lineChunk) => (context) => {
    context
        .plugin('WatchMissingNodeModulesPlugin')
        .use(require.resolve('react-dev-utils/WatchMissingNodeModulesPlugin'), [
            context.paths.nodeModules
        ])
        .end()
        .plugin('InlineChunkHtmlPlugin')
        .use(require.resolve('react-dev-utils/InlineChunkHtmlPlugin'), [
            HtmlWebpackPlugin,
            lineChunk
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
        .end();
    return context;
};

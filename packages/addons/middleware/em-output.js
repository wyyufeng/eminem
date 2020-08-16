module.exports = (publicPath) => (context) => {
    context.output
        .path(context.isEnvProduction ? context.paths.appOutput : undefined)
        .filename(context.isEnvProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].bundle.js')
        .chunkFilename(
            context.isEnvProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js'
        )
        .pathinfo(false)
        .publicPath(publicPath)
        .end();
    return context;
};

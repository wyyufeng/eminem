module.exports = ({ publicPath, filename, chunkFilename }) => (context) => {
    context.output
        .path(context.options.isEnvProduction ? context.paths.appOutput : undefined)
        .filename(filename(context.NODE_ENV))
        .chunkFilename(chunkFilename(context.NODE_ENV))
        .pathinfo(false)
        .publicPath(publicPath)
        .end();
    return context;
};

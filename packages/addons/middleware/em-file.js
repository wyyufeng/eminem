module.exports = (opts) => (context) => {
    context.module
        .rule('file')
        .exclude.add(context.getRegexFromExt())
        .end()
        .use('file-loader')
        .loader(require.resolve('file-loader'))
        .options({
            ...opts
        })
        .end();
    return context;
};

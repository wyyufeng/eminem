module.exports = (opts) => (context) => {
    context.module
        .rule('module')
        .oneOf('normal')
        .rule('file')
        .exclude.add(
            ['javascript', 'javascriptreact', 'typescript', 'html', 'json'].map(
                context.getRegexFromExt,
                context
            )
        )
        .end()
        .use('file-loader')
        .loader(require.resolve('file-loader'))
        .options({
            ...opts
        })
        .end();
    return context;
};

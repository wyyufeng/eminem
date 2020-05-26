module.exports = (opts) => (context) => {
    context.module
        .rule('file')
        .enforce('post')
        .exclude.add(
            [
                'javascript',
                'javascriptreact',
                'typescript',
                'html',
                'sass',
                'css',
                'json',
                'image'
            ].map(context.getRegexFromExt, context)
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

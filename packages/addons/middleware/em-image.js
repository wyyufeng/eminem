module.exports = ({ limit, name }) => (context) => {
    context.module

        .rule('image')
        .test(context.getRegexFromExt('image'))
        .use('url-loader')
        .loader(require.resolve('url-loader'))
        .options({
            limit: limit,
            name: name(context.NODE_ENV)
        })
        .end();

    return context;
};

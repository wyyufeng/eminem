module.exports = (opts) => (context) => {
    context
        .plugin('IgnorePlugin')
        .use(require.resolve('webpack/lib/IgnorePlugin'), [...opts])
        .end();
    return context;
};

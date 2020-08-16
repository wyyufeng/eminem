module.exports = () => (context) => {
    context
        .plugin('DefinePlugin')
        .use(require.resolve('webpack/lib/DefinePlugin'), [context.config.env.stringified])
        .end();
    return context;
};

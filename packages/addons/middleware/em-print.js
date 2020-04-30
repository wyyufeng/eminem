module.exports = (opts) => (context) => {
    context
        .plugin('FriendlyErrorsPlugin')
        .use(require.resolve('friendly-errors-webpack-plugin'), [opts])
        .end();
    return context;
};

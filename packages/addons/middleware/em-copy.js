module.exports = (opts) => (context) => {
    context.plugin('CopyPlugin').use(require.resolve('copy-webpack-plugin'), [[{ ...opts }]]);
    return context;
};

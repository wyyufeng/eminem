module.exports = () => (context) => {
    context.plugin('ErrorOverlay').use(require.resolve('error-overlay-webpack-plugin')).end();
    return context;
};

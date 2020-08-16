module.exports = () => (context) => {
    context.plugin('progress').use(require.resolve('webpackbar')).end();
    return context;
};

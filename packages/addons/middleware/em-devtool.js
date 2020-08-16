module.exports = () => (context) => {
    context.devtool(context.isEnvProduction ? 'source-map' : 'cheap-module-source-map');
    return context;
};

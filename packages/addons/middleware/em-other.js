module.exports = () => (context) => {
    context.when(
        context.isEnvProduction,
        (config) => {
            config.bail = true;
            context.mode('production');
        },
        (config) => {
            config.bail = false;

            context.mode('development');
        }
    );
    context.stats({
        children: false,
        entrypoints: false,
        modules: false
    });
    context.performance.hints(false);
    return context;
};

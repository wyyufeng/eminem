module.exports = (opts) => (context) => {
    context.when(
        context.options.isEnvProduction,
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

module.exports = (opts = { alias: {} }) => (context) => {
    context.resolve.modules.values('node_modules');

    Object.keys(context.extensions).forEach((key) => {
        context.extensions[key].forEach((ext) => context.resolve.extensions.add(`.${ext}`));
    });
    const alias = { ...opts.alias };
    for (let [key, value] of Object.entries(alias)) {
        context.resolve.alias.set(key, value);
    }
    return context;
};

const pipe = () => (context) => {
    context.options.apps.forEach((app) => {
        const entryCtx = context.entry(app.name);
        if (Array.isArray(app.entry)) {
            app.entry.forEach((entry) => entryCtx.add(entry));
        } else {
            entryCtx.add(app.entry);
        }
        entryCtx.end();
    });
    return context;
};

module.exports = pipe;

module.exports = (devtool) => (context) => {
    context.devtool(devtool(context.NODE_ENV));
    return context;
};

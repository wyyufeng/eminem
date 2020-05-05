module.exports = (opts = {}) => (context) => {
    context
        .plugin('WebPSupportPlugin')
        .use(require.resolve('../internal/WebpGeneratePlugin.js'), [opts])
        .end();
    return context;
};

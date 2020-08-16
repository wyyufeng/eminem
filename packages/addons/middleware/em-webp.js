module.exports = () => (context) => {
    context
        .plugin('WebPSupportPlugin')
        .use(require.resolve('../internal/WebpGeneratePlugin.js'))
        .end();
    return context;
};

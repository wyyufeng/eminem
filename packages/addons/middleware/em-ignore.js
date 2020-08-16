module.exports = () => (context) => {
    context
        .plugin('IgnorePlugin')
        .use(require.resolve('webpack/lib/IgnorePlugin'), [/^\.\/locale$/, /moment$/])
        .end();
    return context;
};

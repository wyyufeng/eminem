module.exports = () => (context) => {
    context.module
        .rule('svgr')
        .test(/\.svg(\?v=\d+\.\d+\.\d+)?$/)
        .use('@svgr/webpack')
        .loader(require.resolve('@svgr/webpack'))
        .end()
        .use('url-loader')
        .loader(require.resolve('url-loader'))
        .end();
    return context;
};

module.exports = () => (context) => {
    context.module

        .rule('fonts')
        .test(/\.(woff|woff2|eot|ttf|otf)$/)
        .use('file-loader')
        .loader(require.resolve('file-loader'))
        .options({
            name: context.isEnvProduction ? 'assets/[name].[hash:8].[ext]' : 'assets/[name].[ext]'
        })
        .end();

    return context;
};

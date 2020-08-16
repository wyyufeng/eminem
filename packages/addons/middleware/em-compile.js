module.exports = function () {
    return (context) => {
        context.module

            .rule('babel')
            .test(/\.(js|mjs|jsx|ts|tsx)$/)
            .include.add(context.paths.appSource)
            .end()
            .use('babel-loader')
            .loader(require.resolve('babel-loader'))
            .options({
                cacheDirectory: true,
                cacheCompression: false,
                compact: context.isEnvProduction,
                presets: [require.resolve('@eminemjs/babel-preset')]
            });

        return context;
    };
};

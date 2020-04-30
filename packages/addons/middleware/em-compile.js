function compile({ language, ...others }) {
    return (context) => {
        context.module

            .rule('compile')
            .test(context.getRegexFromExt(language))
            .include.add(context.paths.appSource)
            .end()
            .use('babel-loader')
            .loader(require.resolve('babel-loader'))
            .options({
                cacheDirectory: true,
                cacheCompression: false,
                compact: context.options.isEnvProduction,
                ...others
            });

        return context;
    };
}

module.exports = compile;

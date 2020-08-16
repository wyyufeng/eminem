module.exports = function eslint() {
    return (context) => {
        context.module
            .rule('lint')
            .test(/\.(js|mjs|jsx|ts|tsx)$/)
            .include.add(context.paths.appSource)
            .end()
            .enforce('pre')
            .use('eslint-loader')
            .loader(require.resolve('eslint-loader'))
            .options({
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                failOnWarning: context.isEnvProduction && context.config.strict,
                failOnError: context.isEnvProduction && context.config.strict,
                cache: true
            })
            .end();
        return context;
    };
};

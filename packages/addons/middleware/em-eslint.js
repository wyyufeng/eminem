module.exports = function eslint({ language, ...others }) {
    return (context) => {
        context.module
            .rule('lint')
            .test(context.getRegexFromExt(language))
            .include.add(context.paths.appSource)
            .end()
            .enforce('pre')
            .use('eslint-loader')
            .loader(require.resolve('eslint-loader'))
            .options({
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                failOnWarning: context.options.isEnvProduction && context.options.strict,
                failOnError: context.options.isEnvProduction && context.options.strict,
                cache: true,
                baseConfig: { extends: ['eslint:recommended', 'plugin:react/recommended'] },
                ...others
            })
            .end();
        return context;
    };
};

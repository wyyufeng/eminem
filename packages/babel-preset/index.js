'use strict';

module.exports = (_, opts = { react: false }) => {
    const { react } = opts;
    const env = process.env.BABEL_ENV || process.env.NODE_ENV;
    const isEnvDevelopment = env === 'development';
    const isEnvProduction = env === 'production';
    const useTypeScript = opts.useTypeScript;
    return {
        presets: [
            [
                require.resolve('@babel/preset-env'),
                {
                    useBuiltIns: 'usage',
                    corejs: 3,
                    modules: false
                }
            ],
            react && [
                '@babel/preset-react',
                {
                    development: isEnvDevelopment,

                    useBuiltIns: true
                }
            ],
            useTypeScript && ['@babel/preset-typescript']
        ].filter(Boolean),
        plugins: [
            require.resolve('babel-plugin-macros'),
            [
                require.resolve('@babel/plugin-proposal-class-properties'),
                {
                    loose: true
                }
            ],
            [
                require.resolve('@babel/plugin-transform-runtime'),
                {
                    helpers: true,
                    version: require('@babel/runtime/package.json').version
                }
            ],
            require.resolve('@babel/plugin-proposal-optional-chaining'),
            require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
            isEnvProduction &&
                react && [
                    require('babel-plugin-transform-react-remove-prop-types').default,
                    {
                        removeImport: true
                    }
                ],
            useTypeScript && [require('@babel/plugin-proposal-decorators').default, false]
        ].filter(Boolean)
    };
};

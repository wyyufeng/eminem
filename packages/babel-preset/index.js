'use strict';

module.exports = (_, opts = { react: false }) => {
    const { react } = opts;
    const env = process.env.BABEL_ENV || process.env.NODE_ENV;
    const isEnvDevelopment = env === 'development';
    const isEnvProduction = env === 'production';
    return {
        presets: [
            [
                '@babel/preset-env',
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
            ]
        ].filter(Boolean),
        plugins: [
            'babel-plugin-macros',
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true
                }
            ],
            [
                '@babel/plugin-transform-runtime',
                {
                    helpers: true,
                    version: require('@babel/runtime/package.json').version
                }
            ],
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            isEnvProduction &&
                react && [
                    require('babel-plugin-transform-react-remove-prop-types').default,
                    {
                        removeImport: true
                    }
                ]
        ].filter(Boolean)
    };
};

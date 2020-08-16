module.exports = () => (context) => {
    context.optimization
        .minimize(context.isEnvProduction)
        .minimizer('TerserPlugin')
        .use(require.resolve('terser-webpack-plugin'), [
            {
                terserOptions: {
                    parse: {
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        comparisons: false,
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true
                    }
                },
                sourceMap: context.config.shouldUseSourceMap
            }
        ])
        .end();
    return context;
};

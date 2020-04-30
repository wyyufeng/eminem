module.exports = (opts) => (context) => {
    context.optimization
        .minimize(context.options.isEnvProduction)
        .minimizer('css')
        .use(require.resolve('optimize-css-assets-webpack-plugin'), [
            {
                cssProcessorOptions: {
                    parser: require('postcss-safe-parser'),
                    map: context.options.shouldUseSourceMap
                        ? {
                              inline: false,
                              annotation: true
                          }
                        : false,
                    cssProcessorPluginOptions: {
                        preset: ['default', { minifyFontValues: { removeQuotes: false } }]
                    }
                }
            }
        ])
        .end();
    return context;
};

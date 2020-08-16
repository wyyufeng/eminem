module.exports = () => (context) => {
    context.optimization
        .minimize(context.isEnvProduction)
        .minimizer('css')
        .use(require.resolve('optimize-css-assets-webpack-plugin'), [
            {
                cssProcessorOptions: {
                    parser: require('postcss-safe-parser'),
                    map: context.config.shouldUseSourceMap
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

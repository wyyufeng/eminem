const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// 生产环境插件
function optimization(options) {
    return function (context) {
        context.optimization
            .minimize(options.isEnvProduction)
            .minimizer('TerserPlugin')
            .use(TerserPlugin, [
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
                    cache: true
                }
            ])
            .end()
            .minimizer('css')
            .use(OptimizeCSSAssetsPlugin, [
                {
                    cssProcessorOptions: {
                        parser: require('postcss-safe-parser'),
                        map: {
                            inline: false,

                            annotation: true
                        },
                        cssProcessorPluginOptions: {
                            preset: ['default', { minifyFontValues: { removeQuotes: false } }]
                        }
                    }
                }
            ])
            .end()
            .splitChunks({
                chunks: 'all',
                name: false
            })
            .runtimeChunk({ name: (entrypoint) => `runtime-${entrypoint.name}` });
        return context;
    };
}

module.exports = {
    optimization
};

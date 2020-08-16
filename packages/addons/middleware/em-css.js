module.exports = () => (context) => {
    context.module

        .rule('css')
        .test(/\.css$/)
        .when(
            context.isEnvProduction,
            (config) => {
                config
                    .use('mini-css')
                    .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
                    .options({
                        publicPath: '../'
                    })
                    .end();

                context
                    .plugin('MiniCssPlugin')
                    .use(require.resolve('mini-css-extract-plugin'), [
                        {
                            filename: context.isEnvProduction
                                ? 'css/[name].[contenthash:8].css'
                                : 'css/[name].css',
                            chunkFilename: context.isEnvProduction
                                ? 'css/[name].[contenthash:8].chunk.css'
                                : 'css/[name].chunk.css'
                        }
                    ])
                    .end();
            },
            (config) => {
                config.use('style').loader(require.resolve('style-loader')).end();
            }
        )
        .use('css')
        .loader(require.resolve('css-loader'))
        .options({
            importLoaders: 1,
            sourceMap: context.config.shouldUseSourceMap
        })
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options({
            sourceMap: context.config.shouldUseSourceMap,
            ident: 'postcss',
            plugins: () => {
                return [
                    require('postcss-flexbugs-fixes')(),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009'
                        },
                        stage: 3
                    }),
                    require('postcss-normalize')()
                ];
            }
        })
        .end();

    return context;
};

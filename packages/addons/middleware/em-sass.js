module.exports = () => (context) => {
    context.module

        .rule('sass')
        .test(/\.(sass|scss)$/)
        .when(
            context.isEnvProduction,
            (config) => {
                config
                    .use('mini-css')
                    .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
                    .options({
                        publicPath: '/'
                    });

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
                config.use('style').loader(require.resolve('style-loader'));
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

        .end()
        .use('resolve-url')
        .loader(require.resolve('resolve-url-loader'))
        .options({
            sourceMap: context.config.shouldUseSourceMap
        })
        .end()
        .use('scss')
        .loader(require.resolve('sass-loader'))
        .options({ sourceMap: context.config.shouldUseSourceMap })
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
    return context;
};

module.exports = ({ publicPath, filename, chunkFilename, postcss, ...others }) => (context) => {
    context.module

        .rule('sass')
        .test(context.getRegexFromExt('sass'))
        .when(
            context.options.isEnvProduction,
            (config) => {
                config
                    .use('mini-css')
                    .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
                    .options({
                        publicPath
                    });

                context
                    .plugin('MiniCssPlugin')
                    .use(require.resolve('mini-css-extract-plugin'), [
                        {
                            filename: filename(context.NODE_ENV),
                            chunkFilename: chunkFilename(context.NODE_ENV),
                            ...others
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
            sourceMap: context.options.shouldUseSourceMap
        })
        .end()
        .use('postcss')
        .loader(require.resolve('postcss-loader'))
        .options({
            sourceMap: context.options.shouldUseSourceMap,
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
            },
            ...postcss
        })

        .end()
        .use('resolve-url')
        .loader(require.resolve('resolve-url-loader'))
        .options({
            sourceMap: context.options.shouldUseSourceMap
        })
        .end()
        .use('scss')
        .loader(require.resolve('sass-loader'))
        .options({ sourceMap: context.options.shouldUseSourceMap })
        .end();

    context
        .plugin('MiniCssPlugin')
        .use(require.resolve('mini-css-extract-plugin'), [
            {
                filename: context.options.isEnvProduction
                    ? 'css/[name].[contenthash:8].css'
                    : 'css/[name].css',
                chunkFilename: context.options.isEnvProduction
                    ? 'css/[name].[contenthash:8].chunk.css'
                    : 'css/[name].chunk.css'
            }
        ])
        .end();
    return context;
};

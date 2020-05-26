module.exports = ({ publicPath, postcss, filename, chunkFilename, ...others }) => (context) => {
    // console.log(context.module.rule('module').oneOf('normal').rule);
    context.module

        .rule('css')
        .test(context.getRegexFromExt('css'))
        .when(
            context.options.isEnvProduction,
            (config) => {
                config
                    .use('mini-css')
                    .loader(require.resolve('mini-css-extract-plugin/dist/loader'))
                    .options({
                        publicPath
                    })
                    .end();

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
                config.use('style').loader(require.resolve('style-loader')).end();
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
        .end();

    return context;
};

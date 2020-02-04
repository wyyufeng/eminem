const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const util = require('../commands/util');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const getClientEnvironment = require('./env');

// 入口配置
function entry(options) {
    return function(context) {
        options.app.forEach((entry) => {
            context
                .entry(entry.name)

                .when(options.isEnvDevelopment, (config) =>
                    config.add(require.resolve('react-dev-utils/webpackHotDevClient'))
                )
                .add(path.resolve(options.appDirectory, `./src/app/${entry.name}/index.js`))
                .end();
        });
        return context;
    };
}

// 输出配置
function output(options) {
    return function(context) {
        context.output
            .when(
                options.isEnvProduction,
                (config) =>
                    config
                        .path(options.appBuild)
                        .filename('js/[name].[contenthash:8].js')
                        .chunkFilename('js/[name].[contenthash:8].chunk.js'),
                (config) =>
                    config
                        .path(undefined)
                        .filename('js/[name].bundle.js')
                        .chunkFilename('js/[name].chunk.js')
            )
            .publicPath('')
            .end();
        return context;
    };
}

// 配置html插件
function htmlPlugin(options) {
    return function(context) {
        options.app.forEach((page) => {
            const hwpOptions = Object.assign(
                {},
                {
                    inject: true,
                    filename: `${page.name}.html`,
                    chunks: [page.name],
                    template: path.resolve(process.cwd(), `./public/${page.template}`)
                },

                options.isEnvProduction
                    ? {
                          minify: {
                              removeComments: true,
                              collapseWhitespace: true,
                              removeRedundantAttributes: true,
                              useShortDoctype: true,
                              removeEmptyAttributes: true,
                              removeStyleLinkTypeAttributes: true,
                              keepClosingSlash: true,
                              minifyJS: true,
                              minifyCSS: true,
                              minifyURLs: true
                          }
                      }
                    : undefined
            );
            context.plugin(`htmlPlugin${page.name}`).use(HtmlWebpackPlugin, [{ ...hwpOptions }]);
        });
        return context;
    };
}

// 配置 js 文件处理
function javascriptLoader(options) {
    return function(context) {
        context.module
            .rule('modules')
            .oneOf('javascript')
            .test(/\.(js|mjs|jsx|ts|tsx)$/)
            .include.add(util.paths.appSrc)
            .end()
            .use('babel')
            .loader(require.resolve('babel-loader'))
            .options({
                cacheDirectory: true,
                cacheCompression: false,
                compact: options.isEnvProduction,
                presets: [require.resolve('babel-preset-react-app')]
            });

        return context;
    };
}

// 配置 css 文件处理
function cssLoader(options) {
    return function(context) {
        context.module
            .rule('modules')
            .oneOf('css')
            .test(/\.css$/)

            .when(
                options.isEnvProduction,
                (config) => {
                    config
                        .use('mini-css')
                        .loader(MiniCssExtractPlugin.loader)
                        .end();
                },
                (config) => {
                    config
                        .use('style')
                        .loader(require.resolve('style-loader'))

                        .end();
                }
            )
            .use('css')
            .loader(require.resolve('css-loader'))
            .options({
                importLoaders: 1,
                sourceMap: true
            })
            .end()
            .use('postcss')
            .loader(require.resolve('postcss-loader'))
            .options({
                sourceMap: true,
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009'
                        },
                        stage: 3
                    }),
                    require('postcss-normalize')
                    // require("../plugins/PostcssPlugin")
                ]
            })

            .end();
        return context;
    };
}

// 配置 sass 文件处理
function sassLoader(options) {
    return (context) => {
        context.module
            .rule('modules')
            .oneOf('sass')
            .test(/\.scss$/)

            .when(
                options.isEnvProduction,
                (config) => {
                    config.use('mini-css').loader(MiniCssExtractPlugin.loader);
                },
                (config) => {
                    config.use('style').loader(require.resolve('style-loader'));
                }
            )
            .use('css')
            .loader(require.resolve('css-loader'))
            .options({
                importLoaders: 1,
                sourceMap: true
            })
            .end()
            .use('postcss')
            .loader(require.resolve('postcss-loader'))
            .options({
                sourceMap: true,
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009'
                        },
                        stage: 3
                    }),
                    require('postcss-normalize')
                ]
            })
            .end()
            .use('resolve-url')
            .loader(require.resolve('resolve-url-loader'))
            .options({
                sourceMap: true
            })
            .end()
            .use('scss')
            .loader(require.resolve('sass-loader'))
            .options({ sourceMap: true })
            .end();
        return context;
    };
}

// 配置图片文件处理
function imageLoader() {
    return (context) => {
        context.module
            .rule('modules')
            .oneOf('image')

            .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options({
                limit: 10000,
                name: 'static/[name].[hash:8].[ext]'
            })
            .end();

        return context;
    };
}

// 配置其他文件处理
function fileLoader() {
    return (context) => {
        context.module
            .rule('modules')
            .oneOf('file')
            .exclude.add([/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/])
            .end()
            .use('file-loader')
            .loader(require.resolve('file-loader'))
            .options({
                name: 'static/[name].[hash:8].[ext]'
            })
            .end();
        return context;
    };
}
// 配置 eslint
function eslintLoader(options) {
    return (context) => {
        context.module
            .rule('eslint')
            .test(/\.(js|mjs|jsx|ts|tsx)$/)
            .include.add(options.appSrc)
            .end()
            .enforce('pre')
            .use('eslint-loader')

            .loader(require.resolve('eslint-loader'))
            .options({
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                failOnWarning: options.isEnvProduction,
                failOnError: options.isEnvProduction
            })
            .end();
        return context;
    };
}

// 配置 alias  处理
function resolveConfig(options) {
    return (context) => {
        context.resolve.modules.values('node_modules');
        context.resolve.alias.set('@', options.appSrc);
        return context;
    };
}

// 配置其他插件
function basePlugins(options) {
    return (context) => {
        context
            .plugin('IgnorePlugin')
            .use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/])
            .end()
            .plugin('DefinePlugin')
            .use(webpack.DefinePlugin, [getClientEnvironment()])
            .end()
            .plugin('MiniCssExtractPlugin')
            .use(MiniCssExtractPlugin, [
                {
                    filename: 'css/[name].[contenthash:8].css',
                    chunkFilename: 'css/[name].[contenthash:8].chunk.css'
                }
            ])
            .end()
            .plugin('FriendlyErrorsWebpackPlugin')
            .use(FriendlyErrorsWebpackPlugin)
            .end()
            .plugin('ManifestPlugin')
            .use(ManifestPlugin, [
                {
                    fileName: `manifest~v${options.version}.json`,
                    publicPath: options.appPublic,
                    seed: { files: {}, sourceMaps: {} },
                    generate: (seed, files) => {
                        const manifestFiles = files.reduce((manifest, file) => {
                            const ext = path.extname(file.name);
                            if (ext === '.map') {
                                manifest['sourceMaps'][file.name] = file.path;
                                return manifest;
                            }
                            manifest['files'][file.name] = file.path;
                            return manifest;
                        }, seed);

                        return manifestFiles;
                    }
                }
            ]);
        return context;
    };
}

// 其他全局配置
function globalConfig(options) {
    return (context) => {
        context.when(
            options.isEnvProduction,
            (config) => {
                config.devtool('source-map');
                config.bail = true;
                context.mode('production');
            },
            (config) => {
                config.bail = false;
                config.devtool('cheap-module-source-map');
                context.mode('development');
            }
        );

        context.node
            .set('module', 'empty')
            .set('dgram', 'empty')
            .set('dns', 'empty')
            .set('fs', 'empty')
            .set('http2', 'empty')
            .set('net', 'empty')
            .set('tls', 'empty')
            .set('child_process', 'empty');

        return context;
    };
}

module.exports = {
    entry,
    output,
    htmlPlugin,
    javascriptLoader,
    globalConfig,
    cssLoader,
    sassLoader,
    imageLoader,
    fileLoader,
    resolveConfig,
    basePlugins,
    eslintLoader
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const paths = require('../utils/paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const resolve = require('resolve');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InlineCodeHtmlPlugin = require('../plugins/InlineCodeHtmlPlugin');
const EnvScriptHtmlPlugin = require('../plugins/EnvScriptHtmlPlugin');
const CopyPlugin = require('copy-webpack-plugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const getClientEnvironment = require('./env');
const isImage = require('is-image');

/**@typedef {import('webpack-chain')} Context */

function entry(options) {
    return function (/** @type {Context} */ context) {
        options.app.forEach((entry) => {
            context
                .entry(entry.name)

                .when(options.isEnvDevelopment, (config) =>
                    config.add(require.resolve('react-dev-utils/webpackHotDevClient'))
                )
                .add(path.resolve(options.appPath, `./src/${entry.entry}`))
                .end();
        });
        return context;
    };
}

// 输出配置
function output(options) {
    return function (/** @type {Context} */ context) {
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
            .pathinfo(false)
            .publicPath('/')
            .end();
        return context;
    };
}

// 配置html插件
function htmlPlugin(options) {
    return function (/** @type {Context} */ context) {
        options.app.forEach((page) => {
            const hwpOptions = Object.assign(
                {},
                {
                    inject: true,
                    filename: `${page.name || 'index'}.html`,
                    chunks: [page.name],
                    template: path.resolve(process.cwd(), `./public/${page.html}`)
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
// 配置 eslint
function eslintLoader(options) {
    return (/** @type {Context} */ context) => {
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
// 配置 js|ts 文件处理
function javascriptLoader(options) {
    return function (/** @type {Context} */ context) {
        context.module

            .rule('javascript')
            .test(/\.(js|mjs|jsx|ts|tsx)$/)
            .include.add(paths.appSrc)
            .end()
            .use('babel-loader')
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
    return function (/** @type {Context} */ context) {
        context.module
            .rule('css')
            .test(/\.css$/)
            .when(
                options.isEnvProduction,
                (config) => {
                    config
                        .use('mini-css')
                        .loader(MiniCssExtractPlugin.loader)
                        .options({
                            publicPath: '../'
                        })
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
                sourceMap: true
            })
            .end()
            .use('postcss')
            .loader(require.resolve('postcss-loader'))
            .options({
                sourceMap: true,
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
}

// 配置 sass 文件处理
function sassLoader(options) {
    return (/** @type {Context} */ context) => {
        context.module
            .rule('sass')
            .test(/\.scss$/)
            .when(
                options.isEnvProduction,
                (config) => {
                    config.use('mini-css').loader(MiniCssExtractPlugin.loader).options({
                        publicPath: '../'
                    });
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
                    // require('../plugins/PostcssPlugin'),
                    require('postcss-flexbugs-fixes')(),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009'
                        },
                        stage: 3
                    }),
                    require('postcss-normalize')()
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
    return (/** @type {Context} */ context) => {
        context.module
            .rule('image')
            .test(/\.(ico|png|jpg|jpeg|gif|svg|webp)(\?v=\d+\.\d+\.\d+)?$/)

            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options({
                limit: 10000,
                name: 'static/[name].[hash:8].[ext]'
            })
            .end();
        // .use('test-loader')
        // .loader(require.resolve('./test-loader.js'))
        // .end();

        return context;
    };
}

// 配置其他文件处理
function fileLoader() {
    return (/** @type {Context} */ context) => {
        context.module
            .rule('file')
            .exclude.add([
                /\.(js|mjs|jsx|ts|tsx)$/,
                /\.html$/,
                /\.json$/,
                /\.scss$/,
                /\.css$/,
                /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?v=\d+\.\d+\.\d+)?$/
            ])
            .end()
            .use('file-loader')
            .loader(require.resolve('file-loader'))
            .options({
                name: 'static/[name].[ext]'
            })
            .end();
        return context;
    };
}

// 配置 alias  处理
function resolveModule(options) {
    return (/** @type {Context} */ context) => {
        context.resolve.modules.values('node_modules');
        context.resolve.alias.set('@', options.appSrc);
        return context;
    };
}

// 配置其他插件
function plugins(options) {
    return (/** @type {Context} */ context) => {
        context
            .plugin('IgnorePlugin')
            .use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/])
            .end()
            .plugin('DefinePlugin')
            .use(webpack.DefinePlugin, [getClientEnvironment('').stringified])
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
                    fileName: `assets-manifest.v${options.version}.json`,
                    publicPath: options.appPublic,
                    seed: { js: {}, css: {}, image: {}, sourceMaps: {}, html: {}, others: {} },
                    generate: (seed, files) => {
                        const manifestFiles = files.reduce((manifest, file) => {
                            const ext = path.extname(file.path);
                            const basename = path.basename(file.path);
                            if (ext === '.map') {
                                manifest['sourceMaps'][basename] = file.path;
                                return manifest;
                            }
                            if (isImage(basename)) {
                                manifest['image'][basename] = file.path;
                                return manifest;
                            }
                            if (ext === '.js') {
                                manifest['js'][basename] = file.path;
                                return manifest;
                            }
                            if (ext === '.css') {
                                manifest['css'][basename] = file.path;
                                return manifest;
                            }
                            if (ext === '.html' || ext === '.htm') {
                                manifest['html'][basename] = file.path;
                                return manifest;
                            }
                            manifest['others'][basename] = file.path;
                            return manifest;
                        }, seed);
                        manifestFiles.version = options.version;
                        manifestFiles.buildOn = new Date().toLocaleString();
                        return manifestFiles;
                    }
                }
            ])
            .end()
            .plugin('InterpolateHtmlPlugin')
            .use(InterpolateHtmlPlugin, [HtmlWebpackPlugin, getClientEnvironment('').raw])
            .end()
            .plugin('WatchMissingNodeModulesPlugin')
            .use(WatchMissingNodeModulesPlugin, [paths.nodeModules])
            .end()
            .plugin('InlineChunkHtmlPlugin')
            .use(InlineChunkHtmlPlugin, [HtmlWebpackPlugin, [/runtime-.+[.]js/, /webp.css/]])
            .end()
            .plugin('ModuleNotFoundPlugin')
            .use(ModuleNotFoundPlugin, [paths.appSrc])
            .end()
            .plugin('InlineCodeHtmlPlugin')
            .use(InlineCodeHtmlPlugin, [HtmlWebpackPlugin])
            .end()
            .plugin('EnvScriptHtmlPlugin')
            .use(EnvScriptHtmlPlugin, [HtmlWebpackPlugin])
            .end()
            .when(options.isEnvProduction, (config) => {
                config
                    .plugin('WebpGeneratePlugin')
                    .use(require('../plugins/WebpGeneratePlugin'), [
                        InlineCodeHtmlPlugin,
                        HtmlWebpackPlugin
                    ])
                    .end();
            })
            .when(fs.emptyDirSync(paths.copyFilePath), (config) => {
                config
                    .plugin('CopyPlugin')
                    .use(CopyPlugin, [[{ from: paths.copyFilePath, to: paths.appBuild }]]);
            })
            .when(options.useTypeScript, (config) => {
                config.plugin('ForkTsCheckerWebpackPlugin').use(ForkTsCheckerWebpackPlugin, [
                    {
                        typescript: resolve.sync('typescript', {
                            basedir: paths.nodeModules
                        }),
                        async: options.isEnvDevelopment,
                        useTypescriptIncrementalApi: true,
                        checkSyntacticErrors: true,
                        resolveModuleNameModule: undefined,
                        resolveTypeReferenceDirectiveModule: undefined,
                        tsconfig: options.tsconfig,
                        reportFiles: [
                            '**',
                            '!**/__tests__/**',
                            '!**/?(*.)(spec|test).*',
                            '!**/src/setupProxy.*',
                            '!**/src/setupTests.*'
                        ],
                        silent: true,
                        formatter: options.isEnvProduction ? typescriptFormatter : undefined
                    }
                ]);
            })
            .when(options.isEnvDevelopment, (config) => {
                config
                    .plugin('HotModuleReplacementPlugin')
                    .use(webpack.HotModuleReplacementPlugin)
                    .end()
                    .plugin('CaseSensitivePathsPlugin')
                    .use(CaseSensitivePathsPlugin);
            });

        return context;
    };
}

// 其他全局配置
function globalConfig(options) {
    return (/** @type {Context} */ context) => {
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
        context.stats({
            children: false,
            entrypoints: false,
            modules: false
        });
        context.node
            .set('module', 'empty')
            .set('dgram', 'empty')
            .set('dns', 'empty')
            .set('fs', 'empty')
            .set('http2', 'empty')
            .set('net', 'empty')
            .set('tls', 'empty')
            .set('child_process', 'empty');
        context.performance.hints(false);

        return context;
    };
}

module.exports = {
    entry,
    output,
    htmlPlugin,
    eslintLoader,
    javascriptLoader,
    globalConfig,
    cssLoader,
    sassLoader,
    imageLoader,
    fileLoader,
    resolveModule,
    plugins
};

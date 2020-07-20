const entry = require('../middleware/em-entry');
const output = require('../middleware/em-output');
const compile = require('../middleware/em-compile');
const css = require('../middleware/em-css');
const sass = require('../middleware/em-sass');
const htmlPipe = require('../middleware/em-html');
const eslintPipe = require('../middleware/em-eslint');
const imagePipe = require('../middleware/em-image');
const manifestPipe = require('../middleware/em-manifest');
const helper = require('../middleware/em-helper');
const filePipe = require('../middleware/em-file');
const ignorePipe = require('../middleware/em-ignore');
const hmr = require('../middleware/em-hmr');
const env = require('../middleware/em-env');
const devtoolPipe = require('../middleware/em-devtool');
const other = require('../middleware/em-other');
const devServerAddon = require('../middleware/em-devserver');
const cssminimizer = require('../middleware/em-cssminimizer');
const jsminimizer = require('../middleware/em-jsminimizer');
const cleanPipe = require('../middleware/em-clean');
const compose = require('../util/compose');
const splitChunks = require('../middleware/em-splitchunks');
const resolve = require('../middleware/em-resolve');
const errorOverlay = require('../middleware/em-overlay');
const emmodule = require('../middleware/em-module');
const forktschecker = require('../middleware/em-forktschecker');
const { join, extname, basename } = require('path');
const merge = require('lodash.merge');

/**
 * @description web-preset 配置
 * @param {Object} opts
 * @param {String} opts.publicPath - 参考webpack/output
 * @param {Object} opts.babel - 参考babel-loader
 * @param {String} opts.babel.language  - 'javascript|javascriptreact|typescript'
 * @param {Object} opts.output
 * @param {Function} opts.output.filename
 * @param {Function} opts.output.chunkFilename
 * @param {Object} opts.style
 * @param {String} opts.style.publicPath
 * @param {Object} opts.style.postcss
 * @param {Function} opts.style.filename
 * @param {Function} opts.style.chunkFilename
 * @param {Object} opts.eslint
 * @param {String} opts.eslint.language  - 'javascript|javascriptreact|typescript'
 * @param {Object} opts.html -参考html-webpack-plugin
 * @param {Object} opts.image
 * @param {Number} opts.image.limit
 * @param {Function} opts.image.name
 * @param {Array} opts.inlineChunk
 * @param {Object} opts.file
 * @param {String} opts.file.name
 * @param {Array} opts.ignore
 * @param {Object} opts.devServer -参考webpack/devserver
 */
const web = (opts = {}) => {
    return (context) => {
        const buildTime = new Date().toLocaleString();
        const defaultOptions = {
            publicPath: '/',
            output: {
                filename: (env) =>
                    env === 'production' ? 'js/[name].[contenthash:8].js' : 'js/[name].bundle.js',
                chunkFilename: (env) =>
                    env === 'production'
                        ? 'js/[name].[contenthash:8].chunk.js'
                        : 'js/[name].chunk.js'
            },
            babel: { language: 'javascript' },
            style: {
                publicPath: '../',
                postcss: {},
                filename: (env) =>
                    env === 'production' ? 'css/[name].[contenthash:8].css' : 'css/[name].css',
                chunkFilename: (env) =>
                    env === 'production'
                        ? 'css/[name].[contenthash:8].chunk.css'
                        : 'css/[name].chunk.css'
            },
            eslint: {
                language: 'javascript',
                baseConfig: { extends: ['eslint:recommended'] }
            },
            html: { meta: {}, minify: {} },
            image: {
                limit: 8192,
                name: (env) =>
                    env === 'production' ? 'assets/[name].[hash:8].[ext]' : 'assets/[name].[ext]'
            },
            manifest: (context) => {
                return {
                    fileName: `assets-manifest.v${context.options.version || '1.0.0'}.json`,
                    publicPath: context.options.appPublic,
                    seed: { js: {}, css: {}, image: {}, sourceMaps: {}, html: {}, others: {} },
                    generate: (seed, files) => {
                        const manifestFiles = files.reduce((manifest, file) => {
                            const ext = extname(file.path);
                            const baseName = basename(file.path);
                            if (ext === '.map') {
                                manifest['sourceMaps'][baseName] = file.path;
                                return manifest;
                            }
                            if (context.extensions.image.include(ext.substr(1))) {
                                manifest['image'][basename] = file.path;
                                return manifest;
                            }
                            if (ext === '.js') {
                                manifest['js'][baseName] = file.path;
                                return manifest;
                            }
                            if (ext === '.css') {
                                manifest['css'][baseName] = file.path;
                                return manifest;
                            }
                            if (ext === '.html' || ext === '.htm') {
                                manifest['html'][baseName] = file.path;
                                return manifest;
                            }
                            manifest['others'][baseName] = file.path;
                            return manifest;
                        }, seed);
                        manifestFiles.version = context.options.version;
                        manifestFiles.build = buildTime;
                        return manifestFiles;
                    }
                };
            },
            helperOpts: {
                inlineChunk: [/runtime-.+[.]js/],
                version: context.options.version,
                build: buildTime
            },
            file: {
                name: 'static/[name].[ext]'
            },
            ignore: [/^\.\/locale$/, /moment$/],
            devtool: (env) => (env === 'production' ? 'source-map' : 'cheap-module-source-map'),
            devServer: {
                publicPath: '/'
            },
            clean: {},
            overlay: true,
            alias: {
                '@': context.paths.appSource
            },
            useTypeScript: false
        };

        const webOptions = merge(defaultOptions, opts);
        const {
            publicPath,
            babel,
            style,
            html,
            eslint,
            manifest,
            file,
            ignore,
            devtool,
            image,
            clean,
            devServer,
            alias,
            useTypeScript,
            helperOpts
        } = webOptions;
        const { filename, chunkFilename } = webOptions.output;
        const { isEnvProduction, apps } = context.options;
        const { appSource } = context.paths;
        // 解析入口文件地址，如果在开发环境下加入热更新代码
        apps.forEach((app) => {
            const devClient = isEnvProduction
                ? []
                : [
                      'webpack/hot/dev-server',
                      `webpack-dev-server/client?http://localhost:${context.options.port}`
                  ];
            devClient.unshift(join(appSource, app.entry));
            app.entry = devClient;
        });

        const middleware = [
            entry(),
            output({ publicPath, filename, chunkFilename }),
            emmodule(),
            compile({ ...babel, useTypeScript }),
            css(style),
            sass(style),
            htmlPipe(html),
            eslint && eslintPipe(eslint),
            imagePipe(image),
            manifestPipe(manifest(context)),
            helper(helperOpts),
            filePipe(file),
            ignorePipe(ignore),
            !isEnvProduction && hmr(),
            env(),
            clean && cleanPipe(clean),
            devtoolPipe(devtool),
            other(),
            useTypeScript && forktschecker(),
            !isEnvProduction && errorOverlay(),
            !isEnvProduction && devServerAddon(devServer),
            isEnvProduction && jsminimizer(),
            isEnvProduction && cssminimizer(),
            isEnvProduction && splitChunks(),
            resolve({ alias })
        ].filter(Boolean);
        // 运行middleware 修改context
        compose(middleware)(context);

        return context;
    };
};

module.exports = web;

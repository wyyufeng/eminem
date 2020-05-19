const sharp = require('sharp');
const RawSource = require('webpack-sources/lib/RawSource');
const ConcatSource = require('webpack-sources/lib/ConcatSource');
const path = require('path');
const crypto = require('crypto');
const findCacheDir = require('find-cache-dir');
const fs = require('fs-extra');
const postcss = require('postcss');
const isCss = (filename) => path.extname(filename) === '.css';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineCodePlugin = require('../plugins/InlineCodeHtmlPlugin');
const webpRuntime = (clsPrefix) => `
window.WEBP_SUPPORT = (function canUseWebP() {
    var flag = false;
    var elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        flag =  elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        flag&&document.querySelector('html').classList.add('${clsPrefix}')
    }
    
    return flag;
})()
`;

const defaultProps = {
    /**
     * 转换的阈值,等于 url-loader 的limit值,
     */
    limit: 10000,
    /**
     * 生成的webp兼容代码的选择器
     */
    clsPrefix: 'webp-support',
    /**
     * 生成的webp图片的后缀,如 example.jpg=>example.jpg.webp;
     */
    webpSuffix: '.webp',

    /**
     * 生成的css代码如何插入 mix:混入现有的css代码中，single:单独生成文件
     */
    mode: 'mix',

    filename: 'css/[hash:8].webp.css',

    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/]
};

module.exports = class WebpGeneratePlugin {
    constructor(options = defaultProps) {
        this.options = options;

        this.cacheThunk = findCacheDir({ name: 'webp', create: true, thunk: true });
    }
    /**
     * 生成webp
     * @param {Array} imgAssets 图片资源
     * @param {any} compilation
     */
    async generateWebp(imgAssets, compilation) {
        const jobs = imgAssets.map((asset) => {
            return new Promise((resolve, reject) => {
                this.cacheWebp(
                    asset.asset.source(),
                    (result) => {
                        if (Buffer.isBuffer(result)) {
                            const source = new RawSource(result);

                            compilation.assets[
                                `${asset.filename}${this.options.webpSuffix}`
                            ] = source;
                            resolve();
                        } else {
                            sharp(asset.asset.source())
                                .webp()
                                .toBuffer()
                                .then((data) => {
                                    const source = new RawSource(data);
                                    fs.writeFileSync(result, data);
                                    compilation.assets[
                                        `${asset.filename}${this.options.webpSuffix}`
                                    ] = source;
                                    resolve();
                                })
                                .catch((err) => {
                                    reject(err);
                                });
                        }
                    },
                    reject
                );
            });
        });
        await Promise.all(jobs);
    }
    /**
     * 缓存生成的webp文件
     * @param {*} content
     * @param {Function} resolve 命中缓存时的回调函数
     * @param {Function} reject 未命中缓存时的回调函数
     */
    cacheWebp(content, resolve, reject) {
        const hash = crypto
            .createHash('sha1')
            .update(content)
            .digest('hex');
        const cacheFilePath = this.cacheThunk(hash);
        fs.exists(cacheFilePath)
            .then((exists) => {
                if (exists) {
                    fs.readFile(cacheFilePath)
                        .then((data) => {
                            resolve(data);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                } else {
                    resolve(cacheFilePath);
                }
            })
            .catch((err) => {
                reject(err);
            });
    }
    /**
     * 使用postcss 生成 webp的css 兼容代码
     * @param {*} compilation
     * @param {*} chunks
     */
    async generateCSSSupport(compilation, chunks) {
        const filename = compilation.getPath(this.options.filename);
        const map = new Map();

        for (const chunk of chunks) {
            const cssFiles = chunk.files.filter(isCss);
            for (const chunkFilename of cssFiles) {
                const asset = compilation.assets[chunkFilename];
                const result = await postcss([
                    require('./WebpPostcssPlugin')(this.options)
                ]).process(asset.source());
                const rawSource = new RawSource(result.css);

                if (this.options.mode === 'mix') {
                    map.set(chunkFilename, rawSource);
                } else {
                    if (map.has(filename)) {
                        const concatSource = new ConcatSource(rawSource);
                        map.set(filename, concatSource.add(map.get(filename)));
                    } else {
                        map.set(filename, rawSource);
                    }
                }
            }
        }
        return map;
    }
    /**
     *
     * @param {*} compiler
     */
    generateWebpRuntime(compiler) {
        InlineCodePlugin.hooks.emitCodeAssets.tap('WebpGeneratePlugin', (codeAssets) => {
            codeAssets.push({
                tagName: 'script',
                innerHTML: webpRuntime(this.options.clsPrefix),
                closeTag: true,
                _webpRuntime: true
            });
        });

        compiler.hooks.compilation.tap('WebpGeneratePlugin', (compilation) => {
            compilation.hooks.optimizeChunkAssets.tapAsync(
                'WebpGeneratePlugin',
                (chunks, callback) => {
                    this.generateCSSSupport(compilation, chunks)
                        .then((map) => {
                            map.forEach((rawSource, key) => {
                                compilation.assets[key] = rawSource;
                                if (this.options.mode === 'single') {
                                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                                    hooks.alterAssetTagGroups.tap(
                                        'InlineChunkHtmlPlugin',
                                        (assets) => {
                                            const index = assets.headTags.findIndex(
                                                (i) => i._webpRuntime
                                            );
                                            assets.headTags.splice(index + 1, 0, {
                                                tagName: 'link',
                                                attributes: {
                                                    href: key,
                                                    rel: 'stylesheet'
                                                },
                                                closeTag: true
                                            });
                                        }
                                    );
                                }
                            });
                            callback();
                        })
                        .catch((err) => {
                            callback(err);
                        });
                }
            );
        });
    }

    apply(compiler) {
        this.generateWebpRuntime(compiler);

        compiler.hooks.afterCompile.tapAsync('generateWebp', async (compilation, callback) => {
            try {
                const keys = Object.keys(compilation.assets);

                const imgAssets = keys
                    .map((key) => {
                        const ext = path.extname(key);
                        if (this.options.test.some((exp) => exp.test(ext))) {
                            const asset = compilation.assets[key];
                            const size = asset.size();
                            if (size > this.options.limit) {
                                return {
                                    filename: key,
                                    asset
                                };
                            }
                        }
                    })
                    .filter(Boolean);
                await this.generateWebp(imgAssets, compilation);
                callback();
            } catch (error) {
                callback(error);
            }
        });
    }
};

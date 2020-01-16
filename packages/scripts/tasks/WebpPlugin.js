const sharp = require("sharp");
const RawSource = require("webpack-sources/lib/RawSource");
const path = require("path");
const crypto = require("crypto");
const findCacheDir = require("find-cache-dir");
const fs = require("fs-extra");
module.exports = class WebpPlugin {
  constructor(options = { limit: 10000 }) {
    this.options = options;
    this.cacheFolder = findCacheDir({ name: "webp" });
    if (!fs.existsSync(this.cacheFolder)) {
      fs.mkdirSync(this.cacheFolder);
    }
  }

  async generateWebp(imgAssets, compilation) {
    const jobs = imgAssets.map(asset => {
      return new Promise((resolve, reject) => {
        this.cacheWebp(
          asset.asset.source(),
          buf => {
            const source = new RawSource(buf);
            compilation.assets[`${asset.filename}_.webp`] = source;
            resolve();
          },
          cacheFilePath => {
            sharp(asset.asset.source())
              .webp()
              .toBuffer()
              .then(data => {
                const source = new RawSource(data);
                if (source.size() >= asset.asset.size()) {
                  return resolve();
                }
                fs.writeFileSync(cacheFilePath, data);
                compilation.assets[`${asset.filename}_.webp`] = source;
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          }
        );
      });
    });
    await Promise.all(jobs);
  }

  cacheWebp(content, hitFunc, missFunc) {
    const hash = crypto
      .createHash("sha1")
      .update(content)
      .digest("hex");
    const cacheFilePath = path.resolve(this.cacheFolder, hash);
    if (fs.existsSync(cacheFilePath)) {
      return hitFunc(fs.readFileSync(cacheFilePath));
    } else {
      missFunc(cacheFilePath);
    }
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "WebpPlugin",
      async (compilation, callback) => {
        try {
          const keys = Object.keys(compilation.assets);

          const imgAssets = keys
            .map(key => {
              const ext = path.extname(key);
              if (
                [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/].some(exp =>
                  exp.test(ext)
                )
              ) {
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
      }
    );
  }
};

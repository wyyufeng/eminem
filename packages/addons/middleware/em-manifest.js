const path = require('path');
const isImage = require('is-image');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = (publicPath) => (context) => {
    context
        .plugin('ManifestPlugin')
        .use(WebpackManifestPlugin, [
            {
                fileName: `assets-manifest.v${context.buildVersion}.json`,
                publicPath: publicPath,
                seed: {
                    build_version: '',
                    build_time: '',
                    build_user: '',
                    js: {},
                    css: {},
                    image: {},
                    sourceMaps: {},
                    html: {},
                    others: {}
                },
                generate: (seed, files) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        const ext = path.extname(file.path);
                        const basename = path.basename(file.path);
                        if (ext === '.map') {
                            manifest['sourceMaps'][basename] = file.path;
                            return manifest;
                        }
                        if (isImage(file.path)) {
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
                    manifestFiles.build_version = context.buildVersion;
                    manifestFiles.build_time = new Date().toLocaleString();
                    manifestFiles.build_user = require('os').userInfo().username;
                    return manifestFiles;
                }
            }
        ])
        .end();

    return context;
};

const path = require('path');
module.exports = (opts) => (context) => {
    context
        .plugin('ManifestPlugin')
        .use(require.resolve('webpack-manifest-plugin'), [
            {
                fileName: `assets-manifest.v${context.version}.json`,
                publicPath: context.options.appPublic,
                seed: { js: {}, css: {}, image: {}, sourceMaps: {}, html: {}, others: {} },
                generate: (seed, files) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        const ext = path.extname(file.path);
                        const basename = path.basename(file.path);
                        if (ext === '.map') {
                            manifest['sourceMaps'][basename] = file.path;
                            return manifest;
                        }
                        // if (context.extensions.image.include(ext.substr(1))) {
                        //     manifest['image'][basename] = file.path;
                        //     return manifest;
                        // }
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
                    manifestFiles.version = context.version;
                    manifestFiles.buildOn = new Date().toLocaleString();
                    return manifestFiles;
                }
            }
        ])
        .end();

    return context;
};

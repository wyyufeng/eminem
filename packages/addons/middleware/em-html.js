const { resolve } = require('path');
module.exports = function htmlTemplate(opts) {
    return (context) => {
        context.options.apps.forEach((app) => {
            const pluginOptions = Object.assign(
                {
                    title: app.name || 'App',
                    inject: true,
                    filename: `${app.name || 'index'}.html`,
                    chunks: [app.name],
                    template: resolve(context.paths.appPublic, app.template),
                    meta: {
                        ...opts.meta
                    }
                },
                context.options.isEnvProduction
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
                              minifyURLs: true,
                              ...opts.minify
                          }
                      }
                    : undefined
            );
            context
                .plugin(`html${app.name}`)
                .use(require.resolve('html-webpack-plugin'), [Object.assign(pluginOptions, opts)]);
        });
        return context;
    };
};

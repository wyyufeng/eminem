const { resolve } = require('path');
module.exports = function htmlTemplate() {
    return (context) => {
        context.config.apps.forEach((app) => {
            const pluginOptions = Object.assign(
                {
                    title: app.name || 'App',
                    inject: true,
                    filename: `${app.name || 'index'}.html`,
                    chunks: [app.name],
                    template: resolve(context.paths.appPublic, app.template)
                },
                context.isEnvProduction
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
            context
                .plugin(`html${app.name}`)
                .use(require.resolve('html-webpack-plugin'), [pluginOptions]);
        });
        return context;
    };
};

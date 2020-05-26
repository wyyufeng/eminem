/**
 * @see {@link https://webpack.js.org/plugins/copy-webpack-plugin/#options}
 * @param {Object} opts
 * @param {String} opts.from
 * @param {String} opts.to
 */
module.exports = (opts) => (context) => {
    context.plugin('CopyPlugin').use(require.resolve('copy-webpack-plugin'), [[{ ...opts }]]);
    return context;
};

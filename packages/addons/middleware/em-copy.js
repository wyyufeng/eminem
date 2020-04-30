/**
 * @see {@link https://webpack.js.org/plugins/copy-webpack-plugin/#options}
 * @param {Object} opts
 * @param {String} opts.from
 * @param {String} opts.to
 */
const f = (opts) => (context) => {
    context.plugin('CopyPlugin').use(require.resolve('copy-webpack-plugin'), [[{ ...opts }]]);
    return context;
};
module.exports = f;

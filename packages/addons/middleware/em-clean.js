const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = (opts) => (context) => {
    context.plugin('clean').use(CleanWebpackPlugin, [opts]);
    return context;
};

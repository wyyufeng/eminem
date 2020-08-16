const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = () => (context) => {
    context.plugin('clean').use(CleanWebpackPlugin);
    return context;
};

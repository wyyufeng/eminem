const util = require('../commands/util');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

// 配置开发服务器
function devServer(options) {
    return (context) => {
        context.devServer
            .disableHostCheck(true)
            .compress(true)
            .clientLogLevel('none')
            .contentBase(util.paths.appPublic)
            // .public(options)
            .watchContentBase(true)
            .hot(true)
            .host('0.0.0.0')
            .overlay(false)
            .quiet(true)
            .public(options.urls.lanUrlForConfig)
            .proxy({
                '/api': {
                    target: options.proxy,
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api': ''
                    }
                }
            });
        return context;
    };
}

// 开发环境插件
function plugins() {
    return (context) => {
        context
            .plugin('HotModuleReplacementPlugin')
            .use(webpack.HotModuleReplacementPlugin)
            .end()
            .plugin('CaseSensitivePathsPlugin')
            .use(CaseSensitivePathsPlugin);
    };
}
module.exports = {
    devServer,
    plugins
};

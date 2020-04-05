const paths = require('../utils/paths');

// 配置开发服务器
function devServer(options) {
    return (context) => {
        context.devServer
            .disableHostCheck(true)
            .compress(true)
            .clientLogLevel('none')
            .contentBase(paths.appPublic)
            .publicPath('/')
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

module.exports = {
    devServer
};

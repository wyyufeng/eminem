const paths = require('../utils/paths');
/**@typedef {import('webpack-chain')} Context */

// 配置开发服务器
function devServer(project) {
    return (/** @type {Context} */ context) => {
        context.devServer
            .set('transportMode', 'ws')
            .set('injectClient', false)
            .historyApiFallback({
                disableDotRule: true
            })

            .disableHostCheck(true)
            .compress(true)
            .clientLogLevel('none')
            .contentBase(paths.appPublic)
            .publicPath(project.publicPath)
            .watchContentBase(true)
            .hot(true)
            .host('0.0.0.0')
            .overlay(false)
            .quiet(true)
            .public(project.urls.lanUrlForConfig)
            .when(project.proxy, (config) => {
                config.proxy(
                    typeof project.proxy === 'string'
                        ? {
                              '/api': {
                                  target: project.proxy,
                                  changeOrigin: true,
                                  pathRewrite: {
                                      '^/api': ''
                                  }
                              }
                          }
                        : project.proxy
                );
            });

        return context;
    };
}

module.exports = {
    devServer
};

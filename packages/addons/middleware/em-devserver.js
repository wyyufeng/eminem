module.exports = ({ publicPath, proxy }) => (context) => {
    context.devServer
        .set('transportMode', 'ws')
        .set('injectClient', false)
        .historyApiFallback({
            disableDotRule: true
        })

        .disableHostCheck(true)
        .compress(true)
        .clientLogLevel('none')
        .contentBase(context.paths.appPublic)
        .publicPath(publicPath)
        .watchContentBase(true)
        .hot(true)
        .host(context.options.host)
        .port(context.options.port)
        .overlay(false)
        .quiet(true)
        .open(true)
        .useLocalIp(true)
        .public(context.options.urls.lanUrl)
        .when(proxy, (config) => {
            config.proxy(proxy);
        });

    return context;
};

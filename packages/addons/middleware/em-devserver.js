module.exports = () => (context) => {
    context.devServer
        .historyApiFallback({
            disableDotRule: true
        })
        .disableHostCheck(true)
        .compress(true)
        .clientLogLevel('silent')
        .contentBase(context.paths.appPublic)
        .publicPath('/')
        .watchContentBase(true)
        .hot(true)
        .host(context.config.host)
        .port(context.config.port)
        .overlay(true)
        .quiet(true)
        .open(true)
        .useLocalIp(true)
        .public(context.config.urls.lanUrl);

    return context;
};

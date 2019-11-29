const path = require("path");
const webpack = require("webpack");
function devServer(options) {
  return context => {
    context.devServer
      .disableHostCheck(true)
      .compress(true)
      .clientLogLevel("none")
      .contentBase(path.resolve(options.appDirectory, "./public"))
      // .public(options)
      .watchContentBase(true)
      .hot(true)
      .host("0.0.0.0")
      .overlay(false)
      .quiet(true)
      .public(options.urls.lanUrlForConfig);
    return context;
  };
}
function plugins() {
  return context => {
    context.plugin("hotload").use(webpack.HotModuleReplacementPlugin);
  };
}
module.exports = {
  devServer,
  plugins
};

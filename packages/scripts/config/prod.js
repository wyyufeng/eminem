const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require("webpack");
function optimization(options) {
  return function(context) {
    context.optimization
      .minimize(options.isEnvProduction)
      .minimizer("TerserPlugin")
      .use(TerserPlugin, [
        {
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          },
          cache: true
        }
      ])
      .end()
      .minimizer("css")
      .use(OptimizeCSSAssetsPlugin, [
        {
          cssProcessorOptions: {}
        }
      ])
      .end()
      .splitChunks({
        chunks: "all",
        name: false
      })
      .runtimeChunk(true);
    return context;
  };
}
const handler = (percentage, message, ...args) => {
  // e.g. Output each progress message directly to the console:
  console.info(percentage, message, ...args);
};
function plugins() {
  return context => {
    context
      .plugin("ProgressPlugin")
      .use(webpack.ProgressPlugin, [handler])
      .end();
  };
}
module.exports = {
  optimization,
  plugins
};

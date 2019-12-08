const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require("webpack");
const WebpPlugin = require("../plugins/WebpPlugin");
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

function plugins() {
  return context => {
    context
      .plugin("WebpPlugin")
      .use(WebpPlugin, [{ limit: 10000 }])
      .end();
    return context;
  };
}
module.exports = {
  optimization,
  plugins
};

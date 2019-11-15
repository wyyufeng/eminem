const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

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
      ]);
    return context;
  };
}

module.exports = {
  optimization
};

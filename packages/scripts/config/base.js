const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
function entry(options) {
  return function(context) {
    options.pages.forEach(entry => {
      context
        .entry(entry.page)
        .add(path.resolve(process.cwd(), `./src/${entry.entry}`))
        .when(options.isEnvDevelopment, config =>
          config.add(require.resolve("react-dev-utils/webpackHotDevClient"))
        )
        .end();
    });
    return context;
  };
}

function output(options) {
  return function(context) {
    context.output
      .when(
        options.isEnvProduction,
        config =>
          config
            .path("build")
            .filename("js/[name].[contenthash:8].js")
            .chunkFilename("js/[name].[contenthash:8].chunk.js"),
        config =>
          config
            .path(undefined)
            .filename("js/bundle.js")
            .chunkFilename("js/[name].chunk.js")
      )
      .publicPath("")
      .end();
    return context;
  };
}

function htmlPlugin(options) {
  return function(context) {
    options.pages.forEach(page => {
      const hwpOptions = Object.assign(
        {},
        {
          inject: true,
          filename: `${page.page}.html`,
          chunks: [page.page],
          template: path.resolve(process.cwd(), `./public/${page.template}`)
        },

        options.isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            }
          : undefined
      );
      context
        .plugin(`htmlPlugin${page.page}`)
        .use(HtmlWebpackPlugin, [{ ...hwpOptions }]);
    });
    return context;
  };
}

function javascriptLoader() {
  return function(context) {
    context.module
      .rule("compile")
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .use("babel")
      .loader("babel-loader")
      .options({ presets: ["@babel/preset-env"] });
    return context;
  };
}

function cssLoader(options) {
  return function(context) {
    context.module
      .rule("csscompile")
      .test(/\.css$/)
      .when(
        options.isEnvProduction,
        config => {
          config.use("mini-css").loader(MiniCssExtractPlugin.loader);
        },
        config => {
          config.use("style").loader("style-loader");
        }
      )
      .use("css")
      .loader("css-loader")
      .options({
        importLoaders: 1
      })
      .end()
      .use("postcss")
      .loader("postcss-loader")
      .options({
        ident: "postcss",
        plugins: loader => [require("postcss-preset-env")()]
      })
      .end();
    return context;
  };
}

function globalConfig(options) {
  return context => {
    context.when(
      options.isEnvProduction,
      config => {
        config.devtool("source-map");
        context.mode("production");
      },
      config => {
        config.devtool("cheap-module-source-map");
        context.mode("development");
      }
    );

    return context;
  };
}

module.exports = {
  entry,
  output,
  htmlPlugin,
  javascriptLoader,
  globalConfig,
  cssLoader
};

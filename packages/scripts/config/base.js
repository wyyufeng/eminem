const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
function entry(options) {
  return function(context) {
    options.app.forEach(entry => {
      context
        .entry(entry.name)

        .when(options.isEnvDevelopment, config =>
          config.add(require.resolve("react-dev-utils/webpackHotDevClient"))
        )
        .add(
          path.resolve(options.appDirectory, `./src/app/${entry.name}/index.js`)
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
            .path(path.resolve(options.appDirectory, "build"))
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
    options.app.forEach(page => {
      const hwpOptions = Object.assign(
        {},
        {
          inject: true,
          filename: `${page.name}.html`,
          chunks: [page.name],
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
      .loader(require.resolve("babel-loader"))
      .options({
        cacheDirectory: true,
        cacheCompression: false,
        presets: [require("@babel/preset-env"), require("@babel/preset-react")]
      });
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
          config
            .use("mini-css")
            .loader(MiniCssExtractPlugin.loader)
            .end();
        },
        config => {
          config
            .use("style")
            .loader(require.resolve("style-loader"))
            .end();
        }
      )
      .use("css")
      .loader(require.resolve("css-loader"))
      .options({
        importLoaders: 1
      })
      .end()
      .use("postcss")
      .loader(require.resolve("postcss-loader"))
      .options({
        ident: "postcss",
        plugins: () => [
          require("postcss-flexbugs-fixes"),
          require("postcss-preset-env")({
            autoprefixer: {
              flexbox: "no-2009"
            },
            stage: 3
          }),
          require("postcss-normalize")
        ]
      })
      .end();
    return context;
  };
}
function sassLoader(options) {
  return context => {
    context.module
      .rule("scsscompile")
      .test(/\.scss$/)
      .when(
        options.isEnvProduction,
        config => {
          config.use("mini-css").loader(MiniCssExtractPlugin.loader);
        },
        config => {
          config.use("style").loader(require.resolve("style-loader"));
        }
      )
      .use("css")
      .loader(require.resolve("css-loader"))
      .options({
        importLoaders: 1
      })
      .end()
      .use("postcss")
      .loader(require.resolve("postcss-loader"))
      .options({
        ident: "postcss",
        plugins: () => [
          require("postcss-flexbugs-fixes"),
          require("postcss-preset-env")({
            autoprefixer: {
              flexbox: "no-2009"
            },
            stage: 3
          }),
          require("postcss-normalize")
        ]
      })
      .end()
      .use("resolve-url")
      .loader(require.resolve("resolve-url-loader"))
      .end()
      .use("scss")
      .loader(require.resolve("sass-loader"))
      .options({
        importLoaders: 2
      })
      .end();
    return context;
  };
}

function imageLoader() {
  return context => {
    context.module
      .rule("images")
      .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
      .use("url-loader")
      .loader(require.resolve("url-loader"))
      .options({
        limit: 10000,
        name: "static/[name].[hash:8].[ext]"
      })
      .end();

    return context;
  };
}

function fileLoader() {
  return context => {
    context.module
      .rule("file")
      .exclude.add([
        /\.(js|mjs|jsx|ts|tsx)$/,
        /\.html$/,
        /\.json$/,
        /\.scss$/,
        /\.css$/,
        /\.bmp$/,
        /\.gif$/,
        /\.jpe?g$/,
        /\.png$/
      ])
      .end()
      .use("file-loader")
      .loader(require.resolve("file-loader"))
      .options({
        name: "static/[name].[hash:8].[ext]"
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
  cssLoader,
  sassLoader,
  imageLoader,
  fileLoader
};

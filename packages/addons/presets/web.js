const entry = require('../middleware/em-entry');
const output = require('../middleware/em-output');
const compile = require('../middleware/em-compile');
const css = require('../middleware/em-css');
const sass = require('../middleware/em-sass');
const html = require('../middleware/em-html');
const eslint = require('../middleware/em-eslint');
const image = require('../middleware/em-image');
const fonts = require('../middleware/em-fonts');
const manifest = require('../middleware/em-manifest');
const helper = require('../middleware/em-helper');
const ignore = require('../middleware/em-ignore');
const hmr = require('../middleware/em-hmr');
const env = require('../middleware/em-env');
const devtool = require('../middleware/em-devtool');
const other = require('../middleware/em-other');
const devServer = require('../middleware/em-devserver');
const cssminimizer = require('../middleware/em-cssminimizer');
const jsminimizer = require('../middleware/em-jsminimizer');
const clean = require('../middleware/em-clean');
const splitChunks = require('../middleware/em-splitchunks');
const resolve = require('../middleware/em-resolve');
// const errorOverlay = require('../middleware/em-overlay');
const progress = require('../middleware/em-progress');
const emmodule = require('../middleware/em-module');
const forktschecker = require('../middleware/em-forktschecker');
const { compose } = require('../util/compose');
const { join } = require('path');

/**
 *
 * @param {boolean} useTypeScript - 是否启用typescript
 * @param {string} publicPath  - publicPath
 */
const web = (
    { useTypeScript, publicPath } = {
        useTypeScript: false,
        publicPath: '/'
    }
) => {
    return (context) => {
        const { apps } = context.config;
        const isEnvProduction = context.isEnvProduction;
        const { appSource } = context.paths;
        // 解析入口文件地址，如果在开发环境下加入热更新代码
        apps.forEach((app) => {
            const devClient = isEnvProduction
                ? []
                : [
                      'webpack/hot/dev-server',
                      `webpack-dev-server/client?http://localhost:${context.config.port}`
                  ];
            devClient.unshift(join(appSource, app.entry));
            app.entry = devClient;
        });

        const middleware = [
            entry(),
            output(publicPath),
            emmodule(),
            compile(),
            css(),
            sass(),
            html(),
            eslint(),
            image(),
            fonts(),
            manifest(publicPath),
            helper(),
            ignore(),
            !isEnvProduction && hmr(),
            env(),
            clean(),
            devtool(),
            other(),
            useTypeScript && forktschecker(),
            isEnvProduction && progress(),
            // !isEnvProduction && errorOverlay(),
            !isEnvProduction && devServer(),
            isEnvProduction && jsminimizer(),
            isEnvProduction && cssminimizer(),
            isEnvProduction && splitChunks(),
            resolve()
        ].filter(Boolean);
        // 运行middleware 修改context
        compose(middleware)(context);

        return context;
    };
};

module.exports = web;

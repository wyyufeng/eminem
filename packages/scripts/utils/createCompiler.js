const fs = require('fs');
const compose = require('../config/compose');
const webpack = require('webpack');
const { resolveApp } = require('../utils/paths');
const validate = require('schema-utils');
function createCompiler(config, project, context) {
    let customConfig = null;
    const emCfgPath = resolveApp('em.config.js');
    if (fs.existsSync(emCfgPath)) {
        customConfig = require(emCfgPath);
        validate(require('./config.json'), customConfig, { name: 'Custom Config' });
        project.shouldUseSourceMap = project.isEnvProduction && customConfig.sourceMap;
        project.publicPath = customConfig.publicPath || '/';
    }
    const middleWareMap = Object.keys(config).reduce((a, b) => {
        a.set(b, config[b](project));
        return a;
    }, new Map());
    customConfig.webpackFinal &&
        middleWareMap.set('custom', require(emCfgPath).webpackFinal(project, middleWareMap));
    const middlewareWrappers = compose(Array.from(middleWareMap.values()));

    let compiler;
    try {
        const contextWrappers = middlewareWrappers(context);
        const webpackFinal =
            typeof contextWrappers.toConfig === 'function'
                ? contextWrappers.toConfig()
                : contextWrappers;
        compiler = webpack(webpackFinal);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    return compiler;
}

module.exports = createCompiler;

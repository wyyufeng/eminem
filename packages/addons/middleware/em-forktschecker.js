const resolve = require('resolve');
module.exports = () => (context) => {
    context
        .plugin('ForkTsChecker')
        .use(require.resolve('fork-ts-checker-webpack-plugin'), [
            {
                typescript: resolve.sync('typescript', {
                    basedir: context.paths.nodeModules
                })
            }
        ])
        .end();
    return context;
};

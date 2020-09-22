'use strict';
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');

module.exports = () => (context) => {
    context
        .plugin('ForkTsChecker')
        .use(require.resolve('fork-ts-checker-webpack-plugin'), [
            {
                async: context.isEnvDevelopment,
                typescript: {
                    diagnosticOptions: {
                        semantic: true,
                        syntactic: true
                    },
                    configFile: context.paths.tsConfig
                },
                formatter: context.isEnvProduction ? typescriptFormatter : undefined
            }
        ])
        .end();
    return context;
};

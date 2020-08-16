const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
module.exports = () => (context) => {
    context
        .plugin('ForkTsChecker')
        .use(require.resolve('fork-ts-checker-webpack-plugin'), [
            {
                typescript: {
                    diagnosticOptions: {
                        semantic: true,
                        syntactic: true
                    }
                },
                eslint: {
                    enabled: true,
                    files: './src/**/*.{ts,tsx,js,jsx}'
                },

                formatter: context.isEnvProduction ? typescriptFormatter : undefined
            }
        ])
        .end();
    return context;
};

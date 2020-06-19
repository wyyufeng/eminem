const web = require('./web');
const merge = require('lodash.merge');
const react = (opts = {}) => (context) => {
    const options = merge(
        {
            babel: {
                language: 'javascriptreact'
            },
            eslint: {
                language: 'javascriptreact',
                baseConfig: { extends: ['eslint:recommended', 'plugin:react/recommended'] }
            }
        },
        opts
    );
    web(options)(context);
    return context;
};
module.exports = react;

const web = require('./web');

const react = () => (context) => {
    web({
        babel: {
            language: 'javascriptreact'
        },
        eslint: {
            language: 'javascriptreact',
            baseConfig: { extends: ['eslint:recommended', 'plugin:react/recommended'] }
        }
    })(context);
    return context;
};
module.exports = react;

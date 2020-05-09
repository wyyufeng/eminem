const web = require('./web');

const react = () => (context) => {
    web({
        babel: {
            language: 'javascriptreact'
        },
        eslint: { language: 'javascriptreact' }
    })(context);
    return context;
};
module.exports = react;

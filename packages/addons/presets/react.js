const web = require('./web');

const react = () => () => {
    return web({
        babel: {
            language: 'javascriptreact'
        },
        eslint: { language: 'javascriptreact' }
    });
};
module.exports = react;

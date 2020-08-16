const web = require('./web');
const svg = require('../middleware/em-svgr');

const react = (options = { useTypeScript: false, publicPath: '/', svgr: true }) => (context) => {
    const { useTypeScript, publicPath, svgr } = Object.assign(
        {
            useTypeScript: false,
            publicPath: '/',
            svgr: true
        },
        options
    );

    web({
        useTypeScript,
        publicPath
    })(context);
    if (svgr) {
        svg()(context);
    }
    return context;
};
module.exports = react;

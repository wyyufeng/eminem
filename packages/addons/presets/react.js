'use strict';
const web = require('./web');
const svg = require('../middleware/em-svgr');

const react = (options = { publicPath: '/', svgr: true }) => (context) => {
    const { publicPath, svgr } = Object.assign(
        {
            publicPath: '/',
            svgr: true
        },
        options
    );

    web({
        publicPath
    })(context);
    if (svgr) {
        svg()(context);
    }
    return context;
};
module.exports = react;

module.exports = {
    webpackFinal: () => {
        // do something
        return (/** @type {import('webpack-chain')} */ context) => {
            return context;
        };
    }
};

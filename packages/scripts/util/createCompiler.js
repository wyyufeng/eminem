const webpack = require('webpack');
function createCompiler(finalConfig) {
    let compiler;
    try {
        compiler = webpack(finalConfig);
    } catch (error) {
        console.error('\nAn error occurred when create the webpack compiler.\n');
        console.log(error);
        process.exit(1);
    }
    return compiler;
}

module.exports = createCompiler;

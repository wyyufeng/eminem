const fs = require('fs-extra');
function parse(path) {
    if (!fs.existsSync(path)) {
        console.error('manifest.json 文件不存在！');
        process.exit(1);
    }
    const manifest = fs.readJsonSync(path);
    Object.keys(manifest).reduce((a, b) => {}, {});
}

module.exports = parse;

const fs = require('fs-extra');
const path = require('path');
function createAppTemplateFile(type = 'vanilla', projectDir, name) {
    const dest = path.resolve(projectDir, `./src/app/${name}/`);

    fs.mkdirSync(dest);
    const publicDir = path.resolve(projectDir, './public');
    fs.copyFileSync(
        path.resolve(__dirname, `./index.${type}.js`),
        path.resolve(dest, './index.js')
    );
    fs.copyFileSync(
        path.resolve(__dirname, './index.html'),
        path.resolve(publicDir, `./${name}.html`)
    );
    fs.copyFileSync(path.resolve(__dirname, './index.css'), path.resolve(dest, './index.css'));
}

function createProjectTemplate(projectDir) {
    fs.mkdirSync(projectDir);
    fs.copySync(path.resolve(__dirname, './structure'), path.resolve(projectDir));
}
module.exports = { createAppTemplateFile, createProjectTemplate };

const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

async function createAppTemplateFile(type = 'vanilla', projectDir, name) {
    const dest = path.resolve(projectDir, `./src/app/${name}/`);
    fs.mkdirSync(dest);
    const publicDir = path.resolve(projectDir, './public');
    fs.copyFileSync(
        path.resolve(__dirname, `./index.${type}.js`),
        path.resolve(dest, './index.js')
    );

    const str = await randomStr();
    writeJSFile(
        path.resolve(dest, './index.js'),
        `
        import './global.css';
        document.body.innerHTML = \`<div class="container">
            <p>
            ${str.text}
            </p>
            <span>——${str.author}，《${str.name}》</span>
        </div>\`
        `
    );

    fs.copyFileSync(
        path.resolve(__dirname, './index.html'),
        path.resolve(publicDir, `./${name}.html`)
    );
    fs.copyFileSync(path.resolve(__dirname, './index.css'), path.resolve(dest, './global.css'));
}

function writeJSFile(dest, source) {
    fs.writeFileSync(dest, source);
}
async function randomStr() {
    try {
        const res = await fetch('https://open.saintic.com/api/sentence/');
        const json = await res.json();
        return {
            text: json.data.sentence,
            author: json.data.author,
            name: json.data.name
        };
    } catch (error) {
        return {
            text: '你可长点心吧',
            author: '',
            name: ''
        };
    }
}
function createProjectTemplate(projectDir) {
    fs.copySync(path.resolve(__dirname, './structure'), path.resolve(projectDir));
}
module.exports = { createAppTemplateFile, createProjectTemplate };

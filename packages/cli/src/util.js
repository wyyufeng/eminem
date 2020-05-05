const spawn = require('cross-spawn');
const logger = require('./logger');
function installPkg(deps = [], useYarn = false, usecnpm = false) {
    const command = useYarn ? 'yarn' : 'npm';
    return new Promise((resolve, reject) => {
        const args = [];
        if (command === 'npm') {
            args.push('install', ...deps, '--save-dev', '--no-optional');
        }
        if (command === 'yarn') {
            args.push('add', ...deps, '--dev', '--ignore-optional');
        }
        usecnpm && args.push('--registry', 'https://registry.npm.taobao.org');
        logger.info(`正在使用${command}安装依赖...`);
        spawn(command, [...args], {
            stdio: 'inherit'
        }).on('close', (code) => {
            if (code !== 0) {
                reject();
                return;
            }
            resolve();
        });
    });
}
module.exports = {
    installPkg
};

const logSymbols = require('log-symbols');
const spawn = require('cross-spawn');
function info(msg) {
    console.log(logSymbols.info, msg);
}

function success(msg) {
    console.log(logSymbols.success, msg);
}
function error(msg) {
    console.log(logSymbols.error, msg);
}
function warn(msg) {
    console.log(logSymbols.warning, msg);
}
function installPkg(deps = [], useYarn = false, usecnpm = false) {
    const command = useYarn ? 'yarn' : 'npm';
    return new Promise((resolve, reject) => {
        const args = [];
        if (command === 'npm') {
            args.push('install');
        }
        if (command === 'yarn') {
            args.push('add');
        }
        args.push(...deps);
        usecnpm && args.push('--registry', 'https://registry.npm.taobao.org');
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
    info,
    success,
    error,
    warn,
    installPkg
};

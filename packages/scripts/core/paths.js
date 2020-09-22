'use strict';
const fs = require('fs');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => {
    return path.resolve(appDirectory, relativePath);
};

function setupPaths() {
    const paths = {};
    paths.appSource = resolvePath('src');
    paths.appPublic = resolvePath('public');
    paths.appOutput = resolvePath('build');
    paths.nodeModules = resolvePath('node_modules');
    paths.dotEnv = resolvePath('.env');
    paths.yarnLockFile = resolvePath('yarn.lock');
    paths.tsConfig = resolvePath('tsconfig.json');
    return paths;
}
module.exports = setupPaths();

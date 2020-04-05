const path = require('path');
const fs = require('fs-extra');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const paths = {
    resolveApp,
    get appPublic() {
        return resolveApp('public');
    },
    get appPath() {
        return appDirectory;
    },
    get appSrc() {
        return resolveApp('src');
    },
    get appBuild() {
        return resolveApp('build');
    },
    get appBuildFileName() {
        return 'build';
    },
    get dotEnv() {
        return resolveApp('.env');
    },
    get nodeModules() {
        return resolveApp('node_modules');
    },
    get copyFilePath() {
        return resolveApp('COPYIT');
    },
    get appsAbsolutePath() {
        const emrc = fs.readJSONSync(resolveApp('eminem.json'));
        const apps = emrc.app;

        return apps.reduce((a, b) => {
            a[b.name] = {
                html: resolveApp('public/' + b.html),
                entry: resolveApp('src/' + b.entry)
            };
            return a;
        }, {});
    }
};

module.exports = paths;

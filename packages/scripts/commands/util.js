const fs = require('fs-extra');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const semver = require('semver');
const util = {
    paths: {
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
                    entry: resolveApp('sec/app/' + b.entry)
                };
                return a;
            }, {});
        }
    },
    version: {
        current() {
            const emrc = fs.readJSONSync(resolveApp('eminem.json'));
            return emrc.version;
        },
        inc() {
            const emrc = fs.readJSONSync(resolveApp('eminem.json'));
            // 第一次打包
            if (!semver.eq(emrc.version, '0.0.0')) {
                const _buildPath = resolveApp(util.paths.appBuildFileName);
                if (fs.existsSync(_buildPath)) {
                    fs.removeSync(_buildPath);
                }
            }
            const nextVersion = semver.inc(emrc.version, 'major');
            emrc.version = nextVersion;
            fs.writeJSONSync(resolveApp('eminem.json'), emrc, {
                replacer: null,
                spaces: 4
            });
        }
    },
    resolveApp
};

module.exports = util;

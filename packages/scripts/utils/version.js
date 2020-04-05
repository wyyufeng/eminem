const fs = require('fs-extra');
const semver = require('semver');
const paths = require('./paths');
const version = {
    current() {
        const emrc = fs.readJSONSync(paths.resolveApp('eminem.json'));
        return emrc.version;
    },
    inc() {
        const emrc = fs.readJSONSync(paths.resolveApp('eminem.json'));
        // 第一次打包
        if (!semver.eq(emrc.version, '0.0.0')) {
            const _buildPath = paths.resolveApp(paths.appBuildFileName);
            if (fs.existsSync(_buildPath)) {
                fs.removeSync(_buildPath);
            }
        }
        const nextVersion = semver.inc(emrc.version, 'major');
        emrc.version = nextVersion;
        fs.writeJSONSync(paths.resolveApp('eminem.json'), emrc, {
            replacer: null,
            spaces: 4
        });
    }
};

module.exports = version;

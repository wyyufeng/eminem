const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const version = {
    current() {
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        return fs.readJSONSync(pkgPath).version;
    },
    // 生成版本号并写入pkg.json
    incBuildVersion() {
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const current = this.current();

        const pkg = fs.readJSONSync(pkgPath);
        const pkgCopy = JSON.parse(JSON.stringify(pkg));
        const nextVersion = semver.inc(current, 'major');
        pkgCopy.version = nextVersion;
        try {
            fs.writeJSONSync(pkgPath, pkgCopy, {
                replacer: null,
                spaces: 4
            });
        } catch (error) {
            console.error('\nAn error occurred when setting the version.\n');
            console.log(error);
        }
    },
    nextVersion() {
        const current = this.current();
        const nextVersion = semver.inc(current, 'major');
        return nextVersion;
    }
};

module.exports = version;

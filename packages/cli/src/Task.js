const fs = require('fs-extra');
const path = require('path');
process.on('unhandledRejection', (err) => {
    throw err;
});

/**
 * @description 命令行任务
 * @author
 * @class Task
 */
class Task {
    constructor() {
        this._projectRoot = process.cwd();
    }
    /**
     *
     * @returns em的工作目录
     * @readonly
     * @memberof Task
     */
    get projectRoot() {
        if (fs.existsSync(path.resolve(this._projectRoot, 'eminem.json'))) {
            return this._projectRoot;
        }
        throw Error('嘤嘤嘤~~当前不是eminem的工作目录！');
    }
    /**
     * 相对em工作目录的文件目录
     * @param {String} dest - 目录
     * @returns {String} 地址
     * @memberof Task
     */
    getDir(dest) {
        return path.resolve(this.projectRoot, dest);
    }
    /**
     * 读取配置文件内容
     *
     * @returns {Object} - 配置文件对象
     * @memberof Task
     */
    getConfig() {
        return fs.readJSONSync(this.getDir('eminem.json'));
    }
    /**
     * 写入配置文件
     *
     * @param {Object} data - 待写入的对象
     * @returns
     * @memberof Task
     */
    writeConfig(data) {
        return fs.writeJSONSync(this.getDir('eminem.json'), data, {
            spaces: 4,
            replacer: null
        });
    }
    patchConfig(data) {
        const config = this.getConfig();
        this.writeConfig(Object.assign(config, data));
    }
}

module.exports = Task;

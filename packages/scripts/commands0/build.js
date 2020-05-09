process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.on('unhandledRejection', (err) => {
    throw err;
});
require('../config/env');

const { base, prod } = require('../config');
const context = require('../config/context');
const filesize = require('filesize');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const gzipSize = require('gzip-size');
const flatten = require('array-flatten').flatten;
const paths = require('../utils/paths');
const version = require('../utils/version');
const logger = require('../utils/logger');
const createCompiler = require('../utils/createCompiler');
const WARN_AFTER_BUNDLE_GZIP_SIZE = 250 * 1024; //kb
let project;
try {
    project = fs.readJSONSync(paths.resolveApp('eminem.json'));
} catch (error) {
    console.log();
    console.error('嘤嘤嘤~~当前不是eminem的工作目录！');
    process.exit(1);
}

function setup() {
    version.inc();
    project.version = version.current();
    project.isEnvProduction = true;
    project.isEnvDevelopment = false;
    project.appPath = paths.appPath;
    project.appSrc = paths.appSrc;
    project.appBuild = paths.appBuild;
    project.appBuildFileName = paths.appBuildFileName;
}
setup();
build();

function build() {
    let compiler = createCompiler(Object.assign(base, prod), project, context);
    const buildDir = paths.appBuild;

    try {
        fs.emptyDirSync(buildDir);
    } catch (e) {
        console.log(e);
        console.log(
            `${chalk.redBright('删除build文件夹失败,请检查build文件夹是否被其他程序占用！')}`
        );
    }
    logger.info('正在构建...');
    copyPublicFolder();
    compiler.run((err, stats) => {
        if (err) {
            console.log(`嘤嘤嘤~ 构建失败！`);
            console.log(err);
            process.exit(1);
        }
        if (stats.hasErrors()) {
            return console.log(`${chalk.yellowBright('哪里出了点问题呀~~')}`);
        }
        printFileSize(buildDir);
        logger.info('构建完成！');
        fs.writeJSON(
            './stats.json',
            stats.toJson({
                source: false
            })
        );
        console.log(
            `您可以通过命令 ${chalk.blueBright('npx serve build')} 启动静态服务查看构建结果！`
        );
    });
}

function printFileSize(dir) {
    const fileSizes = measureFileSize(dir);
    const result = flatten(fileSizes);
    const msg = result.reduce((a, b) => {
        let size = filesize(b.size);
        size = size.length < 20 ? size + ' '.repeat(20 - size.length) : size;
        const str = chalk.greenBright(`${size} ${b.file} \n`);
        a = a + str;
        return a;
    }, '');
    console.log();
    console.log('构建结果经过Gzip压缩后大小为：');
    console.log();
    console.log(msg);
    console.log();
    const warnChunks = result.filter(
        (file) => file.size > WARN_AFTER_BUNDLE_GZIP_SIZE && path.extname(file.file) !== '.map'
    );
    if (warnChunks.length > 0) {
        console.log(
            chalk.yellowBright(
                `以下资源过大(>${filesize(WARN_AFTER_BUNDLE_GZIP_SIZE)}),可能会影响网站性能：`
            )
        );
        console.log();
        warnChunks.forEach((i) => {
            console.log(`${chalk.yellowBright(i.file)}(${chalk.redBright(filesize(i.size))}) \n`);
        });
        console.log(`${chalk.yellowBright('建议对其优化！')} \n`);
        console.log('\n');
    }
}
function measureFileSize(file) {
    const fileStats = fs.statSync(file);
    if (fileStats.isDirectory()) {
        return fs.readdirSync(file).map((f) => {
            const fStats = fs.statSync(path.resolve(file, f));
            if (fStats.isDirectory()) {
                return measureFileSize(path.resolve(file, f));
            } else {
                return {
                    file: path.resolve(file, f).split(paths.appBuildFileName)[1],
                    size: gzipSize.fileSync(path.resolve(file, f))
                };
            }
        });
    } else {
        return {
            file: file,
            size: gzipSize.fileSync(file)
        };
    }
}

function copyPublicFolder() {
    const appsAbsolutePath = paths.appsAbsolutePath;
    const htmlPaths = Object.keys(appsAbsolutePath).map((key) => appsAbsolutePath[key].html);
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: (file) => !htmlPaths.includes(file)
    });
}

module.exports = build;
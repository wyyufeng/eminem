process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const formatMessages = require('webpack-format-messages');
const flatten = require('array-flatten').flatten;
const filesize = require('filesize');
const gzipSize = require('gzip-size');
const version = require('../util/version');
const WARN_AFTER_BUNDLE_SIZE = 250 * 1024; //kb

process.on('unhandledRejection', (err) => {
    throw err;
});
const { WebpackFinalConfig } = require('@eminemjs/core');
const createCompiler = require('../util/createCompiler');
const options = {};
function setupOptions() {
    options.isEnvProduction = true;
    options.isEnvDevelopment = false;
    options.version = version.nextVersion();
}
setupOptions();

function build() {
    const webpackFinalCompiler = new WebpackFinalConfig(options);
    const finalConfig = webpackFinalCompiler.toWebpack();
    const compiler = createCompiler(finalConfig);
    compiler.run((err, stats) => {
        if (err) {
            console.log(`build failed...(T＿T)`);
            console.log(err);
            process.exit(1);
        }
        const messages = formatMessages(stats);
        if (stats.hasErrors()) {
            console.log(chalk.redBright('Failed to build.'));
            messages.errors.forEach((e) => console.log(e));
            return;
        }
        printFileSize(webpackFinalCompiler.context.paths.appOutput);
        version.incBuildVersion();
        console.log('build complete！(oﾟ▽ﾟ)o  ');

        fs.writeJSON(
            './stats.json',
            stats.toJson({
                source: false
            }),
            {
                spaces: 4,
                replacer: null
            }
        );
        console.log(`You can view the result with:  ${chalk.blueBright('npx serve build')}`);
    });
}

build();

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
    console.log('The assets size after gzip ：');
    console.log();
    console.log(msg);
    console.log();
    const warnChunks = result.filter(
        (file) => file.size > WARN_AFTER_BUNDLE_SIZE && path.extname(file.file) !== '.map'
    );
    if (warnChunks.length > 0) {
        console.log(
            chalk.yellowBright(
                `The following asset(s) exceed the recommended size limit(>${filesize(
                    WARN_AFTER_BUNDLE_SIZE
                )}).This can impact web performance.`
            )
        );
        console.log();
        warnChunks.forEach((i) => {
            console.log(`${chalk.yellowBright(i.file)}(${chalk.redBright(filesize(i.size))}) \n`);
        });
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
                    file: f,
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

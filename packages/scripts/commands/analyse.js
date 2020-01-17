const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const statsPath = path.resolve(process.cwd(), './stats.json');
const util = require('./util');
const buildPath = util.paths.appBuild;
const chalk = require('chalk');

const analyzerBinPath = path.resolve(
    __dirname,
    '../node_modules/webpack-bundle-analyzer/lib/bin/analyzer.js'
);

if (fs.existsSync(statsPath)) {
    exec(`node ${analyzerBinPath} ${statsPath} ${buildPath}`, (err) => {
        if (err) {
            console.log('嘤嘤嘤~分析失败了呀');
            console.log(err);
        }
    });
} else {
    console.log(`请先运行 ${chalk.blueBright('npm run build')}生成stats.json 文件，然后执行该命令`);
}

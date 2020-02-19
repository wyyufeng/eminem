#!/usr/bin/env node

const commander = require('commander');
const path = require('path');
const validAppName = require('validate-npm-package-name');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const InitTask = require('./tasks/Init');
const { info, error, warn } = require('./tasks/util');
process.on('unhandledRejection', (err) => {
    throw err;
});
const program = new commander.Command('eminem');

let projectName;

program
    .command('init <project-directory>')
    .description('初始化项目')
    .option('--template <template>', '模板名称')
    .option('--useYarn', '是否使用yarn作为包管理器')
    .option('--usecnpm', '使用淘宝源')
    .action((name, options) => {
        projectName = name;
        const projectDir = path.resolve(process.cwd(), projectName);
        const isCurrentDir = projectName === '.';
        validateName(name, isCurrentDir);
        checkProjectDir(isCurrentDir, projectDir).then(() => {
            new InitTask(name, options.template, options.useYarn).createApp();
        });
    });

program.parse(process.argv);

function validateName(projectName, isCurrentDir) {
    const name = isCurrentDir ? path.relative('../', process.cwd()) : projectName;
    const result = validAppName(name);
    if (result.errors) {
        result.errors.forEach((err) => {
            console.log(chalk.red.dim('Error: ' + err));
            process.exit(1);
        });
    }
}

async function checkProjectDir(isCurrentDir, projectDir) {
    if (fs.existsSync(projectDir)) {
        if (isCurrentDir) {
            const { ok } = await inquirer.prompt([
                {
                    name: 'ok',
                    type: 'confirm',
                    message: `是否在当前目录下创建项目?`
                }
            ]);
            if (!ok) return process.exit(1);
        } else {
            const { ok } = await inquirer.prompt([
                {
                    name: 'ok',
                    type: 'confirm',
                    message: `目录 ${chalk.cyan(projectDir)} 已经存在，是否覆盖?`
                }
            ]);
            if (!ok) {
                warn('退出拉倒!');
                return process.exit(1);
            }
            if (ok) {
                info(`正在删除 ${chalk.cyan(projectDir)}...`);

                // 为啥有时候remove会失败呢
                try {
                    fs.removeSync(projectDir);
                    if (fs.existsSync(projectDir)) {
                        fs.emptyDirSync(projectDir);
                    } else {
                        fs.mkdirSync(projectDir);
                    }
                } catch (e) {
                    error('删除文件时出现异常，请重试！');
                    process.stdout.write('\n');
                    console.error(e);
                    process.exit(1);
                }
            }
        }
    } else {
        fs.mkdirSync(projectDir);
    }
}
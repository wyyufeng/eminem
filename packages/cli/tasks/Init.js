const Task = require('./Task');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { info, success, error, installPkg } = require('./util');
class InitTask extends Task {
    constructor(name, template, useYarn, usecnpm) {
        super();
        this.template = template;
        this.appName = name;
        this.useYarn = useYarn;
        this.usecnpm = usecnpm;
        this.projectDir = path.resolve(path.resolve(process.cwd(), name));
        this.dependencies = ['em-scripts', template];
        this.templatePath = path.resolve(
            this.projectDir,
            './node_modules',
            this.template,
            './template'
        );
        this.templateJsonPath = path.resolve(
            this.projectDir,
            './node_modules',
            this.template,
            'template.json'
        );
        this.packageJson = {
            name: name,
            version: '0.0.0'
        };
    }

    async createApp() {
        info(`正在 ${chalk.cyan(this.projectDir)}下新建项目...`);
        const emrc = {
            name: '',
            version: '0.0.0',
            app: []
        };
        fs.writeJSONSync(path.resolve(this.projectDir, 'package.json'), this.packageJson, {
            spaces: 4,
            replacer: null
        });
        fs.writeJSONSync(path.resolve(this.projectDir, '.eminemrc'), emrc, {
            spaces: 4,
            replacer: null
        });

        this.install().then(() => {
            this.copyTemplate();
            this.getTemplateInfo();
        });
    }
    install() {
        info('正在安装依赖...');
        process.stdout.write('\n');
        process.chdir(this.projectDir);

        return new Promise((resolve, reject) => {
            installPkg(this.dependencies)
                .then(() => {
                    success('依赖安装完成！');
                    resolve();
                })
                .catch(() => {
                    error('依赖安装失败！');
                    reject();
                });
        });
    }
    copyTemplate() {
        info(`正在复制模板${chalk.cyan(this.template)}`);
        if (fs.existsSync(this.templatePath)) {
            fs.copySync(this.templatePath, this.projectDir);
        } else {
            error(`抱歉，无法找到模板文件: ${chalk.green(this.templatePath)}`);
            return;
        }
    }

    getTemplateInfo() {
        const templateJson = fs.readJSONSync(this.templateJsonPath);
        const templateJsonPackage = templateJson.package || {};
        const templateJsonDev = templateJson.dev || {};
        const templateDeps = templateJsonPackage.dependencies || {};
        const templateMeta = templateJsonDev.meta;
        const templateDepsName = Object.keys(templateDeps);
        const config = this.getConfig();
        if (Array.isArray(templateMeta)) {
            config.app.push(...templateMeta);
        } else {
            config.app.push(templateMeta);
        }
        this.writeConfig(config);
        info('正在安装模板依赖...');
        installPkg(templateDepsName)
            .then(() => {
                success('模板依赖安装完成');
            })
            .catch(() => {
                error('模板依赖安装失败');
            });
    }
}

module.exports = InitTask;

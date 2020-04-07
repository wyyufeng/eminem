const Task = require('./Task');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { info, success, error, installPkg, warn } = require('./util');
class InitTask extends Task {
    constructor(name, template = 'em-template', useYarn, usecnpm) {
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
            version: '0.0.0',
            scripts: {
                start: 'em-scripts dev',
                build: 'em-scripts build',
                analyse: 'em-scripts analyse'
            }
        };
    }

    async createApp() {
        info(`正在 ${chalk.cyan(this.projectDir)}下新建项目...`);
        const emrc = {
            name: this.appName,
            version: '0.0.0',
            app: []
        };
        fs.writeJSONSync(path.resolve(this.projectDir, 'package.json'), this.packageJson, {
            spaces: 4,
            replacer: null
        });
        fs.writeJSONSync(path.resolve(this.projectDir, 'eminem.json'), emrc, {
            spaces: 4,
            replacer: null
        });

        this.install().then(() => {
            this.copyTemplate();
            this.getTemplateInfo()
                .then(() => {
                    success('项目创建完成!');
                    warn(
                        'em使用sharp(https://sharp.pixelplumbing.com/)来压缩优化图片，由于网络原因,请单独安装 npm install sharp '
                    );
                    console.log(`使用 ${chalk.cyan('cd ' + this.appName)}`);
                    console.log(`使用 ${chalk.cyan('npm start')}     启动项目`);
                    console.log(`使用 ${chalk.cyan('npm run build')} 构建项目`);
                })
                .catch(() => {
                    error('嘤嘤嘤,项目创建失败了!');
                });
        });
    }
    install() {
        info('正在安装依赖...');
        process.stdout.write('\n');
        process.chdir(this.projectDir);

        return new Promise((resolve, reject) => {
            installPkg(this.dependencies, this.useYarn, this.usecnpm)
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
            error(
                `抱歉，无法找到模板文件: ${chalk.red(this.templatePath)},请检查模板是否正常安装。`
            );
            return;
        }
    }

    getTemplateInfo() {
        return new Promise((resolve, reject) => {
            const templateJson = fs.readJSONSync(this.templateJsonPath);
            const templateJsonPackage = templateJson.package || {};
            const templateJsonDev = templateJson.dev || {};
            const templateDeps = templateJsonPackage.dependencies || {};
            const templateMeta = templateJsonDev.meta;
            const templateDepsName = Object.keys(templateDeps);
            const config = fs.readJSONSync(path.resolve(this.projectDir, './eminem.json'));
            if (Array.isArray(templateMeta)) {
                config.app.push(...templateMeta);
            } else {
                config.app.push(templateMeta);
            }

            fs.writeJSONSync(path.resolve(this.projectDir, './eminem.json'), config, {
                spaces: 4,
                replacer: null
            });
            info('正在安装模板依赖...');
            installPkg(templateDepsName, this.useYarn, this.usecnpm)
                .then(() => {
                    success('模板依赖安装完成');
                    resolve();
                })
                .catch(() => {
                    error('模板依赖安装失败');
                    reject();
                });
        });
    }
}

module.exports = InitTask;

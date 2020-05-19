const Task = require('./Task');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { installPkg } = require('./util');
const logger = require('./logger');

class InitTask extends Task {
    constructor(name, isCurrentDir, template = '@eminemjs/template', useYarn, usecnpm) {
        super();
        this.isCurrentDir = isCurrentDir;
        this.template = template;
        this.appName = name;
        this.useYarn = useYarn;
        this.usecnpm = usecnpm;
        this.projectDir = isCurrentDir
            ? path.resolve(process.cwd())
            : path.resolve(path.resolve(process.cwd(), name));
        this.dependencies = [template, '@eminemjs/addons', '@eminemjs/scripts'];
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
            description: this.appName,
            license: 'MIT',
            repository: 'whatever',
            scripts: {
                start: 'em-scripts dev',
                build: 'em-scripts build',
                analyse: 'em-scripts analyse'
            }
        };
    }

    async createApp() {
        logger.info(`正在 ${chalk.cyan(this.projectDir)}下新建项目...`);
        fs.writeJSONSync(path.resolve(this.projectDir, 'package.json'), this.packageJson, {
            spaces: 4,
            replacer: null
        });

        this.install().then(() => {
            this.copyTemplate();
            this.getTemplateInfo()
                .then(() => {
                    logger.success('项目创建完成!');
                    !this.isCurrentDir &&
                        console.log(`使用 ${chalk.cyan('cd ' + this.appName)} 切换至项目目录`);
                    console.log(`使用 ${chalk.cyan('npm start')}     启动项目`);
                    console.log(`使用 ${chalk.cyan('npm run build')} 构建项目`);
                })
                .catch((err) => {
                    logger.error('嘤嘤嘤,项目创建失败了!');
                    console.log(err);
                });
        });
    }
    install() {
        process.stdout.write('\n');
        process.chdir(this.projectDir);

        return new Promise((resolve, reject) => {
            installPkg(this.dependencies, this.useYarn, this.usecnpm)
                .then(() => {
                    logger.success('依赖安装完成！');
                    resolve();
                })
                .catch(() => {
                    logger.error('依赖安装失败！');
                    reject();
                });
        });
    }
    copyTemplate() {
        logger.info(`正在复制模板${chalk.cyan(this.template)}`);
        if (fs.existsSync(this.templatePath)) {
            fs.copySync(this.templatePath, this.projectDir);
        } else {
            logger.error(
                `抱歉，无法找到模板文件: ${chalk.red(this.templatePath)},请检查模板是否正常安装。`
            );
            return;
        }
    }

    getTemplateInfo() {
        return new Promise((resolve, reject) => {
            const templateJson = fs.readJSONSync(this.templateJsonPath);
            const templateDeps = templateJson.dependencies || {};
            const templateDepsName = Object.keys(templateDeps);
            logger.info('正在安装模板依赖...');
            installPkg(templateDepsName, this.useYarn, this.usecnpm)
                .then(() => {
                    logger.success('模板依赖安装完成');
                    resolve();
                })
                .catch(() => {
                    logger.error('模板依赖安装失败');
                    reject();
                });
        });
    }
}

module.exports = InitTask;

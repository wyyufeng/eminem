const Task = require("./task");
const path = require("path");
const validAppName = require("validate-npm-package-name");
const chalk = require("chalk");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const ora = require("ora");
const { exec } = require("child_process");
const spawn = require("cross-spawn");

const {
  createAppTemplateFile,
  createProjectTemplate
} = require("@mpfe/em-template");
process.on("unhandledRejection", err => {
  throw err;
});

module.exports = class Create extends Task {
  constructor(projectName, template = "vanilla") {
    super();
    this.template = template;
    this.templateTypes = ["reactapp", "vanilla"];
    this.project = { projectDir: null, name: projectName };
    this.init();
  }
  init() {
    const projectDir = path.resolve(process.cwd(), this.project.name);
    this.project.projectDir = projectDir;
    this.validate();
    this.checkProjectDir();
  }
  validate() {
    this.isCurrent = this.project.projectDir === ".";
    const name = this.isCurrent
      ? path.relative("../", process.cwd())
      : this.project.name;
    const result = validAppName(name);
    if (result.errors) {
      result.errors.forEach(err => {
        console.error(chalk.red.dim("Error: " + err));
        process.exit(1);
      });
    }
    if (!this.templateTypes.includes(this.template)) {
      console.error(
        chalk.red.dim(
          `请选择正确的模板，当前支持${this.templateTypes.join("  ")}`
        )
      );
      process.exit(1);
    }
  }
  async checkProjectDir() {
    const { projectDir, name } = this.project;
    if (fse.existsSync(this.project.projectDir)) {
      if (this.isCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: "ok",
            type: "confirm",
            message: `在当前目录创建工程吗?`
          }
        ]);
        if (!ok) return;
      } else {
        const { ok } = await inquirer.prompt([
          {
            name: "ok",
            type: "confirm",
            message: `目录 ${chalk.cyan(projectDir)} 已经存在，是否覆盖?`
          }
        ]);
        if (!ok) {
          return;
        }
        if (ok) {
          console.log(`正在删除 ${chalk.cyan(projectDir)}...`);

          // 为啥有时候remove会失败呢
          try {
            fse.removeSync(projectDir);
            if (fse.existsSync(projectDir)) {
              fse.emptyDirSync(projectDir);
            } else {
              fse.mkdirSync(projectDir);
            }
          } catch (error) {
            console.log("删除文件时出现异常，请重试！");
            process.stdout.write("\n");
            console.error(error);
            process.exit(1);
          }
        }
      }
    }
    console.log(
      `即将在 ${chalk.blueBright(projectDir)} 下创建项目 ${chalk.blueBright(
        name
      )}`
    );
    this.createProject();
  }

  async createProject() {
    console.log("正在初始化项目...");
    try {
      const { projectDir, name } = this.project;
      createProjectTemplate(projectDir);
      createAppTemplateFile(this.template, projectDir, "index");
      const eminemrc = {
        version: "0.0.0",
        app: [
          {
            name: "index",
            entry: "app/index/index.js",
            template: "index.html"
          }
        ]
      };

      fse.writeJSONSync(path.resolve(projectDir, ".eminemrc"), eminemrc, {
        spaces: 4,
        replacer: null
      });
      const dependencies = ["@mpfe/em-scripts"];
      const pkg = {
        name: name,
        scripts: {
          start: "em-scripts serve",
          build: "em-scripts build",
          analyse: "em-scripts analyse"
        }
      };
      if (this.template === "reactapp") {
        dependencies.push("react", "react-dom");
      }
      fse.writeJSONSync(path.resolve(projectDir, "package.json"), pkg, {
        spaces: 4,
        replacer: null
      });
      this.installProjectDeps(dependencies, projectDir)
        .then(() => {
          console.log(
            `项目初始化完成,使用${chalk.blue(
              "cd " + name
            )}切换至项目目录，在项目目录下可以使用如下命令:`
          );
          console.log();
          console.log(chalk.greenBright("npm start:启动开发服务器"));
          console.log();
          console.log(chalk.greenBright("npm run build:构建发布包"));
          process.exit(1);
        })
        .catch(() => {
          process.exit(1);
        });
    } catch (error) {
      console.log("嘤嘤嘤~ 项目初始化失败!");
      console.log(error);
    }
  }

  installProjectDeps(dependencies, projectDir) {
    process.chdir(projectDir);
    process.stdout.write("\n");
    // eslint-disable-next-line no-console

    const command = "npm";
    return new Promise((resolve, reject) => {
      console.log("正在设置npm参数...");
      spawn.sync(command, [
        "config",
        "set",
        "sharp_dist_base_url",
        "https://npm.taobao.org/mirrors/sharp-libvips/v8.8.1/",
        "sass_binary_site",
        "https://npm.taobao.org/mirrors/node-sass/",
        { stdio: "inherit" }
      ]);
      const args = [
        "install",
        ...dependencies,
        "--registry",
        "https://registry.npm.taobao.org"
      ];
      const o = ora("正在安装依赖...").start();
      const child = spawn.sync(command, args, { stdio: "inherit" });
      child.on("close", code => {
        if (code !== 0) {
          process.stdout.write("\n");
          console.log(`${command} ${args.join(" ")}`);
          process.stdout.write("\n");
          o.fail("嘤嘤嘤~ 依赖安装失败！");

          reject(`${command} ${args.join(" ")}`);
          return;
        }
        process.stdout.write("\n");
        o.succeed("依赖安装完成!");
        process.stdout.write("\n");
        resolve();
      });
    });
  }
};

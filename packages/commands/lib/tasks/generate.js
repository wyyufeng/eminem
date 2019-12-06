const Task = require("./task");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const chalk = require("chalk");
const { createAppTemplateFile } = require("@mpfe/em-template");
process.on("unhandledRejection", err => {
  throw err;
});
module.exports = class generate extends Task {
  constructor(schematic) {
    super();
    this.init(schematic);
  }
  init(schematic) {
    if (schematic === "application") {
      new GenerateApp().talk();
    }
  }
};

class GenerateApp extends Task {
  constructor() {
    super();
  }
  talk() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "appName",
          message: "请告诉我app的名字吧~",
          validate: input => {
            if (!input) {
              return "不能为空哦，会让人家很为难的~";
            }
            if (fs.existsSync(this.getAppDir(input))) {
              return `${input}已经存在了，换个名字吧~`;
            }
            return true;
          }
        },
        {
          type: "list",
          message: "这是个什么技术类型的APP呢",
          name: "template",
          choices: [
            {
              value: "vanilla",
              checked: true
            },
            {
              value: "reactapp"
            }
          ]
        },
        {
          type: "input",
          name: "description",
          message: "这个页面是用来干嘛的呢？"
        },
        {
          type: "confirm",
          name: "rem",
          message: "是否需要在页面注入rem兼容代码呢"
        }
      ])
      .then(answers => {
        this.write(answers);
      });
  }
  write(answers) {
    console.log(chalk.yellow(`正在写入配置...`));
    const rcJson = this.getConfig();
    const app = {
      name: answers.appName,
      rem: answers.rem,
      description: answers.description,
      entry: `app/${answers.appName}/index.js`,
      template: `app/${answers.appName}/index.html`
    };
    rcJson.app.push(app);
    this.writeConfig(rcJson);
    console.log(chalk.yellow(`正在写入模板...`));
    fs.mkdirSync(this.getAppDir(answers.appName));
    createAppTemplateFile(answers.template, this.projectRoot, answers.appName);
    console.log(chalk.greenBright(`${answers.appName}创建成功！`));
  }
}

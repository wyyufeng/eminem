> 马绍尔·布鲁斯·马瑟斯三世（英语：Marshall Bruce Mathers III，1972 年 10 月 17 日－），知名于其艺名埃米纳姆（Eminem），是一位美国著名说唱歌手、词曲作家、唱片制作人、演员及电影制作人。他一直被认为是嘻哈史上最伟大，最有影响力的说唱歌手，也被称为“说唱之神”(Rap God)。

eminem 是一个 webpack 启动器，它将繁杂的 webpack 配置分解并且收敛在一个 package 中。

-   [创建一个项目](#快速开始)
-   [自定义配置](#修改配置)
-   [自定义模板](#template)

目前已经可以正常使用，但功能正在优化中，新特性也会陆续增加。

#### 快速开始

```bash
`npm i em-cli -g
 em init my-app
 cd my-app
 npm start
```

通过 `--help`查看命令帮助

#### 修改配置

在根目录新建一个`em.config.js`文件。

```javascript
module.exports = {
    /**
     * @param {Object} project 项目的环境和运行参数
     * @param {Map} middrewares webpack各个配置项集合
     * @param {webpack-chain} context webpack-chain 实例
     */

    webpackFinal: (project, middrewares) => (context) => {
        return context;
    }
};
```

由 redux 受到启发,eminem 在内部调用这些 middreware 时按如下实现，配置文件会作为整个调用链的最后一环，因此可以通过配置文件修改 context 上的任意配置。

```javascript
// 传递project 参数
const middleWareMap = Object.keys(config).reduce((a, b) => {
    a.set(b, config[b](project));
    return a;
}, new Map());

function compose(middlewares = []) {
    return middlewares.reduceRight((a, b) => {
        return (ctx) => a(b(ctx));
    });
}
// 传递 context参数
compose(Array.from(middleWareMap.values()))(context);
```

如果对某项配置改动较大，可以通过`middrewares`对相应的配置删除并重建，或者可以使用这些内置的配置项自己组合出新的配置。

```javascript
/**
Map {
  'entry' => [Function],
  'output' => [Function],
  'htmlPlugin' => [Function],
  'eslintLoader' => [Function],
  'javascriptLoader' => [Function],
  'globalConfig' => [Function],
  'cssLoader' => [Function],
  'sassLoader' => [Function],
  'imageLoader' => [Function],
  'fileLoader' => [Function],
  'resolveModule' => [Function],
  'plugins' => [Function],
  'optimization' => [Function] }
*/

{
    webpackFinal: (project, middrewares) => {
        middrewares.delete('sassLoader');
        return (context) => {
            return context;
        };
    };
}
```

对于 loader 和 plugin 的修改，可参考[webpack-chain](https://github.com/neutrinojs/webpack-chain)

#### template

eminem 使用模板提供各种类型的项目的预设，并且提供了两类项目模板 [`vanilla app`](https://github.com/wyyufeng/eminem/tree/master/packages/em-template) 和[`react app`](https://github.com/wyyufeng/eminem/tree/master/packages/em-template-react)（事实上可以通过`vanilla app`模板修改为任意模板）。

对于一个模板需要在根目录包含 `template.json`文件和 template 文件夹，并在该文件夹下增加你需要的东西，最后将其发布到 npm 即可(后续可能会支持 git repo).

```json
{
    "package": {
        "dependencies": {
            "eslint-config-alloy": "^3.5.0"
        }
    },
    "dev": {
        "meta": {
            "name": "index",
            "entry": "app/index.js",
            "html": "index.html"
        }
    }
}
```

然后再初始化项目时指定模板包名

```bash
em init --template=your-template-package-name
```

const logger = require('../utils/logger');
const chalk = require('chalk');
function webpsupport(project) {
    logger.warn(
        `该插件使用sharp [https://sharp.pixelplumbing.com/] 来转换webp，由于某些原因,请单独安装该模块: ${chalk.greenBright(
            'npm install sharp --unsafe-perm'
        )}`
    );
    console.warn(
        chalk.yellowBright(
            `如果安装出现问题，请参考：https://sharp.pixelplumbing.com/install#custom-prebuilt-binaries，并尝试修改.npmrc的SHARP_DIST_BASE_URL(参考https://npm.taobao.org/mirrors/sharp-libvips) `
        )
    );
    console.warn(chalk.yellowBright('如果依然安装失败，请自己想想办法，少年。( •̀ ω •́ )y'));
    console.log();
    return (/** @type {import("../config/context")} */ context) => {
        context.when(project.isEnvProduction, (config) => {
            config.plugin('webpsupport').use(require('../plugins/WebpGeneratePlugin')).end();
        });
        return context;
    };
}

module.exports = webpsupport;

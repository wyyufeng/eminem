const web = require('@eminemjs/addons/presets/web');
module.exports = {
    apps: [
        {
            entry: 'app/index.js',
            template: 'index.html',
            name: 'index'
        }
    ],
    use: [web()]
};

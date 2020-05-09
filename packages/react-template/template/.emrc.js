const react = require('@eminemjs/addons/presets/react');
module.exports = {
    apps: [
        {
            entry: 'app/index.js',
            template: 'index.html',
            name: 'index'
        }
    ],
    use: [react()]
};

const getLogger = require('webpack-log');
const log = getLogger({ name: 'em-cli', timestamp: true });
log.success = log.info;
module.exports = log;

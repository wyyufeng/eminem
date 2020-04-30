const url = require('url');
const address = require('address');

function formatAddress(port, protocol = 'http') {
    const ip = address.ip();

    const formatUrl = (hostname) =>
        url.format({
            protocol,
            hostname,
            port
        });

    const lanUrl = formatUrl(ip);
    const localUrl = formatUrl('localhost');
    return {
        lanUrl,
        localUrl
    };
}
module.exports = {
    formatAddress
};

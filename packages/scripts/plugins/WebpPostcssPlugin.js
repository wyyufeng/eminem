const postcss = require('postcss');

const IMAGE_PROPERTY_REGEX = /^background(?!-color)|background-image/;
const URL_EXTRACT_REGEX = /url\((?:'|")?(.*?)(?:'|")?\)/;
function testFunc(value) {
    return /url/.test(value) && !/base64/.test(value);
}
module.exports = postcss.plugin('webp-plugin', (opts) => {
    const { clsPrefix, webpSuffix, mode } = opts;
    return (root, result) => {
        const newRoot = postcss.root();
        root.walkRules((rule) => {
            rule.walkDecls(IMAGE_PROPERTY_REGEX, (decl) => {
                const value = decl.value;
                if (testFunc(value)) {
                    const imgPath = URL_EXTRACT_REGEX.exec(value);

                    const newRule = postcss.rule();
                    const selector = '.' + clsPrefix + ' ' + rule.selector;
                    newRule.selector = selector;

                    newRule.prepend({
                        prop: 'background-image',
                        value: `url(${imgPath[1] + webpSuffix})`
                    });
                    newRoot.prepend(newRule);
                }
            });
        });
        if (mode === 'mix') {
            return root.prepend(newRoot);
        }
        result.root = newRoot;
        return newRoot;
    };
});

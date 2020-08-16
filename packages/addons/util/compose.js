function compose(middlewares = []) {
    return middlewares.reduceRight((a, b) => {
        return (ctx) => a(b(ctx));
    });
}

function createLoaderRegExp(exts) {
    return new RegExp(String.raw`\.(${exts.join('|')})$`);
}

module.exports = { compose, createLoaderRegExp };

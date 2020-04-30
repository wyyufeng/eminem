function compose(middlewares = []) {
    return middlewares.reduceRight((a, b) => {
        return (ctx) => a(b(ctx));
    });
}
module.exports = compose;

module.exports = () => (context) => {
    context.module.rule('module').oneOf('normal');
    return context;
};

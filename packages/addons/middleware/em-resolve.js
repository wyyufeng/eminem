const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx'
];
module.exports = (opts = { alias: {} }) => (context) => {
    context.resolve.modules.values('node_modules');

    moduleFileExtensions.forEach((ext) => {
        context.resolve.extensions.add(`.${ext}`);
    });
    const alias = {
        '@': context.paths.appSource,
        ...opts.alias
    };
    for (let [key, value] of Object.entries(alias)) {
        context.resolve.alias.set(key, value);
    }
    return context;
};

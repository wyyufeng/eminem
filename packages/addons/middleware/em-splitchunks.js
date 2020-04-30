module.exports = () => (context) => {
    context.optimization
        .splitChunks({
            chunks: 'all',
            name: false
        })
        .runtimeChunk({ name: (entrypoint) => `runtime~${entrypoint.name}` });
    return context;
};

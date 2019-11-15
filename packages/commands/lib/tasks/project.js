const project = {
  port: 3000,
  host: "0.0.0.0",
  pages: [
    {
      page: "index",
      entry: "app/index/index.js",
      template: "index.html"
    }
  ],
  isEnvProduction: true,
  isEnvDevelopment: false
};

module.exports = project;

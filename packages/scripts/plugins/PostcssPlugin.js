const postcss = require("postcss");

const testProps = ["background", "background-image"];
function testFunc(prop) {
  return testProps.includes(prop);
}
module.exports = postcss.plugin(
  "postcss-plugin-webpsupport",
  (options = {}) => {
    return root => {
      // Transform each rule here
      const clones = [];
      root.walkDecls(/^background/, decl => {
        const selector = decl.parent.selector;
        const clone = decl.parent.clone();
        clone.walkDecls(cdecl => {
          if (testFunc(cdecl.prop)) {
            clone.selector = "#webp " + selector;

            const value = cdecl.value;
            cdecl.value = value.replace(".png", ".png_.webp");
            clones.push(clone);
          } else {
            cdecl.remove();
          }
        });
      });
      root.append(clones);
    };
  }
);

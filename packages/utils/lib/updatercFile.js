const resolvePath = require("./resolvePath");
const fs = require("fs-extra");
module.exports = function writercFile(obj) {
  const rcPath = resolvePath("./.eminemrc");
  fs.writeJSONSync(rcPath, obj, {
    spaces: 4,
    replacer: null
  });
};

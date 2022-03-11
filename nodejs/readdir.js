let testFolder = "../data";
let fs = require("fs");

fs.readdir(testFolder, (err, fileList) => {
  console.log(fileList);
});

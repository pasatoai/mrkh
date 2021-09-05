const fs = require("fs");
const ejs = require("ejs");
const { PL } = require("./text");

ejs.renderFile(
  __dirname + "/views/index.ejs",
  { text: PL, BROWSER_REFRESH: false },
  (err, data) => {
    fs.writeFileSync(__dirname + "/build/index.html", data);
  }
);

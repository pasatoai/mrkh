const fs = require("fs");
const ejs = require("ejs");
const { PL } = require("./text");

fs.mkdirSync(__dirname + "/dist");

fs.readdir(__dirname + "/public", (err, files) => {
  for (const f of files)
    fs.copyFileSync(__dirname + "/public/" + f, __dirname + "/dist/" + f);
});

ejs.renderFile(
  __dirname + "/views/index.ejs",
  { text: PL, BROWSER_REFRESH: false },
  (err, data) => {
    fs.writeFileSync(__dirname + "/dist/index.html", data);
    console.log(err, data);
  }
);

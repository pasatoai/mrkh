const fs = require("fs");
const { promisify } = require("util");
const ejs = require("ejs");
const texts = require("./text");

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);

const langToFileName = (lang) =>
  lang === "PL" ? "index.html" : "index_en.html";

const writeTranslations = () =>
  read(__dirname + "/index.ejs", "utf-8")
    .then((index) => [
      ejs.render(index, { text: texts.PL }),
      ejs.render(index, { text: texts.EN }),
    ])
    .then(([pl, en]) =>
      Promise.all([
        write(__dirname + `/public/${langToFileName("PL")}`, pl),
        write(__dirname + `/public/${langToFileName("EN")}`, en),
      ])
    );

writeTranslations();

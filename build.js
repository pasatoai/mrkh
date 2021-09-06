const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const ejs = require("ejs");
const langs = require("./text");

const makeDir = promisify(fs.mkdir);
const readDir = promisify(fs.readdir);
const copy = promisify(fs.copyFile);

const renderFile = (lang, outFile) =>
  new Promise((res, rej) =>
    ejs.renderFile(
      path.join(__dirname, "views", "index.ejs"),
      { text: langs[lang], BROWSER_REFRESH: false },
      (error, data) =>
        error
          ? rej(error)
          : fs.writeFile(outFile, data, (err) => (err ? rej(err) : res()))
    )
  );

const copyFileToDist = (f) =>
  copy(path.join(__dirname, "public", f), path.join(__dirname, "dist", f));

const DIST_DIR = path.join(__dirname, "dist");
const PUBLIC_DIR = path.join(__dirname, "public");

const copyPublic = () =>
  readDir(PUBLIC_DIR)
    .then((files) => files.map(copyFileToDist))
    .then((prs) => Promise.all(prs));

makeDir(DIST_DIR)
  .then(() =>
    Promise.all([
      copyPublic(),
      renderFile("PL", path.join(__dirname, "dist", "index.html")),
      renderFile("EN", path.join(__dirname, "dist", "index_en.html")),
    ])
  )
  .then(() => console.log("Done"));

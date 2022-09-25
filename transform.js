const fs = require("fs");
const { promisify } = require("util");
const ejs = require("ejs");
const texts = require("./text");
const csv = require("csvtojson");
const path = require("path");
const { join } = require("path");

const readDir = promisify(fs.readdir);
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const rmDir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);

const mkdirOrClean = (path) =>
  fs.existsSync(path)
    ? rmDir(path, { recursive: true }).then(() => mkdir(path))
    : mkdir(path);

const VIEW_FILE = __dirname + "/index.ejs";
const DR_FILE = __dirname + "/dr.ejs";
const DRS_DIR = __dirname + "/drs";
const CSS_DIR = join(__dirname, "public", "css");

const cssFiles = readDir(CSS_DIR).then((files) =>
  files.reduce((acc, cv) => {
    if (cv.includes("map")) return acc;

    if (cv.includes("desktop")) return { ...acc, desktop: cv };

    if (cv.includes("shared")) return { ...acc, shared: cv };

    if (cv.includes("mobile")) return { ...acc, mobile: cv };
  }, {})
);

const langToFileName = (lang) =>
  ({
    PL: "index.html",
    EN: "index_en.html",
    UA: "index_ua.html",
  }[lang]);

const drProps = ["Miasto", "Kontakt"];

const validateDoctor = (dr) =>
  drProps.reduce((acc, prop) => {
    return acc && dr[prop] != null && dr[prop] != "";
  }, true);

const makeCsv = () =>
  csv({
    delimiter: ";",
    includeColumns:
      /(Miasto|Nazwa\/Imię i Nazwisko|Szpital\/klinika|Adres|Kontakt)/,
  });

const processProfession = (drFile) =>
  makeCsv()
    .fromFile(`${DRS_DIR}/${drFile}`)
    .then((drs) =>
      drs.flatMap((dr) => ({ ...dr, prof: drFile.replace(".csv", "") }))
    );

const reduceByCity = (drs) =>
  drs.reduce(
    (acc, { Miasto: city, prof, ...rest }) => {
      if (!acc.details[city]) {
        acc.cities.push(city);
        acc.details[city] = {};
      }

      if (!acc.details[city][prof]) {
        acc.details[city][prof] = [];
      }

      acc.details[city][prof].push(rest);

      return acc;
    },
    { cities: [], details: {} }
  );

const processDoctors = () =>
  readDir(DRS_DIR)
    .then((drsFiles) => drsFiles.map(processProfession))
    .then((execs) => Promise.all(execs))
    .then((profs) => profs.flatMap((p) => p))
    .then((drs) => drs.filter(validateDoctor))
    .then(reduceByCity);

const translationObj = (text, cities, { desktop, shared, mobile }) => {
  const retval = { text };
  retval.text.p6.offices = cities;
  retval.shared_css = shared;
  retval.desktop_css = desktop;
  retval.mobile_css = mobile;
  return retval;
};

const drRenderObj = (city, drDetails) => {
  return { city, drDetails };
};

// bierzemy index.ejs i wstawiawmy wartosci z

async function writeTranslations() {
  const { cities, details } = await processDoctors();
  const [indexTemplate, drTemplate, cssMap] = await Promise.all([
    read(VIEW_FILE, "utf-8"),
    read(DR_FILE, "utf-8"),
    cssFiles,
  ]);

  if (Object.entries(cssMap).length !== 3) throw new Error("Missing css files");

  const pl = ejs.render(
    indexTemplate,
    translationObj(texts.PL, cities, cssMap)
  );
  const en = ejs.render(
    indexTemplate,
    translationObj(texts.EN, cities, cssMap)
  );
  const ua = ejs.render(
    indexTemplate,
    translationObj(texts.UA, cities, cssMap)
  );
  const drs = Object.entries(details).map(([city, drDetails]) => [
    city,
    ejs.render(drTemplate, drRenderObj(city, drDetails)),
  ]);

  await Promise.all([
    write(__dirname + `/public/${langToFileName("PL")}`, pl),
    write(__dirname + `/public/${langToFileName("EN")}`, en),
    write(__dirname + `/public/${langToFileName("UA")}`, ua),
    mkdirOrClean(__dirname + "/public/miasto").then(() => {
      return drs.map(([city, rendered]) => {
        write(__dirname + `/public/miasto/${city}.html`, rendered);
      });
    }),
  ]);
}

//const writeTranslations = () =>
//  processDoctors().then(() =>
//    Promise.all([read(VIEW_FILE, "utf-8"), read(DR_FILE, "utf-8")])
//      .then((xs) => cssFiles.then((cssMap) => xs.concat(cssMap)))
//      .then(([indexTemplate, drTemplate]) => [
//        ejs.render(indexTemplate, translationObj(texts.PL, cities)),
//        ejs.render(indexTemplate, translationObj(texts.EN, cities)),
//        ejs.render(indexTemplate, translationObj(texts.UA, cities)),
//        ...Object.entries(details).map(([city, drDetails]) => [
//          city,
//          ejs.render(drTemplate, drRenderObj(city, drDetails)),
//        ]),
//      ])
//      .then(([pl, en, ua, ...drs]) =>
//        Promise.all([
//          write(__dirname + `/public/${langToFileName("PL")}`, pl),
//          write(__dirname + `/public/${langToFileName("EN")}`, en),
//          write(__dirname + `/public/${langToFileName("UA")}`, ua),
//          mkdirOrClean(__dirname + "/public/miasto").then(() => {
//            return drs.map(([city, rendered]) => {
//              write(__dirname + `/public/miasto/${city}.html`, rendered);
//            });
//          }),
//        ])
//      )
//  );

writeTranslations();

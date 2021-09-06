const express = require("express");
const { PL, EN } = require("./text");
const langs = { PL, EN };
const IS_DEV = process.env.ENV === "prod";
const PORT = process.env.PORT || 9000;

const app = express();

const renderDev = (lang) => (req, res) =>
  res.render("index", {
    BROWSER_REFRESH: IS_DEV ? process.env.BROWSER_REFRESH_URL : false,
    text: langs[lang],
  });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/index.html", renderDev("PL"));
app.get("/index_en.html", renderDev("EN"));
app.get("*", renderDev("PL"));

app.listen(PORT, () => {
  console.log(`Listening on `, PORT);
  if (IS_DEV && process.send) {
    process.send({ event: "online", url: "http://localhost:9000/" });
  }
});

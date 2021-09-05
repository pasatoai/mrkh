const express = require("express");
const { PL } = require("./text");

const langs = { PL };

const app = express();

const renderDev = (lang) => (req, res) =>
  res.render("index", {
    BROWSER_REFRESH: process.env.BROWSER_REFRESH_URL,
    text: langs[lang],
  });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/pl", renderDev("PL"));
app.get("/en", renderDev("EN"));
app.get("*", renderDev("PL"));

app.listen(9000, () => {
  console.log("listening");
  if (process.send) {
    process.send({ event: "online", url: "http://localhost:9000/" });
  }
});

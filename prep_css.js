const { readFile, readdir, renameSync } = require("fs");
const { promisify } = require("util");
const { join } = require("path");
const rimraf = require("rimraf");
const path = require("path");
const readD = promisify(readdir);
const rimrafP = promisify(rimraf);

async function main() {
  const scssFolder = join(__dirname, "scss");
  const scss = (await readD(scssFolder)).filter((d) => d.includes("scss"));

  for (const removal of ["desktop", "mobile", "shared"]) {
    await rimrafP(join(__dirname, "public", "css", `${removal}*`));
  }

  // rename sccs
  for (const oldName of scss) {
    const fileIndex = oldName.match(/(\d+)/);
    if (!fileIndex) throw new Error("Error bumping scss file numbers");

    const index = fileIndex[0];
    const indexParsed = Number(index);

    if (!Number.isInteger(indexParsed))
      throw new Error("Cannot parse sccs file number");

    const newName = oldName.replace(index, indexParsed + 1);

    renameSync(
      join(__dirname, "scss", oldName),
      join(__dirname, "scss", newName)
    );
  }
}

main();

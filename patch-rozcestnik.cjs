// maturak.gypce.cz = rozcestník pro oba plesy; web 4. F + 4. H je na 4fh.html
const fs = require("fs");
const idx = fs.readFileSync("index.html", "utf8");
if (idx.includes('id="hero-clock"')) { fs.writeFileSync("4fh.html", idx); console.log("ples 4. F + 4. H zkopírován do 4fh.html"); }
if (!fs.existsSync("4fh.html")) throw new Error("chybí 4fh.html");
fs.writeFileSync("index.html", fs.readFileSync("rozcestnik.html", "utf8"));
// odkazy z ostatních stránek zpět na ples vedou na 4fh.html
for (const f of fs.readdirSync(".").filter(f => /\.html$/.test(f) && !["index.html", "rozcestnik.html", "4fh.html"].includes(f))) {
  const s = fs.readFileSync(f, "utf8"), t = s.replace(/href="(?:\.\/)?index\.html/g, 'href="4fh.html').replace(/href="\.\/"/g, 'href="4fh.html"').replace(/href="\/"/g, 'href="4fh.html"');
  if (t !== s) { fs.writeFileSync(f, t); console.log("odkazy upraveny:", f); }
}
console.log("rozcestník:", fs.readFileSync("index.html", "utf8").includes("Maturitní plesy 2027"), "| 4fh.html ples:", fs.readFileSync("4fh.html", "utf8").includes('id="hero-clock"'));

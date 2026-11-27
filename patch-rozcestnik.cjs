// Arnošt 27. 11. 14:30: rozcestník ZATÍM NE – maturak.gypce.cz = čistě náš ples (Back to the Future).
// Rozcestník (rozcestnik.html) se udělá později hezčí, BTTF vpravo. Až bude, vrátit předchozí verzi tohoto skriptu.
const fs = require("fs");
const isPles = f => fs.existsSync(f) && fs.readFileSync(f, "utf8").includes('id="hero-clock"');
if (!isPles("index.html") && isPles("4fh.html")) { fs.writeFileSync("index.html", fs.readFileSync("4fh.html", "utf8")); console.log("ples vrácen do index.html"); }
if (!isPles("index.html")) throw new Error("index.html není ples!");
// 4fh.html jen přesměruje na hlavní stránku (kdyby někdo měl odkaz)
fs.writeFileSync("4fh.html", '<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./"><link rel="canonical" href="./"><title>Back to the Future – Maturitní ples 2027</title></head><body><a href="./">Pokračovat na web plesu</a></body></html>\n');
for (const f of fs.readdirSync(".").filter(f => /\.html$/.test(f) && !["index.html", "rozcestnik.html", "4fh.html"].includes(f))) {
  const s = fs.readFileSync(f, "utf8"), t = s.replace(/href="4fh\.html/g, 'href="index.html');
  if (t !== s) { fs.writeFileSync(f, t); console.log("odkazy vráceny:", f); }
}
console.log("index = ples:", isPles("index.html"));

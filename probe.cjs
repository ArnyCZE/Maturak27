const fs = require("fs");
const css = fs.readFileSync("style.css", "utf8");
let i = 0; const re = /[^{}]*(\.title|\.line|\.script|\.hero-text|\.hero-grid|clip-path|overflow)[^{}]*\{[^}]*\}/g; let m;
while ((m = re.exec(css)) && i++ < 40) console.log(m[0].trim().slice(0, 400) + "\n---");

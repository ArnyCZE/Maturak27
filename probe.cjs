const fs = require("fs");
const a = fs.readFileSync("app.js", "utf8");
for (const re of [/zones/g, /data-floor/g, /floor-tabs/g, /\.cls/g]) { let m, k = 0; while ((m = re.exec(a)) && k++ < 4) console.log(re, JSON.stringify(a.slice(Math.max(0, m.index - 150), m.index + 250))); }
const c = fs.readFileSync("style.css", "utf8"); let m, re = /[^{}]*stairs[^{}]*\{[^}]*\}/g; while ((m = re.exec(c))) console.log("CSS", m[0].trim());

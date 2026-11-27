const fs = require("fs");
for (const f of ["index.html", "app.js"]) { const s = fs.readFileSync(f, "utf8"); for (const re of [/DESTINATION/g, /PRESENT TIME/g, /MONTH/g, /"JAN"/g]) { let m; while ((m = re.exec(s))) console.log(f, re, JSON.stringify(s.slice(Math.max(0, m.index - 60), m.index + 60))); } }

// Arnošt 27. 11.: bez kurzívy, česky, méně popisků, hlavička s logem Dašáku (trvalá úprava index.html + app.js)
const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
const R = (a, b) => { s = typeof a === "string" ? s.split(a).join(b) : s.replace(a, b); };
// hlavička
R(/<div class="hero-top">[\s\S]*?<span class="big">Tříd 4\.F a 4\.H<\/span>\s*<\/div>/,
  '<div class="hero-top">\n        <a class="school-logo" href="https://www.gypce.cz/" target="_blank" rel="noopener" aria-label="Gymnázium Pardubice, Dašická"><img src="https://www.gypce.cz/wp-content/themes/2025/assets/gypce-logo.svg" alt="Logo Gymnázia Pardubice, Dašická"></a>\n        <div class="hero-who"><span class="big">Maturitní ples 4. F a 4. H</span><span class="school">Gymnázium Pardubice, Dašická 1083</span></div>\n      </div>');
// kurzíva pryč
R(/<\/?em>/g, "");
// nadtitulky pryč
R(/\s*<p class="eyebrow[^"]*">[^<]*<\/p>/g, "");
// odpočet
R("Cíl cesty: 30. ledna 2027", "Do plesu zbývá");
R(/\s*<p class="lead reveal d2">Čtyři roky jsme jeli naplno\.[^<]*<\/p>/, "");
[["MONTH", "MĚSÍC"], ["DAY", "DEN"], ["YEAR", "ROK"], ["HOUR", "HOD"], ["<small>MIN</small>", "<small>MIN</small>"]].forEach(([a, b]) => R(new RegExp("<small>" + a.replace(/<\/?small>/g, "") + "</small>", "g"), "<small>" + b.replace(/<\/?small>/g, "") + "</small>"));
R('<div class="seg">JAN</div>', '<div class="seg">LED</div>');
R('<div class="seg">SEP</div>', '<div class="seg">ZÁŘ</div>');
R("DESTINATION TIME", "PLES");
R("PRESENT TIME", "TEĎ");
R("LAST TIME DEPARTED", "NÁSTUP NA GYMPL");
R('aria-label="Časové obvody"', 'aria-label="Odpočet"');
// sekce
R("Program večera", "Program");
R(/(<h3>[^<]*<\/h3>)<p>[^<]*<\/p>(<\/li>)/g, "$1$2");
R(/<p class="lead reveal d2">Stoly v Ideonu s aktuální obsazeností[^<]*<\/p>/, '<p class="lead reveal d2">Klikni na stůl a uvidíš, která místa jsou volná. Vstupenka stojí 450 Kč, u stolu i na stání.</p>');
R("Jak koupit vstupenku", "Vstupenky");
R("Děkujeme sponzorům a partnerům", "Sponzoři");
// styly a verze
if (!s.includes("uprava.css")) R('<link rel="stylesheet" href="style.css?v=23">', '<link rel="stylesheet" href="style.css?v=23">\n<link rel="stylesheet" href="uprava.css?v=1">');
R('app.js?v=22', 'app.js?v=23');
fs.writeFileSync("index.html", s);
let a = fs.readFileSync("app.js", "utf8");
a = a.replace('["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]', '["LED","ÚNO","BŘE","DUB","KVĚ","ČVN","ČVC","SRP","ZÁŘ","ŘÍJ","LIS","PRO"]');
fs.writeFileSync("app.js", a);
console.log("logo:", s.includes("school-logo"), "| em:", /<em>/.test(s), "| anglicky:", /DESTINATION|PRESENT TIME|MONTH|"JAN"/.test(s + a), "| eyebrow:", s.includes('class="eyebrow'), "| popisky programu:", /<\/h3><p>[^<]*<\/p><\/li>/.test(s));

// v2 (Arnošt 27. 11. 14:40): logo jen „G s koněm“ ve zlaté v rohu, celé názvy měsíců, „NÁSTUP NA GYMNÁZIUM“
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(/<a class="school-logo"[^>]*>.*?<\/a>\s*/s, "");
  if (!t.includes('class="g-logo"')) t = t.replace('<header class="hero" id="top">', '<header class="hero" id="top">\n  <a class="g-logo" href="https://www.gypce.cz/" target="_blank" rel="noopener" aria-label="Gymnázium Pardubice, Dašická"></a>');
  t = t.replace('<div class="seg">LED</div>', '<div class="seg">LEDEN</div>').replace('<div class="seg">ZÁŘ</div>', '<div class="seg">ZÁŘÍ</div>');
  t = t.replace("NÁSTUP NA GYMPL", "NÁSTUP NA GYMNÁZIUM");
  t = t.replace("uprava.css?v=1", "uprava.css?v=2").replace("app.js?v=23", "app.js?v=24");
  fs.writeFileSync("index.html", t);
  let a = fs.readFileSync("app.js", "utf8");
  a = a.replace('["LED","ÚNO","BŘE","DUB","KVĚ","ČVN","ČVC","SRP","ZÁŘ","ŘÍJ","LIS","PRO"]', '["LEDEN","ÚNOR","BŘEZEN","DUBEN","KVĚTEN","ČERVEN","ČERVENEC","SRPEN","ZÁŘÍ","ŘÍJEN","LISTOPAD","PROSINEC"]');
  fs.writeFileSync("app.js", a);
  console.log("v2 g-logo:", t.includes("g-logo"), "| měsíce:", a.includes("LISTOPAD"), "| gymnázium:", t.includes("NÁSTUP NA GYMNÁZIUM"));
}

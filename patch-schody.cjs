// Arnošt 27. 11.: schody na galerii vpravo hned za stolem VS 9, pod nimi šatna maturantů se vstupem za barem; klik na schody = galerie
const fs = require("fs");
let p = fs.readFileSync("plan.js", "utf8");
if (!p.includes("to-gallery")) {
  p = p.replace('w: 121, h: 72, d: 3.6,', 'w: 133, h: 72, d: 3.6,');
  p = p.replace('          { t: "Schody na galerii", s: "Schody", x: 110, y: 32, w: 10.5, h: 6, cls: "stairs" },\n', "");
  p = p.replace('          { t: "Šatna maturantů", s: "Šatna mat.", x: 107, y: 0, w: 13.5, h: 2.8 },\n',
    '          { t: "Schody na galerii ↑", s: "Schody ↑", x: 95, y: 3.4, w: 37, h: 6.2, cls: "stairs to-gallery" },\n' +
    '          { t: "Šatna maturantů (pod schody)", s: "Šatna mat.", x: 121, y: 9.6, w: 11, h: 20.2 },\n' +
    '          { t: "vstup", s: "", x: 120.2, y: 17, w: 1.6, h: 6, cls: "door" },\n');
  p = p.replace('{ t: "Schody", x: 92, y: 2, w: 13, h: 5, cls: "stairs" },', '{ t: "Schody dolů ↓", s: "Schody ↓", x: 92, y: 2, w: 13, h: 5, cls: "stairs to-ground" },');
  p = p.replace('{ t: "Schody", x: 2, y: 2, w: 13, h: 5, cls: "stairs" },', '{ t: "Schody dolů ↓", s: "Schody ↓", x: 2, y: 2, w: 13, h: 5, cls: "stairs to-ground" },');
  p = p.replace('{ t: "Schody", x: 70, y: 2, w: 8, h: 9, cls: "stairs" },', '{ t: "Schody ↓", x: 70, y: 2, w: 8, h: 9, cls: "stairs to-ground" },');
  p = p.replace('{ t: "Schody", x: 70, y: 98, w: 8, h: 10, cls: "stairs" },', '{ t: "Schody ↓", x: 70, y: 98, w: 8, h: 10, cls: "stairs to-ground" },');
  fs.writeFileSync("plan.js", p);
}
let a = fs.readFileSync("app.js", "utf8");
if (!a.includes("to-gallery")) {
  a += '\n/* schody na plánku: klik přepne patro (Arnošt 27. 11.) */\n(function () {\n  var planEl = document.getElementById("plan"); if (!planEl) return;\n  planEl.addEventListener("click", function (e) {\n    var z = e.target.closest && e.target.closest(".zone.to-gallery, .zone.to-ground"); if (!z) return;\n    var want = z.classList.contains("to-gallery") ? "gallery" : "ground";\n    var b = document.querySelector(\'.floor-tabs button[data-floor="\' + want + \'"]\'); if (b) b.click();\n    var w = document.querySelector(".plan-wrap"); if (w && w.scrollIntoView) w.scrollIntoView({ behavior: "smooth", block: "start" });\n  });\n})();\n';
  fs.writeFileSync("app.js", a);
}
let c = fs.readFileSync("uprava.css", "utf8");
if (!c.includes("to-gallery")) fs.appendFileSync("uprava.css", "\n/* klikací schody na plánku */\n.plan .zone.to-gallery, .plan .zone.to-ground { cursor: pointer; pointer-events: auto; transition: background-color .2s, box-shadow .2s; }\n.plan .zone.to-gallery:hover, .plan .zone.to-ground:hover { background-color: rgba(230,184,79,.28); box-shadow: 0 0 0 2px #e6b84f inset; }\n");
let t = fs.readFileSync("index.html", "utf8");
t = t.replace(/plan\.js\?v=\d+/, "plan.js?v=18").replace(/app\.js\?v=\d+/, "app.js?v=25").replace(/uprava\.css\?v=\d+/, "uprava.css?v=6");
fs.writeFileSync("index.html", t);
console.log("schody za VS 9:", p.includes("to-gallery"), "| šatna za barem:", p.includes("pod schody"), "| klik:", a.includes("to-gallery"));

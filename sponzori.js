/* Sponzoři: jména firem se načítají z Arnoštovy tabulky „Maturák Sponzoři“ (list Získané dary, sloupec Název firmy)
   přes veřejnou tabulku (list Web, sloupec H – jen názvy, žádné kontakty). Firmy napsané přímo v index.html zůstanou
   taky; když se tabulka nenačte, zůstane jen ten seznam. */
(function () {
  var URL = "https://docs.google.com/spreadsheets/d/18tbTqbiRGQaAFtXcp2peYWdz93SIBP-x7r0L-sKOW_0/gviz/tq?tqx=out:csv&sheet=Web&range=H2:H300";
  var row = document.querySelector(".sponsors-row");
  if (!row) return;

  function key(name) { return name.toLowerCase().replace(/[\s.,]+/g, " ").trim(); }

  fetch(URL, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      var names = text.split(/\r?\n/).map(function (line) {
        return line.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
      }).filter(function (n) { return n && n.charAt(0) !== "#"; });
      if (!names.length) return;

      var seen = {}, all = [];
      names.concat([].map.call(row.querySelectorAll(".sponsor"), function (el) { return el.textContent.trim(); }))
        .forEach(function (n) { if (!seen[key(n)]) { seen[key(n)] = 1; all.push(n); } });
      all.sort(function (a, b) { return a.localeCompare(b, "cs"); });

      row.innerHTML = "";
      all.forEach(function (n, i) {
        var el = document.createElement("div");
        el.className = "sponsor reveal in";
        el.style.transitionDelay = Math.min(i * 40, 600) + "ms";
        el.textContent = n;
        row.appendChild(el);
      });
    })
    .catch(function () { /* nechá původní seznam */ });
})();

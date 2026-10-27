/* Sponzoři: jména firem se načítají z Arnoštovy tabulky „Maturák Sponzoři“ (list Získané dary, sloupec Název firmy)
   přes veřejnou tabulku (list Web, sloupec H – jen názvy, žádné kontakty). Firmy napsané přímo v index.html zůstanou
   taky; když se tabulka nenačte, zůstane jen ten seznam.
   Ke každé firmě patří odkaz na její web a logo (DATA níže). Každá karta má stejně velkou dlaždici:
   s logem (bílá, u světlých log tmavá – dark: true), bez loga se v dlaždici ukáže název firmy.
   Logo, které firma poslala e-mailem, je v Arnoštově Google Drive sdílené odkazem (lh3.googleusercontent.com/d/<id>). */
(function () {
  var URL = "https://docs.google.com/spreadsheets/d/18tbTqbiRGQaAFtXcp2peYWdz93SIBP-x7r0L-sKOW_0/gviz/tq?tqx=out:csv&sheet=Web&range=H2:H300";

  // klíč = název firmy malými písmeny bez teček a čárek
  var DATA = {
    "bakla café": { url: "https://www.facebook.com/baklacafe" },
    "de franc": { url: "https://www.defranc.cz/", logo: "https://www.defranc.cz/element/simple/image/9/0/7d180045191dcba5.png?sirka=504&vyska=180", dark: true },
    "fk pardubice": { url: "https://www.fkpardubice.cz/", logo: "https://fkpardubice.esports.cz/files/logos/FKP_ikona_kruhova_pcervena_RGB.png" },
    "fronte s r o": { url: "https://www.fronte.cz/", logo: "https://www.fronte.cz/img/logo.png" },
    "choceňská mlékárna": { url: "https://www.chocenskamlekarna.cz/", logo: "https://www.chocenskamlekarna.cz/wp-content/uploads/2021/03/chm_logo_200.png" },
    "kara trutnov": { url: "https://kara.cz/", logo: "https://kara.cz/img/logo.svg" },
    "knihkupectví kosmas pardubice": { url: "https://www.kosmas.cz/" },
    "komorní filharmonie pardubice": { url: "https://www.kfpar.cz/" },
    "kutil cz": { url: "https://www.kutil.cz/", logo: "https://www.kutil.cz/images/logo.png" },
    "leoexpress": { url: "https://www.leoexpress.com/cs", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Leo_Express.svg" },
    "město pardubice": { url: "https://pardubice.eu/", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Pardubice_logo.svg" },
    "vak": { url: "https://www.vakpce.cz/", logo: "https://www.vakpce.cz/data/filecache/90/vak-text-as-prave-logo-full-color-rgb-900px-w-72ppi.png" },
    "ploty dobrý": { url: "https://www.levne-pletivo.cz/", logo: "https://lh3.googleusercontent.com/d/1G5hiZfFL7Cz7-rysdKvkaveEGN3EFK9e=w600" },
    "2vv s r o": { url: "https://www.2vv.cz/" },
    "pivovar svijany": { url: "https://www.pivovarsvijany.cz/" }
  };

  var row = document.querySelector(".sponsors-row");
  if (!row) return;

  function key(name) { return name.toLowerCase().replace(/[.,]+/g, " ").replace(/\s+/g, " ").trim(); }

  function card(name, i) {
    var d = DATA[key(name)] || {};
    var el = document.createElement(d.url ? "a" : "div");
    el.className = "sponsor reveal in";
    el.style.transitionDelay = Math.min(i * 40, 600) + "ms";
    if (d.url) { el.href = d.url; el.target = "_blank"; el.rel = "noopener"; el.title = name + " – otevřít web"; }

    var tile = document.createElement("span");
    var label = document.createElement("span");
    label.className = "s-name";
    label.textContent = name;

    function textTile() {
      tile.className = "s-logo s-text";
      tile.textContent = name;
      label.textContent = d.url ? "web" : "";
    }
    if (d.logo) {
      tile.className = "s-logo" + (d.dark ? " s-dark" : "");
      var img = document.createElement("img");
      img.src = d.logo; img.alt = name; img.loading = "lazy";
      img.onerror = textTile;
      tile.appendChild(img);
    } else {
      textTile();
    }
    el.appendChild(tile);
    el.appendChild(label);
    return el;
  }

  function render(names) {
    var seen = {}, all = [];
    names.forEach(function (n) { if (n && !seen[key(n)]) { seen[key(n)] = 1; all.push(n); } });
    all.sort(function (a, b) { return a.localeCompare(b, "cs"); });
    row.innerHTML = "";
    all.forEach(function (n, i) { row.appendChild(card(n, i)); });
  }

  var fixed = [].map.call(row.querySelectorAll(".sponsor"), function (el) { return el.textContent.trim(); });
  render(fixed);

  fetch(URL, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      var names = text.split(/\r?\n/).map(function (line) {
        return line.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
      }).filter(function (n) { return n && n.charAt(0) !== "#"; });
      if (names.length) render(names.concat(fixed));
    })
    .catch(function () { /* nechá původní seznam */ });
})();

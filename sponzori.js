/* Sponzoři: jména firem se načítají z Arnoštovy tabulky „Maturák Sponzoři“ (list Získané dary, sloupec Název firmy)
   přes veřejnou tabulku (list Web, sloupec H – jen názvy, žádné kontakty). Firmy napsané přímo v index.html zůstanou
   taky; když se tabulka nenačte, zůstane jen ten seznam.
   Ke každé firmě patří oficiální název (name), odkaz na její web a logo (DATA níže). Každá karta má stejně velkou dlaždici:
   s logem (bílá, u světlých log tmavá – dark: true), bez loga se v dlaždici ukáže název firmy.
   Pod dlaždicí je vždy celý oficiální název.
   Logo Kosmasu poslali e-mailem jako PDF – je v Arnoštově Google Drive sdílené odkazem (lh3.googleusercontent.com/d/<id>
   vrací náhled jako obrázek). Bakla café má jen Facebook – bere se profilový obrázek jejich stránky. */
(function () {
  var URL = "https://docs.google.com/spreadsheets/d/18tbTqbiRGQaAFtXcp2peYWdz93SIBP-x7r0L-sKOW_0/gviz/tq?tqx=out:csv&sheet=Web&range=H2:H300";

  // klíč = název firmy z tabulky malými písmeny bez teček a čárek
  var DATA = {
    "bakla café": { name: "Bakla café", url: "https://www.facebook.com/baklacafe", logo: "https://graph.facebook.com/baklacafe/picture?type=large" },
    "de franc": { name: "DE FRANC – cukrářská dílna", url: "https://www.defranc.cz/", logo: "https://www.defranc.cz/element/simple/image/9/0/7d180045191dcba5.png?sirka=504&vyska=180", dark: true },
    "fk pardubice": { name: "FK Pardubice", url: "https://www.fkpardubice.cz/", logo: "https://fkpardubice.esports.cz/files/logos/FKP_ikona_kruhova_pcervena_RGB.png" },
    "fronte s r o": { name: "fronte tiskárny, s.r.o.", url: "https://www.fronte.cz/", logo: "https://www.fronte.cz/img/logo.png" },
    "choceňská mlékárna": { name: "Choceňská mlékárna s.r.o.", url: "https://www.chocenskamlekarna.cz/", logo: "https://www.chocenskamlekarna.cz/wp-content/uploads/2021/03/chm_logo_200.png" },
    "kara trutnov": { name: "KARA Trutnov a.s.", url: "https://kara.cz/", logo: "https://kara.cz/img/logo.svg" },
    "knihkupectví kosmas pardubice": { name: "Knihkupectví Kosmas Pardubice", url: "https://www.kosmas.cz/", logo: "https://lh3.googleusercontent.com/d/1nbuNVZ5zy8GH2W3Kfry8GMDhxJ36sqlB=w800" },
    "komorní filharmonie pardubice": { name: "Komorní filharmonie Pardubice", url: "https://www.kfpar.cz/", logo: "https://www.kfpar.cz/data/filecache/ff/kfp_logo_zakladni_barva_2_1.png" },
    "kutil cz": { name: "Železářství KUTIL, s.r.o.", url: "https://www.kutil.cz/", logo: "https://www.kutil.cz/images/logo.png" },
    "leoexpress": { name: "Leo Express", url: "https://www.leoexpress.com/cs", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Leo_Express.svg" },
    "město pardubice": { name: "Statutární město Pardubice", url: "https://pardubice.eu/", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Pardubice_logo.svg" },
    "vak": { name: "Vodovody a kanalizace Pardubice, a.s.", url: "https://www.vakpce.cz/", logo: "https://www.vakpce.cz/data/filecache/90/vak-text-as-prave-logo-full-color-rgb-900px-w-72ppi.png" },
    "ploty dobrý": { name: "Ploty Dobrý", url: "https://www.levne-pletivo.cz/", logo: "https://cdn.myshoptet.com/usr/www.levne-pletivo.cz/user/logos/logo-ploty-dobry-764x180-5.png" },
    "2vv s r o": { name: "2VV s.r.o.", url: "https://www.2vv.cz/", logo: "https://www.2vv.cz/wp-content/uploads/logo-2vv.svg" },
    "pivovar svijany": { name: "Pivovar Svijany, a.s.", url: "https://www.pivovarsvijany.cz/", logo: "https://www.pivovarsvijany.cz/Fe/images/logo-pivovarsvijany.svg" }
  };

  var row = document.querySelector(".sponsors-row");
  if (!row) return;

  function key(name) { return name.toLowerCase().replace(/[.,]+/g, " ").replace(/\s+/g, " ").trim(); }
  function info(name) { return DATA[key(name)] || {}; }
  function title(name) { return info(name).name || name; }

  function card(name, i) {
    var d = info(name);
    var full = title(name);
    var el = document.createElement(d.url ? "a" : "div");
    el.className = "sponsor reveal in";
    el.style.transitionDelay = Math.min(i * 40, 600) + "ms";
    if (d.url) { el.href = d.url; el.target = "_blank"; el.rel = "noopener"; el.title = full + " – otevřít web"; }

    var tile = document.createElement("span");
    var label = document.createElement("span");
    label.className = "s-name";
    label.textContent = full;

    function textTile() {
      tile.className = "s-logo s-text";
      tile.innerHTML = "";
      tile.textContent = full;
    }
    if (d.logo) {
      tile.className = "s-logo" + (d.dark ? " s-dark" : "");
      var img = document.createElement("img");
      img.referrerPolicy = "no-referrer";
      img.src = d.logo; img.alt = full; img.loading = "lazy";
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
    all.sort(function (a, b) { return title(a).localeCompare(title(b), "cs"); });
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

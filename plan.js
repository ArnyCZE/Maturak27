/* Rozmístění stolů v Ideonu – přízemí přesně podle plánku od p. Vašíčka (PLESOVÉ USPOŘÁDÁNÍ STOLŮ V IDEONU),
   galerie podle fotky z galerie nad barem:
   - Velký sál: podium vlevo, taneční parket uprostřed, blok VS 10–29 vpravo před barem, VS 43–30 dole,
   - Levý a Pravý sál hned pod velkým sálem, vchody do nich mezerami v dolní řadě stolů (mezi 41/40 a 33/32),
     mezi nimi WC a chodba ke vstupu,
   - Galerie: ochoz do „U“ kolem velkého sálu; stůl G 27 je zrušený – je tam projekce.
   Souřadnice jsou v jednotkách plánku (přízemí = desetina pixelu Vašíčkova plánku),
   stůl = [označení, x, y, natočení] – střed stolu; natočení „v“ = nastojato, „h“ = naležato (jako na plánku).
   Rozměry stolů: vw × vh (nastojato), hw × hh (naležato); bez natočení se použije d (šířka 1,15·d, výška 0,7·d).
   Označení musí sedět se sloupcem „Stůl“ v tabulce.
   cls u zón: solid (podium), floor-dance (parket), void (prostor nad sálem), stairs (schody), faded (vidět zdola),
   door (vchod do sálu). s = kratší popisek na mobil.
   Na mobilu se přízemí jen otočí o 90° (podium nahoře), galerie má vlastní verzi na výšku („mobile“). */
window.IDEON_PLAN = (function () {
  function at(prefix, nums, xs, y, o) {
    return nums.map(function (n, i) { return [prefix + " " + n, xs[i], y, o]; });
  }
  function colAt(prefix, nums, x, ys, o) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, ys[i], o]; });
  }
  function row(prefix, nums, xs, y) { return at(prefix, nums, xs, y); }
  function column(prefix, nums, x, y0, step) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, y0 + i * step]; });
  }
  function spread(from, to, count) {
    var out = [], step = (to - from) / (count - 1);
    for (var i = 0; i < count; i++) out.push(+(from + i * step).toFixed(2));
    return out;
  }
  var galleryRow = spread(20, 66, 8);     // 8 míst v řadě na mobilní galerii
  var blockX = [69.7, 80.8, 91.8, 102.8]; // sloupce bloku VS 10–29

  return {
    seats: { VS: 6, LS: 8, PS: 8, G: 8 },
    halls: { VS: "Velký sál", LS: "Levý sál", PS: "Pravý sál", G: "Galerie" },
    floors: {
      ground: {
        w: 121, h: 72, d: 3.6,
        vw: 2.9, vh: 4.8, hw: 8, hh: 2.2,
        rooms: [
          { x: 20.5, y: 3, w: 100, h: 41.3 },   // Velký sál
          { x: 1, y: 44.3, w: 61.9, h: 26.9 },  // Levý sál
          { x: 71.2, y: 44.3, w: 49.3, h: 26.9 } // Pravý sál
        ],
        zones: [
          { t: "Schody na galerii", s: "Schody", x: 2.5, y: 3, w: 15, h: 6, cls: "stairs" },
          { t: "Toalety pro účinkující", s: "WC účink.", x: 2.5, y: 20, w: 12, h: 4.8 },
          { t: "Šatna účinkujících 1", s: "Šatna 1", x: 2.5, y: 24.8, w: 12, h: 4.9 },
          { t: "Šatna účinkujících 2", s: "Šatna 2", x: 2.5, y: 29.7, w: 12, h: 6.4 },
          { t: "Fotokoutek", s: "Foto", x: 2.5, y: 37.8, w: 15, h: 4.9 },
          { t: "Podium · kapela", s: "Podium", x: 21.7, y: 15.1, w: 13.7, h: 17.8, cls: "solid" },
          { t: "Taneční parket", s: "Parket", x: 38.1, y: 11.8, w: 24.8, h: 24.4, cls: "floor-dance" },
          { t: "Bar", x: 110, y: 11.8, w: 10.5, h: 18, cls: "bar" },
          { t: "Schody na galerii", s: "Schody", x: 110, y: 32, w: 10.5, h: 6, cls: "stairs" },
          { t: "Šatna maturantů", s: "Šatna mat.", x: 107, y: 0, w: 13.5, h: 2.8 },
          { t: "vstup", s: "", x: 36.5, y: 43.4, w: 10, h: 1.8, cls: "door" },
          { t: "vstup", s: "", x: 88.6, y: 43.4, w: 7.8, h: 1.8, cls: "door" },
          { t: "WC", x: 57.3, y: 44.3, w: 5.6, h: 11.5 },
          { t: "WC", x: 71.2, y: 44.3, w: 5.6, h: 11.5 },
          { t: "Vstup", x: 63.5, y: 62, w: 7.1, h: 9, cls: "door" },
          { t: "Fotokoutek", s: "Foto", x: 109.8, y: 46, w: 10.2, h: 4.8 }
        ],
        names: [
          { t: "Velký sál · po 6", x: 21.5, y: 3.8 },
          { t: "Levý sál · stoly po 8", x: 2.5, y: 68.8 },
          { t: "Pravý sál · stoly po 8", x: 77.5, y: 68.8 }
        ],
        tables: [].concat(
          // horní řada: VS 1–2 naležato, VS 3–9 nastojato
          at("VS", [1, 2], [25.8, 36.8], 9.1, "h"),
          at("VS", [3, 4, 5], [47.8, 53.3, 58.8], 7.1, "v"),
          at("VS", [6, 7, 8, 9], [72.7, 78.2, 83.7, 89.2], 7.1, "v"),
          // blok vpravo od parketu před barem – 5 řad po 4 stolech naležato
          at("VS", [10, 11, 12, 13], blockX, 14.3, "h"),
          at("VS", [14, 15, 16, 17], blockX, 19.1, "h"),
          at("VS", [18, 19, 20, 21], blockX, 24, "h"),
          at("VS", [22, 23, 24, 25], blockX, 28.9, "h"),
          at("VS", [26, 27, 28, 29], blockX, 33.8, "h"),
          // dolní řada nastojato – mezery mezi 41/40 a 33/32 vedou ke vchodům do Levého a Pravého sálu
          at("VS", [43, 42, 41], [23.2, 28.7, 34.1], 40.3, "v"),
          at("VS", [40, 39, 38, 37, 36, 35, 34, 33], [47.8, 53.3, 58.8, 64.3, 69.8, 75.3, 80.9, 86.4], 40.3, "v"),
          at("VS", [32, 31, 30], [97.4, 102.9, 108.4], 40.3, "v"),
          // Levý sál: LS 47–50 naležato u levé stěny, ostatní nastojato
          colAt("LS", [47, 48, 49, 50], 7.4, [50, 53.4, 56.7, 60.1], "h"),
          at("LS", [62, 63, 64, 65], [26.1, 31.3, 47.8, 53.3], 48.4, "v"),
          at("LS", [58, 59, 60, 61], [26.1, 31.3, 42.3, 53.3], 56.7, "v"),
          at("LS", [51, 52, 53, 54, 55, 56, 57], [10.7, 26.1, 31.3, 42.3, 47.8, 53.3, 58.8], 65, "v"),
          // Pravý sál – vše nastojato
          at("PS", [66, 67, 68, 69], [80.9, 86.4, 97.4, 105.9], 48.4, "v"),
          at("PS", [74, 75, 76, 71, 72], [80.9, 91.9, 97.4, 108.4, 113.9], 56.7, "v"),
          at("PS", [77, 78, 79, 80, 81, 82, 83, 73], [75.4, 80.9, 86.4, 91.9, 97.4, 102.9, 108.4, 113.9], 65, "v")
        )
      },
      gallery: {
        w: 107, h: 70, d: 4,
        rooms: [
          { x: 1, y: 1, w: 105, h: 68 }      // ochoz galerie (vnitřek zakryje prostor nad sálem)
        ],
        zones: [
          { t: "", x: 17, y: 1, w: 73, h: 57, cls: "void" },
          { t: "Taneční parket (dole)", x: 28, y: 13, w: 34, h: 33, cls: "floor-dance faded" },
          { t: "Podium", x: 18.5, y: 13, w: 9.5, h: 33, cls: "solid faded" },
          { t: "Stoly velkého sálu (dole)", x: 63, y: 13, w: 25, h: 33, cls: "faded" },
          { t: "Schody", x: 2, y: 2, w: 13, h: 5, cls: "stairs" },
          { t: "Schody", x: 92, y: 2, w: 13, h: 5, cls: "stairs" },
          { t: "Projekce", x: 93.5, y: 27, w: 9, h: 6, cls: "solid" }
        ],
        names: [
          { t: "Galerie · stoly po 8 · ochoz s výhledem do sálu", x: 30, y: 52 }
        ],
        tables: [].concat(
          // levá strana (nad podiem)
          column("G", [1, 2, 3, 4, 5, 6, 7, 8], 8.5, 12, 6),
          // pravá strana (nad barem) – jedna řada, na místě G 27 je projekce
          column("G", [30, 29, 28], 98, 12, 6),
          column("G", [26, 25, 24, 23], 98, 36, 6),
          // spodní strana
          row("G", [9, 10, 11, 12, 13, 14, 15], spread(14, 48, 7), 63.5),
          row("G", [16, 17, 18, 19, 20, 21, 22], spread(60, 94, 7), 63.5)
        )
      }
    },

    /* Galerie na výšku pro mobil (přízemí se na mobilu jen otočí). */
    mobile: {
      gallery: {
        w: 80, h: 110, d: 5.4,
        rooms: [
          { x: 1, y: 1, w: 78, h: 108 }
        ],
        zones: [
          { t: "", x: 15, y: 13, w: 63, h: 83, cls: "void" },
          { t: "Podium (dole)", x: 22, y: 16, w: 50, h: 7, cls: "solid faded" },
          { t: "Taneční parket (dole)", x: 22, y: 25, w: 50, h: 30, cls: "floor-dance faded" },
          { t: "Stoly velkého sálu (dole)", x: 22, y: 58, w: 50, h: 26, cls: "faded" },
          { t: "Schody", x: 70, y: 2, w: 8, h: 9, cls: "stairs" },
          { t: "Schody", x: 70, y: 98, w: 8, h: 10, cls: "stairs" },
          { t: "Proj.", x: galleryRow[4] - 2.9, y: 100.5, w: 5.8, h: 5, cls: "solid" }
        ],
        names: [
          { t: "Galerie · stoly po 8", x: 22, y: 88 }
        ],
        tables: [].concat(
          // nad podiem (horní řada)
          row("G", [8, 7, 6, 5, 4, 3, 2, 1], galleryRow, 7),
          // spodní strana ochozu (levý sloupec)
          colAt("G", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], 7.5, spread(16, 94, 14)),
          // nad barem (dolní řada), na místě G 27 je projekce
          row("G", [23, 24, 25, 26], galleryRow.slice(0, 4), 103),
          row("G", [28, 29, 30], galleryRow.slice(5), 103)
        )
      }
    }
  };
})();

/* Rozmístění stolů v Ideonu – podle plánku od p. Vašíčka (PLESOVÉ USPOŘÁDÁNÍ IDEON.xls),
   Arnoštova náčrtu a fotky z galerie nad barem:
   - Velký sál: podium s kapelou podél celé levé stěny, parket hned před ním,
     stoly kolem parketu do „U“ (nahoře, vpravo u baru, dole),
   - Galerie: ochoz do „U“ kolem velkého sálu (nad podiem, nad barem, dole), schody v horních rozích,
     stoly po stranách v jedné řadě; stůl G 27 (naproti podiu nad barem) je zrušený – je tam projekce,
   - Levý a Pravý sál pod velkým sálem, mezi nimi WC.
   Souřadnice jsou v jednotkách plánku, stůl = [označení, x, y] (střed obdélníkového stolu).
   d = základní velikost stolu (šířka ≈ 1,15·d, výška ≈ 0,7·d).
   Označení musí sedět se sloupcem „Stůl“ v tabulce.
   cls u zón: solid (podium), floor-dance (parket), void (prostor nad sálem), stairs (schody), faded (vidět zdola).
   „mobile“ = stejné sály nakreslené na výšku pro telefony (podium nahoře), s kratšími popisky. */
window.IDEON_PLAN = (function () {
  function row(prefix, nums, xs, y) {
    return nums.map(function (n, i) { return [prefix + " " + n, xs[i], y]; });
  }
  function column(prefix, nums, x, y0, step) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, y0 + i * step]; });
  }
  function colAt(prefix, nums, x, ys) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, ys[i]]; });
  }
  function spread(from, to, count) {
    var out = [], step = (to - from) / (count - 1);
    for (var i = 0; i < count; i++) out.push(+(from + i * step).toFixed(2));
    return out;
  }
  // svislá poloha stolů velkého sálu na mobilu: vodorovná osa plánku (x 21–85) → shora dolů (y 18–90)
  function vsY(x) { return +(18 + (x - 21) * 72 / 64).toFixed(2); }
  var galleryRow = spread(20, 66, 8);   // 8 míst v řadě na mobilní galerii

  return {
    seats: { VS: 6, LS: 8, PS: 8, G: 8 },
    halls: { VS: "Velký sál", LS: "Levý sál", PS: "Pravý sál", G: "Galerie" },
    floors: {
      ground: {
        w: 120, h: 91, d: 3.6,
        rooms: [
          { x: 16, y: 1, w: 73, h: 58 },     // Velký sál
          { x: 1, y: 62, w: 39, h: 28 },     // Levý sál
          { x: 80, y: 62, w: 39, h: 28 }     // Pravý sál
        ],
        zones: [
          { t: "Taneční parket", x: 27, y: 13, w: 34, h: 33, cls: "floor-dance" },
          { t: "Podium · kapela", x: 17.5, y: 13, w: 9.5, h: 33, cls: "solid" },
          { t: "Schody na galerii", x: 1, y: 1, w: 14, h: 7, cls: "stairs" },
          { t: "Toalety pro účinkující", x: 1, y: 11, w: 14, h: 9 },
          { t: "Šatna účinkujících 1", x: 1, y: 22, w: 14, h: 10 },
          { t: "Šatna účinkujících 2", x: 1, y: 34, w: 14, h: 10 },
          { t: "Fotokoutek", x: 1, y: 47, w: 14, h: 8 },
          { t: "Schody na galerii", x: 91, y: 1, w: 14, h: 7, cls: "stairs" },
          { t: "Šatna maturantů", x: 91, y: 11, w: 28, h: 8 },
          { t: "Bar", x: 91, y: 24, w: 14, h: 14 },
          { t: "WC", x: 46, y: 64, w: 28, h: 8 },
          { t: "Fotokoutek", x: 105.5, y: 63.5, w: 12.5, h: 7 }
        ],
        names: [
          { t: "Velký sál · stoly po 6", x: 40, y: 54.6 },
          { t: "Levý sál · stoly po 8", x: 3, y: 63.2 },
          { t: "Pravý sál · stoly po 8", x: 82, y: 63.2 }
        ],
        tables: [].concat(
          // horní pás nad parketem
          row("VS", [1, 2, 3, 4, 5, 6, 7, 8, 9], spread(21, 85, 9), 5),
          row("VS", [10, 11, 12, 13], [42, 52, 64, 78], 10.5),
          // blok vpravo od parketu (u baru), 4 řady po 4
          row("VS", [14, 15, 16, 17], [65, 71.5, 78, 84.5], 17),
          row("VS", [18, 19, 20, 21], [65, 71.5, 78, 84.5], 25),
          row("VS", [22, 23, 24, 25], [65, 71.5, 78, 84.5], 33),
          row("VS", [26, 27, 28, 29], [65, 71.5, 78, 84.5], 41),
          // spodní pás pod parketem
          row("VS", [43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30], spread(20, 85, 14), 50),
          // Levý sál
          column("LS", [47, 48, 49, 50], 5, 67.5, 4.3),
          row("LS", [62, 63, 64, 65], [13, 19, 27, 33], 69),
          row("LS", [58, 59, 60, 61], [13, 19, 27, 33], 76),
          row("LS", [51, 52, 53, 54, 55, 56, 57], spread(5, 37, 7), 85.5),
          // Pravý sál
          row("PS", [66, 67, 68, 69], [84, 90, 96, 102], 68),
          row("PS", [74, 75, 76, 71, 72], [84, 90.5, 97, 104, 111], 76),
          row("PS", [77, 78, 79, 80, 81, 82, 83, 73], spread(83.5, 116, 8), 85.5)
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

    /* Na výšku pro mobil: podium nahoře, Levý a Pravý sál vlevo pod sebou, bar a šatna maturantů pod velkým sálem. */
    mobile: {
      ground: {
        w: 100, h: 150, d: 5,
        rooms: [
          { x: 34, y: 13, w: 65, h: 85 },    // Velký sál
          { x: 1, y: 13, w: 31, h: 49 },     // Levý sál
          { x: 1, y: 77, w: 31, h: 72 }      // Pravý sál
        ],
        zones: [
          { t: "Foto", x: 1, y: 1, w: 15, h: 9 },
          { t: "Šatna 2", x: 18, y: 1, w: 18, h: 9 },
          { t: "Šatna 1", x: 38, y: 1, w: 18, h: 9 },
          { t: "WC účink.", x: 58, y: 1, w: 18, h: 9 },
          { t: "Schody", x: 78, y: 1, w: 21, h: 9, cls: "stairs" },
          { t: "Podium · kapela", x: 45, y: 15.5, w: 38, h: 7, cls: "solid" },
          { t: "Taneční parket", x: 45, y: 24, w: 38, h: 33, cls: "floor-dance" },
          { t: "WC", x: 6, y: 65, w: 21, h: 9 },
          { t: "Bar", x: 36, y: 101, w: 20, h: 13 },
          { t: "Šatna maturantů", x: 58, y: 101, w: 22, h: 20 },
          { t: "Schody", x: 82, y: 101, w: 17, h: 10, cls: "stairs" },
          { t: "Foto", x: 21, y: 128, w: 10, h: 9 }
        ],
        names: [
          { t: "Velký sál · stoly po 6", x: 36, y: 94.2 },
          { t: "Levý sál · po 8", x: 3, y: 58.4 },
          { t: "Pravý sál · po 8", x: 3, y: 145.4 }
        ],
        tables: [].concat(
          // pravý okraj velkého sálu: VS 1–9 a 10–13
          colAt("VS", [1, 2, 3, 4, 5, 6, 7, 8, 9], 94, spread(18, 90, 9)),
          colAt("VS", [10, 11, 12, 13], 87.5, [42, 52, 64, 78].map(vsY)),
          // blok u baru – 4 sloupce po 4, pod parketem
          colAt("VS", [14, 15, 16, 17], 79, [65, 71.5, 78, 84.5].map(vsY)),
          colAt("VS", [18, 19, 20, 21], 71, [65, 71.5, 78, 84.5].map(vsY)),
          colAt("VS", [22, 23, 24, 25], 63, [65, 71.5, 78, 84.5].map(vsY)),
          colAt("VS", [26, 27, 28, 29], 55, [65, 71.5, 78, 84.5].map(vsY)),
          // levý okraj velkého sálu: VS 43–30
          colAt("VS", [43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30], 39.5, spread(17, 91, 14)),
          // Levý sál
          colAt("LS", [51, 52, 53, 54, 55, 56, 57], 5.5, spread(18, 54, 7)),
          colAt("LS", [58, 59, 60, 61], 13, [22, 29, 40, 47]),
          colAt("LS", [62, 63, 64, 65], 20.5, [22, 29, 40, 47]),
          colAt("LS", [47, 48, 49, 50], 28, [18, 26, 34, 42]),
          // Pravý sál
          colAt("PS", [77, 78, 79, 80, 81, 82, 83, 73], 5.5, spread(82, 138, 8)),
          colAt("PS", [74, 75, 76, 71, 72], 14.5, spread(82, 118, 5)),
          colAt("PS", [66, 67, 68, 69], 26, spread(82, 103, 4))
        )
      },
      gallery: {
        w: 80, h: 110, d: 5,
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

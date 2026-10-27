/* Rozmístění stolů v Ideonu – podle plánku od p. Vašíčka (PLESOVÉ USPOŘÁDÁNÍ IDEON.xls),
   Arnoštova náčrtu a fotky z galerie nad barem:
   - Velký sál: podium s kapelou podél celé levé stěny, parket hned před ním,
     stoly kolem parketu do „U“ (nahoře, vpravo u baru, dole),
   - Galerie: ochoz do „U“ kolem velkého sálu (nad podiem, nad barem, dole), schody v horních rozích,
     stůl G 27 (naproti podiu nad barem) je zrušený – je tam projekce,
   - Levý a Pravý sál pod velkým sálem, mezi nimi WC.
   Souřadnice jsou v jednotkách plánku, stůl = [označení, x, y]. Označení musí sedět se sloupcem „Stůl“ v tabulce.
   cls u zón: solid (podium), floor-dance (parket), void (prostor nad sálem), stairs (schody), faded (vidět zdola). */
window.IDEON_PLAN = (function () {
  function row(prefix, nums, xs, y) {
    return nums.map(function (n, i) { return [prefix + " " + n, xs[i], y]; });
  }
  function column(prefix, nums, x, y0, step) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, y0 + i * step]; });
  }
  function spread(from, to, count) {
    var out = [], step = (to - from) / (count - 1);
    for (var i = 0; i < count; i++) out.push(+(from + i * step).toFixed(2));
    return out;
  }

  return {
    seats: { VS: 6, LS: 8, PS: 8, G: 8 },
    halls: { VS: "Velký sál", LS: "Levý sál", PS: "Pravý sál", G: "Galerie" },
    floors: {
      ground: {
        w: 120, h: 91, d: 4.3,
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
          column("LS", [47, 48, 49, 50], 5, 68, 5),
          row("LS", [62, 63, 64, 65], [12, 18, 27, 33], 69),
          row("LS", [58, 59, 60, 61], [12, 18, 27, 33], 76),
          row("LS", [51, 52, 53, 54, 55, 56, 57], spread(10.5, 35.5, 7), 85.5),
          // Pravý sál
          row("PS", [66, 67, 68, 69], [84, 90, 96, 102], 68),
          row("PS", [74, 75, 76, 71, 72], [84, 90.5, 97, 104, 111], 76),
          row("PS", [77, 78, 79, 80, 81, 82, 83, 73], spread(84.5, 114, 8), 85.5)
        )
      },
      gallery: {
        w: 112, h: 70, d: 4.5,
        rooms: [
          { x: 1, y: 1, w: 110, h: 68 }      // ochoz galerie (vnitřek zakryje prostor nad sálem)
        ],
        zones: [
          { t: "", x: 17, y: 1, w: 73, h: 57, cls: "void" },
          { t: "Taneční parket (dole)", x: 28, y: 13, w: 34, h: 33, cls: "floor-dance faded" },
          { t: "Podium", x: 18.5, y: 13, w: 9.5, h: 33, cls: "solid faded" },
          { t: "Stoly velkého sálu (dole)", x: 63, y: 13, w: 25, h: 33, cls: "faded" },
          { t: "Schody", x: 2, y: 2, w: 13, h: 5, cls: "stairs" },
          { t: "Schody", x: 92, y: 2, w: 18, h: 5, cls: "stairs" },
          { t: "Projekce", x: 100.5, y: 27, w: 9, h: 6, cls: "solid" }
        ],
        names: [
          { t: "Galerie · stoly po 8 · ochoz s výhledem do sálu", x: 30, y: 52 }
        ],
        tables: [].concat(
          column("G", [1, 2, 3, 4, 5, 6, 7, 8], 8.5, 12, 6),
          [["G 30", 96, 12], ["G 29", 105, 18], ["G 28", 105, 24]],
          column("G", [26, 25, 24, 23], 96, 36, 6),
          row("G", [9, 10, 11, 12, 13, 14, 15], spread(14, 48, 7), 63.5),
          row("G", [16, 17, 18, 19, 20, 21, 22], spread(60, 94, 7), 63.5)
        )
      }
    }
  };
})();

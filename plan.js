/* Rozmístění stolů v Ideonu podle plánku od p. Vašíčka (PLESOVÉ USPOŘÁDÁNÍ IDEON.xls).
   Souřadnice jsou v jednotkách plánku, každý stůl je [označení, x, y].
   Označení musí sedět se sloupcem „Stůl“ v tabulce (např. "VS 12").
   rooms = obrysy sálů (stěny), zones = podium, parket, bar…, names = popisky sálů. */
window.IDEON_PLAN = (function () {
  function row(prefix, nums, xs, y) {
    return nums.map(function (n, i) { return [prefix + " " + n, xs[i], y]; });
  }
  function column(prefix, nums, x, y0, step) {
    return nums.map(function (n, i) { return [prefix + " " + n, x, y0 + i * step]; });
  }

  return {
    seats: { VS: 6, LS: 8, PS: 8, G: 8 },
    floors: {
      ground: {
        w: 120, h: 88, d: 4.4,
        rooms: [
          { x: 1, y: 1, w: 118, h: 51 },   // Velký sál
          { x: 1, y: 55, w: 50, h: 32 },   // Levý sál
          { x: 59, y: 55, w: 60, h: 32 }   // Pravý sál
        ],
        zones: [
          { t: "Podium", x: 13, y: 22, w: 15, h: 10, solid: true },
          { t: "Kapela", x: 13, y: 33, w: 15, h: 5 },
          { t: "Taneční parket", x: 30, y: 24, w: 28, h: 14, dance: true },
          { t: "VIP salonek", x: 92, y: 3, w: 25, h: 6 },
          { t: "Bar", x: 108, y: 18, w: 10, h: 8 },
          { t: "Šatna", x: 3, y: 24, w: 8, h: 7 },
          { t: "Fotokoutek", x: 3, y: 44, w: 12, h: 6 },
          { t: "WC", x: 52, y: 58, w: 6, h: 10 },
          { t: "Fotokoutek", x: 104, y: 58, w: 13, h: 6 }
        ],
        names: [
          { t: "Velký sál · stoly po 6", x: 32, y: 2.5 },
          { t: "Levý sál · stoly po 8", x: 3, y: 56.5 },
          { t: "Pravý sál · stoly po 8", x: 61, y: 56.5 }
        ],
        tables: [].concat(
          row("VS", [1, 2], [8, 19], 10),
          row("VS", [3, 4, 5, 6, 7, 8, 9], [37, 43, 49, 61, 67, 73, 79], 9),
          row("VS", [10, 11, 12, 13], [42, 55, 68, 81], 15),
          row("VS", [14, 15, 16, 17], [52, 65, 78, 91], 21),
          row("VS", [18, 19, 20, 21], [64, 77, 90, 103], 28),
          row("VS", [22, 23, 24, 25], [64, 77, 90, 103], 35),
          row("VS", [26, 27, 28, 29], [52, 65, 78, 91], 42),
          row("VS", [43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30],
                    [22, 28, 34, 46, 52, 58, 64, 70, 76, 82, 88, 98, 104, 110], 48),
          column("LS", [47, 48, 49, 50], 5, 62, 5.5),
          row("LS", [62, 63, 64, 65], [19, 25, 37, 43], 62),
          row("LS", [58, 59, 60, 61], [19, 25, 34, 43], 70),
          row("LS", [51, 52, 53, 54, 55, 56, 57], [11, 17, 23, 29, 35, 41, 47], 83),
          row("PS", [66, 67, 68, 69], [68, 74, 84, 91], 62),
          row("PS", [74, 75, 76, 71, 72], [66, 75, 81, 90, 96], 70),
          row("PS", [77, 78, 79, 80, 81, 82, 83, 73], [64, 70, 76, 82, 88, 94, 100, 108], 83)
        )
      },
      gallery: {
        w: 108, h: 68, d: 4.6,
        rooms: [
          { x: 1, y: 1, w: 106, h: 66 }    // ochoz galerie
        ],
        zones: [
          { t: "", x: 12, y: 4, w: 72, h: 48, dance: false, voidArea: true },
          { t: "Podium", x: 16, y: 9, w: 14, h: 10, solid: true },
          { t: "Kapela", x: 16, y: 20, w: 14, h: 5 },
          { t: "Taneční parket (dole pod galerií)", x: 34, y: 9, w: 46, h: 38, dance: true }
        ],
        names: [{ t: "Galerie · stoly po 8 · ochoz s výhledem na parket", x: 14, y: 54.5 }],
        tables: [].concat(
          column("G", [1, 2, 3, 4, 5, 6, 7, 8], 6, 8, 6),
          [["G 30", 90, 8], ["G 29", 100, 14], ["G 28", 100, 20], ["G 27", 100, 26]],
          column("G", [26, 25, 24, 23], 90, 32, 6),
          row("G", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                   [14, 20, 26, 32, 38, 44, 50, 60, 66, 72, 78, 84, 90, 96], 61)
        )
      }
    }
  };
})();

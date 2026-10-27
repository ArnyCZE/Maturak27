/* Rozmístění stolů v Ideonu podle plánku od p. Vašíčka (PLESOVÉ USPOŘÁDÁNÍ IDEON.xls).
   Souřadnice jsou v jednotkách plánku (šířka 120), každý stůl je [označení, x, y].
   Označení musí sedět se sloupcem „Stůl“ v tabulce (např. "VS 12"). */
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
        w: 120, h: 84, d: 4.4,
        zones: [
          { t: "Podium", x: 13, y: 20, w: 14, h: 12, solid: true },
          { t: "Kapela", x: 13, y: 33, w: 14, h: 6 },
          { t: "Taneční parket", x: 29, y: 19, w: 20, h: 20, dance: true },
          { t: "VIP salonek", x: 88, y: 1, w: 30, h: 6 },
          { t: "Bar", x: 107, y: 16, w: 11, h: 8 },
          { t: "Šatna", x: 1, y: 27, w: 10, h: 8 },
          { t: "Fotokoutek", x: 1, y: 44, w: 13, h: 6 },
          { t: "Fotokoutek", x: 106, y: 53, w: 13, h: 6 },
          { t: "WC", x: 52, y: 53, w: 10, h: 6 }
        ],
        names: [
          { t: "Velký sál · stoly po 6", x: 32, y: 1.5 },
          { t: "Levý sál · stoly po 8", x: 1, y: 52.5 },
          { t: "Pravý sál · stoly po 8", x: 64, y: 52.5 }
        ],
        divider: { x: 0, y: 52, w: 120 },
        tables: [].concat(
          row("VS", [1, 2], [6, 18], 11),
          row("VS", [3, 4, 5, 6, 7, 8, 9], [37, 43, 49, 61, 67, 73, 79], 8),
          row("VS", [10, 11, 12, 13], [44, 57, 70, 83], 15),
          row("VS", [14, 15, 16, 17], [53, 65, 78, 91], 21),
          row("VS", [18, 19, 20, 21], [64, 77, 90, 103], 28),
          row("VS", [22, 23, 24, 25], [63, 76, 89, 102], 35),
          row("VS", [26, 27, 28, 29], [53, 65, 78, 91], 41),
          row("VS", [43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30],
                    [22, 28, 34, 46, 52, 58, 64, 70, 76, 82, 88, 98, 104, 110], 47),
          column("LS", [47, 48, 49, 50], 5, 60, 5.5),
          row("LS", [62, 63, 64, 65], [19, 25, 37, 43], 60),
          row("LS", [58, 59, 60, 61], [19, 25, 34, 43], 68),
          row("LS", [51, 52, 53, 54, 55, 56, 57], [11, 17, 23, 30, 36, 42, 48], 79),
          row("PS", [66, 67, 68, 69], [70, 76, 86, 93], 60),
          row("PS", [74, 75, 76, 71, 72], [66, 75, 81, 90, 96], 68),
          row("PS", [77, 78, 79, 80, 81, 82, 83, 73], [62, 68, 74, 80, 86, 92, 98, 106], 79)
        )
      },
      gallery: {
        w: 120, h: 66, d: 4.6,
        zones: [
          { t: "Podium", x: 16, y: 8, w: 14, h: 10, solid: true },
          { t: "Kapela", x: 16, y: 20, w: 14, h: 6 },
          { t: "Taneční parket (pod galerií)", x: 34, y: 8, w: 42, h: 30, dance: true }
        ],
        names: [{ t: "Galerie · stoly po 8 · výhled dolů na parket", x: 14, y: 1.5 }],
        tables: [].concat(
          column("G", [1, 2, 3, 4, 5, 6, 7, 8], 5, 7, 6),
          [["G 30", 88, 7], ["G 29", 100, 13], ["G 28", 100, 19], ["G 27", 100, 25]],
          column("G", [26, 25, 24, 23], 88, 31, 6),
          row("G", [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                   [12, 18, 24, 30, 36, 42, 48, 60, 66, 72, 78, 84, 90, 96], 60)
        )
      }
    }
  };
})();

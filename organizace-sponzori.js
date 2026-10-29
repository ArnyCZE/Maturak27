/* Plánovač plesu – záložka Sponzoři (oslovené firmy z tabulky „Maturák Sponzoři“ a tipy na nové).
   Data dodá organizace.js přes window.PlesOrg (render + uložení změny stavu). */
(function () {
  "use strict";

  // sloupce (index od 0)
  var S = { name: 0, city: 1, email: 2, person: 3, status: 6, gift: 7, note: 8, note2: 10 };
  var T = { name: 0, city: 1, field: 2, web: 3, email: 4, ask: 5, prio: 6, note: 7, source: 8, status: 9 };
  var STATES = ["Neosloveno", "Odesláno", "V jednání", "Dar do tomboly", "Odmítnuto"];
  var GROUPS = [
    { id: "dar", test: function (s) { return /^dar/i.test(s); } },
    { id: "jednani", test: function (s) { return /jedn/i.test(s); } },
    { id: "ceka", test: function (s) { return /^odesl/i.test(s); } },
    { id: "odmitnuto", test: function (s) { return /odm/i.test(s); } },
    { id: "neosloveno", test: function (s) { return !s || /^neoslov/i.test(s); } },
    { id: "tipy", tips: true }
  ];
  var view = { group: "dar", q: "" };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function has(v) { return String(v == null ? "" : v).trim() !== ""; }
  function st(v) { return String(v == null ? "" : v).trim(); }
  function cls(s) { return /^dar/i.test(s) ? "s4" : /jedn/i.test(s) ? "s2" : /^odesl/i.test(s) ? "s1" : /odm/i.test(s) ? "neg-pill" : "s0"; }
  function norm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  function groupOf(status) {
    for (var i = 0; i < GROUPS.length - 1; i++) if (GROUPS[i].test(st(status))) return GROUPS[i].id;
    return "neosloveno";
  }

  function render(d) {
    var spons = (d.sponzori || []).filter(function (r) { return has(r.v[S.name]); });
    var tips = (d.tipy || []).filter(function (r) { return has(r.v[T.name]); });
    var counts = {};
    spons.forEach(function (r) { var g = groupOf(r.v[S.status]); counts[g] = (counts[g] || 0) + 1; });
    var freshTips = tips.filter(function (r) { return !has(r.v[T.status]) || /^neoslov/i.test(st(r.v[T.status])); }).length;

    $("spDar").textContent = counts.dar || 0;
    $("spJed").textContent = counts.jednani || 0;
    $("spCeka").textContent = counts.ceka || 0;
    $("spOdm").textContent = counts.odmitnuto || 0;
    $("spNeo").textContent = counts.neosloveno || 0;
    $("spTip").textContent = freshTips;
    $("spTipSub").textContent = "z " + tips.length + " tipů ještě neosloveno";
    $("spTotalSub").textContent = "z " + spons.length + " oslovených firem";
    var asked = spons.length - (counts.neosloveno || 0);
    $("spRate").textContent = asked ? Math.round((counts.dar || 0) / asked * 100) + " % úspěšnost" : "";

    document.querySelectorAll("[data-spgo]").forEach(function (el) {
      var on = el.dataset.spgo === view.group;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });

    var q = norm(view.q), html;
    if (view.group === "tipy") {
      var list = tips.filter(function (r) { return !q || norm(r.v.join(" ")).indexOf(q) !== -1; })
        .sort(function (a, b) { return (Number(a.v[T.prio]) || 9) - (Number(b.v[T.prio]) || 9); });
      html = list.map(function (r) { return tipCard(r); }).join("");
    } else {
      var list2 = spons.filter(function (r) { return groupOf(r.v[S.status]) === view.group && (!q || norm(r.v.join(" ")).indexOf(q) !== -1); })
        .sort(function (a, b) { return String(a.v[S.name]).localeCompare(String(b.v[S.name]), "cs"); });
      html = list2.map(function (r) { return sponsorCard(r); }).join("");
    }
    $("spList").innerHTML = html || '<p class="empty">Nic tu není.</p>';
  }

  function select(sheet, row, col, value) {
    var opts = STATES.map(function (s) { return "<option" + (s === st(value) ? " selected" : "") + ">" + s + "</option>"; }).join("");
    if (has(value) && STATES.indexOf(st(value)) === -1) opts = "<option selected>" + esc(value) + "</option>" + opts;
    return '<select data-sp="' + sheet + '" data-row="' + row + '" data-col="' + col + '" aria-label="Stav">' + opts + "</select>";
  }

  function sponsorCard(r) {
    var v = r.v, status = st(v[S.status]) || "Neosloveno";
    return '<article class="card sp">' +
      '<header><div><p class="kind">' + esc(v[S.city]) + "</p><h3>" + esc(v[S.name]) + '</h3></div><span class="pill ' + cls(status) + '">' + esc(status) + "</span></header>" +
      (has(v[S.gift]) ? "<p>🎁 " + esc(v[S.gift]) + "</p>" : "") +
      (has(v[S.note]) || has(v[S.note2]) ? '<p class="note">' + esc([v[S.note], v[S.note2]].filter(has).join(" · ")) + "</p>" : "") +
      '<div class="meta">' + (has(v[S.person]) ? "<span>👤 " + esc(v[S.person]) + "</span>" : "") + "</div>" +
      '<div class="acts">' + select("sponzori", r.row, S.status + 1, v[S.status]) +
      (has(v[S.email]) ? '<a href="mailto:' + esc(v[S.email]) + '">✉️ E-mail</a>' : "") + "</div></article>";
  }

  function tipCard(r) {
    var v = r.v, status = st(v[T.status]) || "Neosloveno", web = st(v[T.web]);
    return '<article class="card sp">' +
      '<header><div><p class="kind">' + esc(v[T.city]) + (has(v[T.prio]) ? " · priorita " + esc(v[T.prio]) : "") + "</p><h3>" + esc(v[T.name]) + '</h3></div><span class="pill ' + cls(status) + '">' + esc(status) + "</span></header>" +
      (has(v[T.field]) ? '<p class="muted small">' + esc(v[T.field]) + "</p>" : "") +
      (has(v[T.ask]) ? "<p>💡 " + esc(v[T.ask]) + "</p>" : "") +
      (has(v[T.note]) ? '<p class="note">' + esc(v[T.note]) + "</p>" : "") +
      '<div class="acts">' + select("tipy", r.row, T.status + 1, v[T.status]) +
      (has(v[T.email]) ? '<a href="mailto:' + esc(v[T.email]) + '">✉️ E-mail</a>' : "") +
      (/^https?:\/\//i.test(web) ? '<a href="' + esc(web) + '" target="_blank" rel="noopener">🌐 Web</a>' : "") + "</div></article>";
  }

  $("spSearch").addEventListener("input", function (e) {
    view.q = e.target.value; window.PlesOrg && render(window.PlesOrg.data());
  });
  $("spList").addEventListener("change", function (e) {
    var s = e.target.closest("[data-sp]"); if (!s || !window.PlesOrg) return;
    window.PlesOrg.save(s.dataset.sp, s.dataset.row, s.dataset.col, s.value, "Stav sponzora změněn ✓");
  });
  document.querySelectorAll("[data-spgo]").forEach(function (el) {
    function go() { view.group = el.dataset.spgo; window.PlesOrg && render(window.PlesOrg.data()); }
    el.addEventListener("click", go);
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  window.PlesOrgSponsors = { render: render };
})();

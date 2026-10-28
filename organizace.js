/* Plánovač plesu – stránka pro organizátory.
   Data jsou v soukromé tabulce, sem je pošle skript v tabulce až po přihlášení organizátora. */
(function () {
  "use strict";

  var API = (window.PLES_CONFIG || {}).api;
  var SESSION_KEY = "ples-org-session";
  var BALL = new Date(2027, 0, 30, 18, 0);

  // stavy dodavatelů v pořadí; úroveň 0–4 = barva a ukazatel postupu
  var STATES = [
    ["Nezajištěno", 0], ["Poptáno", 1], ["V jednání", 1], ["Domluveno", 2], ["Smlouva odeslána", 2],
    ["Smlouva podepsána", 3], ["Záloha zaplacena", 3], ["Zaplaceno", 4]
  ];
  var LEVEL = {};
  STATES.forEach(function (s) { LEVEL[s[0].toLowerCase()] = s[1]; });

  // sloupce v tabulce (index od 0)
  var D = { cat: 0, name: 1, what: 2, person: 3, phone: 4, email: 5, status: 6, price: 7, paid: 8, due: 9, contract: 10, note: 11, owner: 12 };
  var R = { type: 0, item: 1, plan: 2, actual: 3, note: 4 };
  var U = { text: 0, who: 1, due: 2, done: 3, note: 4 };
  var K = { name: 0, role: 1, phone: 2, email: 3, note: 4 };

  var state = { data: null, sales: null, me: "", supFilter: "Vše", taskFilter: "open" };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- spojení se skriptem (JSONP, funguje i z GitHub Pages) ---------- */

  var seq = 0;
  function api(params) {
    return new Promise(function (resolve, reject) {
      var cb = "orgCb" + (++seq) + "_" + Date.now(), s = document.createElement("script"), done = false;
      var timer = setTimeout(function () { finish(); reject(new Error("Server neodpovídá – zkontroluj internet a zkus to znovu.")); }, 20000);
      function finish() { done = true; clearTimeout(timer); delete window[cb]; s.remove(); }
      window[cb] = function (res) { if (!done) { finish(); resolve(res); } };
      var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); });
      q.push("callback=" + cb);
      s.src = API + "?" + q.join("&");
      s.onerror = function () { if (!done) { finish(); reject(new Error("Nepodařilo se spojit se serverem.")); } };
      document.head.appendChild(s);
    });
  }

  function authed(params) {
    params.session = localStorage.getItem(SESSION_KEY) || "";
    return api(params).then(function (res) {
      if (res && res.loggedOut) { logout(res.error); throw new Error(res.error); }
      if (!res || !res.ok) throw new Error((res && res.error) || "Něco se nepovedlo.");
      return res;
    });
  }

  /* ---------- přihlášení ---------- */

  function showLogin(err) {
    $("app").hidden = true; $("login").hidden = false; loading(false);
    $("lgErr").textContent = err || "";
    $("lgName").focus();
  }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("lgBtn");
    btn.disabled = true; btn.textContent = "Přihlašuji…"; $("lgErr").textContent = "";
    api({ action: "login", login: $("lgName").value, password: $("lgPass").value })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error);
        if (!res.org) throw new Error("Tenhle účet nemá přístup do plánovače. Napiš Arnoštovi.");
        localStorage.setItem(SESSION_KEY, res.session);
        localStorage.setItem(SESSION_KEY + "-name", res.name);
        $("lgPass").value = "";
        start();
      })
      .catch(function (err) { $("lgErr").textContent = err.message; })
      .then(function () { btn.disabled = false; btn.textContent = "Přihlásit"; });
  });
  $("lgShow").addEventListener("click", function () {
    var p = $("lgPass"); p.type = p.type === "password" ? "text" : "password";
  });
  $("logout").addEventListener("click", function () { logout(); });

  function logout(msg) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY + "-name");
    state.data = null;
    showLogin(msg);
  }

  /* ---------- načtení dat ---------- */

  function start() {
    if (!localStorage.getItem(SESSION_KEY)) return showLogin();
    state.me = localStorage.getItem(SESSION_KEY + "-name") || "";
    loading(true);
    return reload().then(function () {
      $("login").hidden = true; $("app").hidden = false;
      openTab(location.hash.slice(1) || "prehled");
    }).catch(function (err) { if (localStorage.getItem(SESSION_KEY)) showLogin(err.message); })
      .then(function () { loading(false); });
  }

  function reload() {
    return authed({ action: "org" }).then(function (res) {
      state.data = res.data; state.sales = res.sales;
      $("whoName").textContent = state.me;
      $("updated").textContent = "Aktualizováno " + new Date(res.updated).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
      render();
    });
  }

  // co 2 minuty potichu obnovit (ostatní organizátoři mohli něco změnit)
  setInterval(function () { if (state.data && !document.hidden) reload().catch(function () {}); }, 120000);

  /* ---------- záložky ---------- */

  function openTab(name) {
    if (!document.querySelector('[data-panel="' + name + '"]')) name = "prehled";
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === name); });
    document.querySelectorAll(".panel").forEach(function (p) { p.classList.toggle("on", p.dataset.panel === name); });
    if (location.hash.slice(1) !== name) history.replaceState(null, "", "#" + name);
  }
  $("tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) { openTab(b.dataset.tab); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });

  /* ---------- pomocné ---------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function num(v) { var n = Number(String(v == null ? "" : v).replace(/\s/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; }
  function has(v) { return String(v == null ? "" : v).trim() !== ""; }
  function kc(n) { return Math.round(n).toLocaleString("cs-CZ") + " Kč"; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseDate(s) { var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function daysTo(d) { return Math.round((d - today()) / 86400000); }
  function whenText(s) {
    var d = parseDate(s); if (!d) return { text: esc(s || ""), cls: "" };
    var n = daysTo(d), date = d.getDate() + ". " + (d.getMonth() + 1) + ".";
    if (n < 0) return { text: date + " · " + (-n) + " d po termínu", cls: "late" };
    if (n === 0) return { text: "dnes", cls: "late" };
    if (n === 1) return { text: "zítra", cls: "soon" };
    return { text: date + (n <= 14 ? " · za " + n + " d" : ""), cls: n <= 7 ? "soon" : "" };
  }
  function level(status) { var l = LEVEL[String(status || "").trim().toLowerCase()]; return l == null ? 1 : l; }
  function pill(status) { return '<span class="pill s' + level(status) + '">' + esc(status || "Nezajištěno") + "</span>"; }
  function bar(id, part, total) { $(id).style.width = (total ? Math.min(100, part / total * 100) : 0) + "%"; }

  function toast(text, bad) {
    var t = $("msg"); t.textContent = text; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3000);
  }
  function loading(on) { $("loading").hidden = !on; }

  function save(sheet, row, col, value, okText) {
    loading(true);
    return authed({ action: "orgSet", sheet: sheet, row: row, col: col, value: value })
      .then(function () { toast(okText || "Uloženo ✓"); return reload(); })
      .catch(function (err) { toast(err.message, true); render(); })
      .then(function () { loading(false); });
  }

  /* ---------- vykreslení ---------- */

  function render() {
    var d = state.data; if (!d) return;
    $("daysLeft").textContent = Math.max(0, daysTo(new Date(2027, 0, 30)));
    renderOverview(d); renderSuppliers(d.dodavatele); renderBudget(d.rozpocet); renderTasks(d.ukoly); renderContacts(d.kontakty);
  }

  function budgetTotals(rows) {
    var t = { inPlan: 0, inAct: 0, outPlan: 0, outAct: 0 };
    rows.forEach(function (r) {
      var isIn = /^p/i.test(r.v[R.type]), act = ticketRow(r) ? state.sales.revenue : num(r.v[R.actual]);
      if (isIn) { t.inPlan += num(r.v[R.plan]); t.inAct += act; } else { t.outPlan += num(r.v[R.plan]); t.outAct += act; }
    });
    return t;
  }
  function ticketRow(r) { return /^p/i.test(r.v[R.type]) && /vstupenk/i.test(r.v[R.item]); }

  function renderOverview(d) {
    var sup = d.dodavatele, secured = sup.filter(function (r) { return level(r.v[D.status]) >= 2; }).length;
    $("kSup").textContent = secured + " / " + sup.length;
    $("kSupSub").textContent = "zajištěno (domluveno a dál)";
    bar("kSupBar", secured, sup.length);

    var b = budgetTotals(d.rozpocet), bal = b.inPlan - b.outPlan;
    $("kBud").textContent = (bal >= 0 ? "+" : "") + kc(bal);
    $("kBud").className = bal < 0 ? "neg" : "pos";
    $("kBudSub").textContent = "plán: příjmy " + kc(b.inPlan) + " · výdaje " + kc(b.outPlan);

    var tasks = d.ukoly, done = tasks.filter(function (r) { return r.v[U.done] === "ano"; }).length;
    var late = tasks.filter(function (r) { var x = parseDate(r.v[U.due]); return r.v[U.done] !== "ano" && x && daysTo(x) < 0; }).length;
    $("kTask").textContent = done + " / " + tasks.length;
    $("kTaskSub").textContent = late ? late + " po termínu" : "hotovo";
    $("kTaskSub").className = late ? "neg" : "";
    bar("kTaskBar", done, tasks.length);

    var s = state.sales;
    $("kTix").textContent = s.paid + " / " + s.total;
    $("kTixSub").textContent = "prodáno · " + kc(s.revenue) + (s.reserved ? " · " + s.reserved + " drženo" : "");
    bar("kTixBar", s.paid, s.total);

    // co hoří: úkoly a platby po termínu nebo do 14 dní, dodavatelé bez domluvy
    var hot = [];
    tasks.forEach(function (r) {
      var x = parseDate(r.v[U.due]); if (r.v[U.done] === "ano" || !x || daysTo(x) > 14) return;
      hot.push({ d: x, html: "✓ " + esc(r.v[U.text]) + (has(r.v[U.who]) ? ' <span class="muted small">· ' + esc(r.v[U.who]) + "</span>" : ""), due: r.v[U.due] });
    });
    sup.forEach(function (r) {
      var x = parseDate(r.v[D.due]); if (!x || level(r.v[D.status]) >= 4 || daysTo(x) > 14) return;
      hot.push({ d: x, html: "💰 " + esc(r.v[D.name]) + ' <span class="muted small">· ' + esc(r.v[D.status]) + "</span>", due: r.v[D.due] });
    });
    hot.sort(function (a, b) { return a.d - b.d; });
    var open = sup.filter(function (r) { return level(r.v[D.status]) < 2; });
    var html = hot.map(function (h) { var w = whenText(h.due); return "<li><span>" + h.html + '</span><span class="when ' + w.cls + '">' + w.text + "</span></li>"; }).join("");
    html += open.map(function (r) { return "<li><span>🔎 " + esc(r.v[D.cat]) + ": " + esc(r.v[D.name]) + '</span><span class="when">' + esc(r.v[D.status] || "nezajištěno") + "</span></li>"; }).join("");
    $("hot").innerHTML = html || '<li class="empty">Nic nehoří 🎉</li>';

    $("supMini").innerHTML = sup.map(function (r) {
      return '<div class="row" data-go="' + r.row + '"><span class="cat">' + esc(r.v[D.cat]) + "</span><b>" + esc(r.v[D.name]) + "</b>" + pill(r.v[D.status]) + "</div>";
    }).join("") || '<p class="empty">Zatím žádní dodavatelé.</p>';
  }

  $("supMini").addEventListener("click", function (e) {
    var row = e.target.closest("[data-go]"); if (!row) return;
    state.supFilter = "Vše"; renderSuppliers(state.data.dodavatele); openTab("dodavatele");
    var card = document.querySelector('.card[data-row="' + row.dataset.go + '"]');
    if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.add("flash"); setTimeout(function () { card.classList.remove("flash"); }, 1600); }
  });

  function renderSuppliers(rows) {
    var cats = ["Vše"].concat(rows.map(function (r) { return r.v[D.cat]; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }));
    if (cats.indexOf(state.supFilter) === -1) state.supFilter = "Vše";
    $("supFilter").innerHTML = cats.map(function (c) { return '<button class="' + (c === state.supFilter ? "on" : "") + '" data-c="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");

    var list = rows.filter(function (r) { return state.supFilter === "Vše" || r.v[D.cat] === state.supFilter; });
    $("supList").innerHTML = list.map(function (r) {
      var v = r.v, l = level(v[D.status]), price = num(v[D.price]), paid = num(v[D.paid]), w = whenText(v[D.due]);
      var opts = STATES.map(function (s) { return "<option" + (s[0] === v[D.status] ? " selected" : "") + ">" + s[0] + "</option>"; }).join("");
      if (has(v[D.status]) && LEVEL[String(v[D.status]).toLowerCase()] == null) opts = "<option selected>" + esc(v[D.status]) + "</option>" + opts;
      return '<article class="card" data-row="' + r.row + '">' +
        "<header><div><p class=\"kind\">" + esc(v[D.cat]) + "</p><h3>" + esc(v[D.name]) + "</h3></div>" + pill(v[D.status]) + "</header>" +
        '<div class="steps">' + [0, 1, 2, 3, 4].map(function (i) { return "<i" + (i <= l ? ' class="on"' : "") + "></i>"; }).join("") + "</div>" +
        (has(v[D.what]) ? "<p>" + esc(v[D.what]) + "</p>" : "") +
        '<div class="money">' +
          (has(v[D.price]) ? "<span>Cena <b>" + (price ? kc(price) : esc(v[D.price])) + "</b></span>" : "") +
          '<span>Zaplaceno <button data-paid="' + r.row + '" title="Změnit">' + (paid ? kc(paid) : "0 Kč") + "</button></span>" +
          (has(v[D.due]) ? '<span>Termín <b class="' + (w.cls === "late" ? "neg" : "") + '">' + w.text + "</b></span>" : "") +
        "</div>" +
        '<div class="meta">' +
          (has(v[D.person]) ? "<span>👤 " + esc(v[D.person]) + "</span>" : "") +
          (has(v[D.contract]) ? "<span>📄 Smlouva: " + esc(v[D.contract]) + "</span>" : "") +
          (has(v[D.owner]) ? "<span>🙋 Má na starosti: " + esc(v[D.owner]) + "</span>" : "") +
        "</div>" +
        (has(v[D.note]) ? '<p class="note">' + esc(v[D.note]) + "</p>" : "") +
        '<div class="acts">' +
          '<select data-status="' + r.row + '" aria-label="Stav">' + opts + "</select>" +
          (has(v[D.phone]) ? '<a href="tel:' + esc(String(v[D.phone]).replace(/\s/g, "")) + '">📞 Volat</a>' : "") +
          (has(v[D.email]) ? '<a href="mailto:' + esc(v[D.email]) + '">✉️ E-mail</a>' : "") +
        "</div></article>";
    }).join("") || '<p class="empty">Žádní dodavatelé v této kategorii.</p>';
  }

  $("supFilter").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.supFilter = b.dataset.c; renderSuppliers(state.data.dodavatele);
  });
  $("supList").addEventListener("change", function (e) {
    var s = e.target.closest("[data-status]"); if (s) save("dodavatele", s.dataset.status, D.status + 1, s.value, "Stav změněn ✓");
  });
  $("supList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-paid]"); if (!b) return;
    var row = state.data.dodavatele.filter(function (r) { return String(r.row) === b.dataset.paid; })[0];
    var v = prompt("Kolik už je zaplaceno (Kč)?", row ? num(row.v[D.paid]) || "" : "");
    if (v !== null) save("dodavatele", b.dataset.paid, D.paid + 1, v);
  });

  function renderBudget(rows) {
    var b = budgetTotals(rows), balPlan = b.inPlan - b.outPlan, balAct = b.inAct - b.outAct;
    $("bIn").textContent = kc(b.inPlan); $("bInSub").textContent = "zatím přišlo " + kc(b.inAct);
    $("bOut").textContent = kc(b.outPlan); $("bOutSub").textContent = "zatím zaplaceno " + kc(b.outAct);
    $("bBal").textContent = (balPlan >= 0 ? "+" : "") + kc(balPlan); $("bBal").className = balPlan < 0 ? "neg" : "pos";
    $("bBalSub").textContent = "podle plánu · teď na účtu " + (balAct >= 0 ? "+" : "") + kc(balAct);

    function table(isIn) {
      var list = rows.filter(function (r) { return /^p/i.test(r.v[R.type]) === isIn; }), sp = 0, sa = 0;
      var body = list.map(function (r) {
        var auto = ticketRow(r), act = auto ? state.sales.revenue : num(r.v[R.actual]);
        sp += num(r.v[R.plan]); sa += act;
        var actCell = auto ? kc(act) + "<small>z pokladny</small>" : '<button data-act="' + r.row + '">' + (has(r.v[R.actual]) ? kc(act) : "–") + "</button>";
        return "<tr><td>" + esc(r.v[R.item]) + (has(r.v[R.note]) ? "<small>" + esc(r.v[R.note]) + "</small>" : "") + "</td><td>" + (has(r.v[R.plan]) ? kc(num(r.v[R.plan])) : "–") + "</td><td>" + actCell + "</td></tr>";
      }).join("");
      return "<thead><tr><th>Položka</th><th>Plán</th><th>Skutečnost</th></tr></thead><tbody>" + (body || '<tr><td colspan="3" class="muted">Zatím nic.</td></tr>') +
        "</tbody><tfoot><tr><td>Celkem</td><td>" + kc(sp) + "</td><td>" + kc(sa) + "</td></tr></tfoot>";
    }
    $("tIn").innerHTML = table(true); $("tOut").innerHTML = table(false);
  }

  document.querySelector('[data-panel="rozpocet"]').addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var row = state.data.rozpocet.filter(function (r) { return String(r.row) === b.dataset.act; })[0];
    var v = prompt("Skutečná částka (Kč) – „" + (row ? row.v[R.item] : "") + "“:", row && has(row.v[R.actual]) ? num(row.v[R.actual]) : "");
    if (v !== null) save("rozpocet", b.dataset.act, R.actual + 1, v);
  });

  function renderTasks(rows) {
    var me = state.me.toLowerCase().split(" ")[0];
    var list = rows.filter(function (r) {
      var done = r.v[U.done] === "ano";
      if (state.taskFilter === "open") return !done;
      if (state.taskFilter === "done") return done;
      if (state.taskFilter === "mine") return !done && me && String(r.v[U.who]).toLowerCase().indexOf(me) !== -1;
      return true;
    }).sort(function (a, b) {
      var x = parseDate(a.v[U.due]), y = parseDate(b.v[U.due]);
      return (x ? x.getTime() : 9e15) - (y ? y.getTime() : 9e15);
    });
    $("taskList").innerHTML = list.map(function (r) {
      var done = r.v[U.done] === "ano", w = whenText(r.v[U.due]);
      return '<li class="' + (done ? "done" : "") + '"><input type="checkbox" data-task="' + r.row + '"' + (done ? " checked" : "") + ' aria-label="Hotovo">' +
        '<span class="t">' + esc(r.v[U.text]) + (has(r.v[U.note]) ? "<small>" + esc(r.v[U.note]) + "</small>" : "") + "</span>" +
        (has(r.v[U.who]) ? '<span class="who2">' + esc(r.v[U.who]) + "</span>" : "") +
        '<span class="when ' + (done ? "" : w.cls) + '">' + w.text + "</span></li>";
    }).join("") || '<li class="empty">' + (state.taskFilter === "mine" ? "Nemáš žádné nehotové úkoly (hledám podle jména " + esc(state.me) + ")." : "Žádné úkoly.") + "</li>";
  }

  $("taskFilter").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.taskFilter = b.dataset.f;
    document.querySelectorAll("#taskFilter button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderTasks(state.data.ukoly);
  });
  $("taskList").addEventListener("change", function (e) {
    var c = e.target.closest("[data-task]"); if (c) save("ukoly", c.dataset.task, U.done + 1, c.checked ? "ano" : "ne", c.checked ? "Hotovo ✓" : "Vráceno mezi nehotové");
  });
  $("addTask").addEventListener("submit", function (e) {
    e.preventDefault();
    loading(true);
    authed({ action: "orgAdd", text: $("atText").value, person: $("atWho").value, due: $("atDue").value })
      .then(function () { $("addTask").reset(); toast("Úkol přidán ✓"); return reload(); })
      .catch(function (err) { toast(err.message, true); })
      .then(function () { loading(false); });
  });

  function renderContacts(rows) {
    $("contactList").innerHTML = rows.map(function (r) {
      var v = r.v;
      return '<article class="card"><header><div><p class="kind">' + esc(v[K.role]) + "</p><h3>" + esc(v[K.name]) + "</h3></div></header>" +
        (has(v[K.note]) ? '<p class="muted small">' + esc(v[K.note]) + "</p>" : "") +
        '<div class="meta">' + (has(v[K.phone]) ? "<span>📞 " + esc(v[K.phone]) + "</span>" : "") + (has(v[K.email]) ? "<span>✉️ " + esc(v[K.email]) + "</span>" : "") + "</div>" +
        '<div class="acts">' + (has(v[K.phone]) ? '<a href="tel:' + esc(String(v[K.phone]).replace(/\s/g, "")) + '">📞 Volat</a>' : "") +
        (has(v[K.email]) ? '<a href="mailto:' + esc(v[K.email]) + '">✉️ E-mail</a>' : "") + "</div></article>";
    }).join("") || '<p class="empty">Zatím žádné kontakty.</p>';
  }

  start();
})();

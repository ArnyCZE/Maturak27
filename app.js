(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* --- ciferníky: rysky, XII/VI nahoře a dole, třídy 4.F a 4.H po stranách --- */
  var LABELS = { 0: "XII", 3: "4.H", 6: "VI", 9: "4.F" };
  function buildFace(svg, r) {
    var ticks = svg.querySelector(".ticks");
    var nums = svg.querySelector(".numerals");
    for (var i = 0; i < 60; i++) {
      if (i % 15 === 0) continue;
      var a = i * 6 * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = r - (major ? 26 : 8);
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", 200 + Math.sin(a) * r1);
      l.setAttribute("y1", 200 - Math.cos(a) * r1);
      l.setAttribute("x2", 200 + Math.sin(a) * r);
      l.setAttribute("y2", 200 - Math.cos(a) * r);
      l.setAttribute("stroke", major ? "#f4cf63" : "rgba(244,207,99,.35)");
      l.setAttribute("stroke-width", major ? 3.5 : 1);
      l.setAttribute("stroke-linecap", "round");
      ticks.appendChild(l);
    }
    Object.keys(LABELS).forEach(function (h) {
      var b = h * 30 * Math.PI / 180;
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", 200 + Math.sin(b) * (r - 30));
      t.setAttribute("y", 200 - Math.cos(b) * (r - 30));
      t.textContent = LABELS[h];
      nums.appendChild(t);
    });
  }
  var hero = document.getElementById("hero-clock");
  var prog = document.getElementById("prog-clock");
  buildFace(hero, 178);
  buildFace(prog, 182);

  function rot(el, deg) { el.style.transform = "rotate(" + deg + "deg)"; }

  /* --- úvodní hodiny: přetočí se pozpátku a zastaví v 10:04 (jako hodiny na radnici ve filmu) --- */
  var hh = hero.querySelector(".hand-h"), hm = hero.querySelector(".hand-m"), hs = hero.querySelector(".hand-s");
  var targetH = 10 * 30 + 4 * 0.5, targetM = 4 * 6;
  if (reduce) {
    rot(hh, targetH); rot(hm, targetM);
  } else {
    rot(hh, targetH + 720); rot(hm, targetM + 8640);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hh.classList.add("spin"); hm.classList.add("spin");
        rot(hh, targetH); rot(hm, targetM);
      });
    });
    setTimeout(function () { document.getElementById("flash").classList.add("go"); }, 3150);
  }
  function tickSeconds() { rot(hs, new Date().getSeconds() * 6); }
  tickSeconds(); setInterval(tickSeconds, 1000);

  /* --- zlatý prach v úvodu --- */
  var cvs = document.getElementById("dust"), ctx = cvs.getContext("2d");
  var dots = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function size() {
    W = cvs.offsetWidth; H = cvs.offsetHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    dots = [];
    var n = Math.round(W * H / 2600);
    for (var i = 0; i < n; i++) {
      // hustší oblak za nápisem vlevo, řidší jinde
      var cx = W * (W > 900 ? .3 : .5), cy = H * .45;
      var near = Math.random() < .65;
      dots.push({
        x: near ? cx + (Math.random() - .5) * W * .55 * Math.random() * 1.6 : Math.random() * W,
        y: near ? cy + (Math.random() - .5) * H * .55 * Math.random() * 1.6 : Math.random() * H,
        r: Math.random() * 1.6 + .2,
        a: Math.random() * Math.PI * 2,
        s: Math.random() * .02 + .005,
        vy: -(Math.random() * .15 + .02)
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.a += d.s; d.y += d.vy;
      if (d.y < -5) { d.y = H + 5; }
      var o = (Math.sin(d.a) + 1) / 2 * .8 + .1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + (240 + Math.round(o * 15)) + "," + (190 + Math.round(o * 40)) + ",90," + o + ")";
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  size(); seed(); draw();
  addEventListener("resize", function () { size(); seed(); });

  /* --- třpytivé hvězdičky --- */
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z"/></svg>';
  var heroEl = document.querySelector(".hero");
  [[8,12],[46,8],[90,10],[96,40],[58,78],[88,86],[4,70],[70,22],[30,90]].forEach(function (p, i) {
    var s = document.createElement("span");
    s.className = "sparkle";
    s.innerHTML = STAR;
    s.style.left = p[0] + "%"; s.style.top = p[1] + "%";
    s.style.animationDelay = (i * .37) + "s";
    var k = .6 + (i % 3) * .3;
    s.style.width = s.style.height = (22 * k) + "px";
    heroEl.appendChild(s);
  });

  /* --- odpočet a „present time“ --- */
  var MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  var ball = new Date("2027-01-30T18:00:00+01:00").getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function set(id, v) { document.getElementById(id).textContent = v; }
  function tick() {
    var now = new Date();
    set("p-mo", MONTHS[now.getMonth()]); set("p-d", pad(now.getDate()));
    set("p-y", now.getFullYear()); set("p-h", pad(now.getHours())); set("p-mi", pad(now.getMinutes()));
    var diff = Math.max(0, ball - now.getTime());
    set("cd-d", Math.floor(diff / 864e5));
    set("cd-h", pad(Math.floor(diff / 36e5) % 24));
    set("cd-m", pad(Math.floor(diff / 6e4) % 60));
    set("cd-s", pad(Math.floor(diff / 1e3) % 60));
  }
  tick(); setInterval(tick, 1000);

  /* --- odhalování sekcí při scrollování --- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
    });
  }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* --- program: hodiny ukazují čas právě aktivního bodu --- */
  var ph = prog.querySelector(".hand-h"), pm = prog.querySelector(".hand-m");
  var nowEl = document.getElementById("prog-now"), labelEl = document.getElementById("prog-label");
  function showTime(str, label) {
    var p = str.split(":"), h = +p[0], m = +p[1];
    // časy po půlnoci počítáme jako pokračování večera, aby se ručičky točily stále dopředu
    var sinceStart = ((h < 12 ? h + 24 : h) * 60 + m) - 18 * 60;
    rot(ph, 180 + sinceStart * 0.5);
    rot(pm, sinceStart * 6);
    nowEl.textContent = str;
    labelEl.textContent = label;
  }
  var steps = document.querySelectorAll(".step");
  var stepObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      steps.forEach(function (s) { s.classList.remove("active"); });
      e.target.classList.add("active");
      showTime(e.target.dataset.time, e.target.querySelector("h3").textContent);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  steps.forEach(function (s) { stepObs.observe(s); });
  showTime("18:00", "Otevření sálu");
  steps[0].classList.add("active");

  /* --- zasedací pořádek: plánek pro všechny, rezervace a QR kódy jen pro přihlášené pokladní --- */
  var CFG = window.PLES_CONFIG;
  var API = CFG.api;
  var PAY = { iban: CFG.iban, account: CFG.account, price: CFG.price };
  var SHEET_CSV = "https://docs.google.com/spreadsheets/d/18tbTqbiRGQaAFtXcp2peYWdz93SIBP-x7r0L-sKOW_0/gviz/tq?tqx=out:csv&sheet=Web";
  var SEATS = window.IDEON_PLAN.seats;
  var HALLS = window.IDEON_PLAN.halls;
  var FLOORS = window.IDEON_PLAN.floors;

  var taken = {};       // "VS 12" -> [čísla obsazených nebo právě držených židlí]
  var loaded = false;   // máme aktuální obsazenost?
  var live = false;     // běží rezervační skript?
  var session = localStorage.getItem("ples-session") || "";
  var cashierName = localStorage.getItem("ples-name") || "";
  var currentFloor = "ground";
  var planEl = document.getElementById("plan");
  var infoEl = document.getElementById("table-info");

  /* Volání skriptu přes <script> (JSONP) – funguje z GitHub Pages bez potíží s prohlížeči. */
  function api(params) {
    return new Promise(function (resolve) {
      var cb = "__ples" + Date.now() + Math.floor(Math.random() * 1e4);
      var s = document.createElement("script");
      var timer = setTimeout(function () { done({ ok: false, error: "Rezervační systém neodpovídá, zkus to prosím znovu." }); }, 20000);
      function done(data) { clearTimeout(timer); delete window[cb]; s.remove(); resolve(data); }
      window[cb] = done;
      s.onerror = function () { done({ ok: false, error: "Rezervační systém je teď nedostupný." }); };
      var q = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); }).join("&");
      s.src = API + "?" + q + "&callback=" + cb;
      document.head.appendChild(s);
    });
  }
  function cashierApi(params) {
    params.session = session;
    return api(params).then(function (res) {
      if (res.loggedOut) logout();
      return res;
    });
  }

  function pct(v, of) { return (v / of * 100) + "%"; }
  function place(el, x, y, w, h, f) {
    el.style.left = pct(x, f.w); el.style.top = pct(y, f.h);
    if (w) el.style.width = pct(w, f.w);
    if (h) el.style.height = pct(h, f.h);
  }
  function add(cls, text, x, y, w, h, f) {
    var el = document.createElement("div");
    el.className = cls;
    if (text) el.textContent = text;
    place(el, x, y, w, h, f);
    planEl.appendChild(el);
    return el;
  }

  function tableState(id) {
    var cap = SEATS[id.split(" ")[0]];
    var seats = (taken[id] || []).filter(function (s) { return s >= 1 && s <= cap; });
    return { cap: cap, used: seats.length, free: cap - seats.length, seats: seats };
  }

  function renderFloor(key) {
    currentFloor = key;
    var f = FLOORS[key];
    planEl.innerHTML = "";
    planEl.style.aspectRatio = f.w + " / " + f.h;

    (f.rooms || []).forEach(function (r) { add("room", "", r.x, r.y, r.w, r.h, f); });
    (f.zones || []).forEach(function (z) { add("zone " + (z.cls || ""), z.t, z.x, z.y, z.w, z.h, f); });
    (f.names || []).forEach(function (n) { add("hall-name", n.t, n.x, n.y, 0, 0, f); });

    f.tables.forEach(function (t) {
      var id = t[0], s = tableState(id);
      var el = add("table" + (!loaded ? " unknown" : s.free === 0 ? " full" : ""), "", t[1], t[2], f.d * 1.15, f.d * .7, f);
      el.style.setProperty("--p", Math.round(s.used / s.cap * 100));
      el.title = loaded ? id + " · volno " + s.free + " z " + s.cap : id;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.innerHTML = "<span>" + id.split(" ")[1] + "</span>";
      if (id === openId) el.classList.add("sel");
      el.addEventListener("click", function () { openTable(id, el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") openTable(id, el); });
    });
  }

  function updateStats() {
    var total = 0, free = 0;
    Object.keys(FLOORS).forEach(function (k) {
      FLOORS[k].tables.forEach(function (t) { var s = tableState(t[0]); total += s.cap; free += s.free; });
    });
    set("st-free", free);
    set("st-total", total);
    document.getElementById("st-bar").style.width = (free / total * 100) + "%";
  }

  function applyState(tables) {
    taken = {};
    Object.keys(tables).forEach(function (id) { taken[id] = tables[id].seats || []; });
    loaded = true;
    updateStats();
    renderFloor(currentFloor);
    if (openId && !hold && !document.getElementById("t-pick").hidden) drawSeats();
  }

  /* Obsazenost: přednostně živě ze skriptu, jinak ze sdílené tabulky. */
  function refresh() {
    return api({ action: "state" }).then(function (res) {
      if (res.ok) {
        live = true;
        applyState(res.tables);
        set("seat-msg", "Obsazenost se aktualizuje automaticky.");
        return;
      }
      live = false;
      return fetch(SHEET_CSV, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (text) {
          var rows = parseCSV(text), header = rows.shift() || [], tables = {};
          if (header[0] !== "Stůl") throw new Error("tabulka není propojená");
          rows.forEach(function (r) {
            if (!r[0]) return;
            var cap = SEATS[r[0].split(" ")[0]] || 0, count = parseInt(r[3], 10) || 0;
            var seats = String(r[5] || "").split(",").map(function (x) { return parseInt(x, 10); }).filter(function (n) { return n > 0; });
            for (var s = 1; seats.length < Math.min(count, cap) && s <= cap; s++) if (seats.indexOf(s) === -1) seats.push(s);
            tables[r[0].trim()] = { seats: seats };
          });
          applyState(tables);
          set("seat-msg", "Obsazenost může být pár minut stará.");
        })
        .catch(function () { set("seat-msg", "Aktuální obsazenost zveřejníme se spuštěním prodeje vstupenek."); });
    });
  }

  function parseCSV(text) {
    return text.trim().split(/\r?\n/).map(function (line) {
      var out = [], cur = "", q = false;
      for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
        else if (c === "," && !q) { out.push(cur); cur = ""; }
        else cur += c;
      }
      out.push(cur);
      return out;
    });
  }

  /* --- přihlášení pokladních --- */
  var cashierBar = document.createElement("div");
  cashierBar.className = "cashier-bar";
  document.getElementById("seat-msg").insertAdjacentElement("afterend", cashierBar);

  function renderCashierBar() {
    cashierBar.innerHTML = "";
    if (session) {
      var who = document.createElement("span");
      who.innerHTML = "🎟️ Pokladna: <b></b>";
      who.querySelector("b").textContent = cashierName;
      var out = document.createElement("button");
      out.className = "link-btn"; out.textContent = "Odhlásit";
      out.addEventListener("click", logout);
      cashierBar.appendChild(who); cashierBar.appendChild(out);
    } else {
      var inBtn = document.createElement("button");
      inBtn.className = "link-btn"; inBtn.textContent = "🔒 Přihlášení pro pokladní";
      inBtn.addEventListener("click", openLogin);
      cashierBar.appendChild(inBtn);
    }
  }

  var loginModal = document.createElement("div");
  loginModal.className = "tmodal";
  loginModal.hidden = true;
  loginModal.innerHTML =
    '<form class="tcard login-card" role="dialog" aria-modal="true" aria-labelledby="l-title">' +
      '<button type="button" class="tclose" aria-label="Zavřít">×</button>' +
      '<div class="t-hall">Jen pro maturanty</div>' +
      '<h3 id="l-title">Pokladna</h3>' +
      '<label for="l-login">Přihlašovací jméno</label><input id="l-login" autocomplete="username" required>' +
      '<label for="l-pass">Heslo</label><input id="l-pass" type="password" autocomplete="current-password" required>' +
      '<p class="t-note" id="l-msg"></p>' +
      '<button class="pill" type="submit" id="l-submit">Přihlásit</button>' +
    '</form>';
  document.body.appendChild(loginModal);

  function openLogin() {
    document.getElementById("l-msg").textContent = "";
    loginModal.hidden = false;
    requestAnimationFrame(function () { loginModal.classList.add("open"); });
    document.getElementById("l-login").focus();
  }
  function closeLogin() {
    loginModal.classList.remove("open");
    setTimeout(function () { loginModal.hidden = true; }, 250);
  }
  loginModal.querySelector(".tclose").addEventListener("click", closeLogin);
  loginModal.addEventListener("click", function (e) { if (e.target === loginModal) closeLogin(); });
  loginModal.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = document.getElementById("l-submit");
    btn.disabled = true;
    set("l-msg", "Ověřuji…");
    api({ action: "login", login: document.getElementById("l-login").value, password: document.getElementById("l-pass").value })
      .then(function (res) {
        btn.disabled = false;
        if (!res.ok) { set("l-msg", res.error); return; }
        session = res.session; cashierName = res.name;
        localStorage.setItem("ples-session", session);
        localStorage.setItem("ples-name", cashierName);
        document.getElementById("l-pass").value = "";
        renderCashierBar();
        closeLogin();
        if (openId) drawSeats();
      });
  });

  function logout() {
    session = ""; cashierName = "";
    localStorage.removeItem("ples-session");
    localStorage.removeItem("ples-name");
    renderCashierBar();
    if (openId && !hold) drawSeats();
  }

  /* --- okénko stolu: obsazenost pro všechny; výběr míst, 5min rezervace a QR jen pro pokladní --- */
  var modal = document.createElement("div");
  modal.className = "tmodal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="tcard" role="dialog" aria-modal="true" aria-labelledby="t-title">' +
      '<button class="tclose" aria-label="Zavřít">×</button>' +
      '<div class="t-hall" id="t-hall"></div>' +
      '<h3 id="t-title"></h3>' +
      '<div id="t-pick">' +
        '<svg class="t-seats" id="t-seats" viewBox="0 0 240 160"></svg>' +
        '<div class="t-free" id="t-free"></div>' +
        '<p class="t-note" id="t-note"></p>' +
        '<div class="t-buyer" id="t-buyer-box" hidden>' +
          '<label for="t-buyer">Jméno kupujícího (kdo za místa odpovídá)</label>' +
          '<input id="t-buyer" autocomplete="off" placeholder="např. Jan Novák">' +
        '</div>' +
        '<button class="pill t-buy" id="t-buy" disabled>Vyber místa</button>' +
      '</div>' +
      '<div id="t-pay" hidden>' +
        '<div class="t-timer" id="t-timer"></div>' +
        '<div class="t-qr" id="t-qr"></div>' +
        '<div class="t-free" id="t-amount"></div>' +
        '<p class="t-details" id="t-details"></p>' +
        '<p class="t-note" id="t-paynote"></p>' +
        '<button class="pill" id="t-paid">✓ Zaplaceno</button>' +
        '<button class="pill secondary" id="t-back">Zrušit rezervaci</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var lastTable = null, openId = null, selected = [];
  var hold = null;          // { vs, token, expiresAt, amount, seats, buyer } – právě podržená místa
  var finished = false;     // QR je vyřízený (zaplaceno / vypršelo) – tlačítko dole jen zavře okénko
  var timerId = null;

  function canSell() { return live && !!session; }

  function seatPositions(cap) {
    // obdélníkový stůl: polovina míst nahoře, polovina dole
    var half = Math.ceil(cap / 2), pos = [];
    for (var i = 0; i < cap; i++) {
      var top = i < half, k = top ? i : i - half, n = top ? half : cap - half;
      pos.push({ x: 50 + (140 / (n + 1)) * (k + 1), y: top ? 26 : 134 });
    }
    return pos;
  }

  function drawSeats() {
    var svg = document.getElementById("t-seats"), s = tableState(openId);
    selected = selected.filter(function (n) { return s.seats.indexOf(n) === -1; });
    if (!canSell()) selected = [];
    svg.innerHTML = "";
    var table = document.createElementNS(NS, "rect");
    table.setAttribute("x", 40); table.setAttribute("y", 52); table.setAttribute("width", 160); table.setAttribute("height", 56);
    table.setAttribute("rx", 8); table.setAttribute("class", "t-table");
    svg.appendChild(table);
    var label = document.createElementNS(NS, "text");
    label.setAttribute("x", 120); label.setAttribute("y", 85); label.setAttribute("class", "t-table-label");
    label.textContent = openId;
    svg.appendChild(label);

    seatPositions(s.cap).forEach(function (p, i) {
      var num = i + 1, isTaken = s.seats.indexOf(num) !== -1, isSel = selected.indexOf(num) !== -1;
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "t-seat " + (isTaken ? "taken" : isSel ? "sel" : "free") + (canSell() ? "" : " readonly"));
      g.style.animationDelay = (i * 50) + "ms";
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 16);
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", p.x); t.setAttribute("y", p.y + 4.5);
      t.textContent = num;
      g.appendChild(c); g.appendChild(t);
      if (!isTaken && canSell()) {
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", "Místo " + num);
        g.addEventListener("click", function () { toggleSeat(num); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter") toggleSeat(num); });
      }
      svg.appendChild(g);
    });
    updatePick();
  }

  function toggleSeat(num) {
    var i = selected.indexOf(num);
    if (i === -1) selected.push(num); else selected.splice(i, 1);
    selected.sort(function (a, b) { return a - b; });
    drawSeats();
  }

  function updatePick(errorText) {
    var s = tableState(openId), btn = document.getElementById("t-buy"), buyerBox = document.getElementById("t-buyer-box");
    set("t-free", !loaded ? s.cap + " míst u stolu" : s.free === 0 ? "Obsazeno" : "Volno " + s.free + " z " + s.cap + " míst");
    btn.hidden = true;
    buyerBox.hidden = true;
    if (!session) {
      set("t-note", s.free === 0 ? "Tento stůl je už celý obsazený." :
        "Vstupenky (" + PAY.price + " Kč) prodávají maturanti 4. F a 4. H – u nich si vybereš místa a zaplatíš QR kódem.");
      return;
    }
    if (!live) { set("t-note", "Rezervační systém teď neodpovídá – zkus to prosím za chvíli."); return; }
    if (s.free === 0) { set("t-note", errorText || "Tento stůl je už celý obsazený."); return; }
    btn.hidden = false;
    buyerBox.hidden = false;
    if (!selected.length) {
      set("t-note", errorText || "Klepni na volná (zlatá) místa, která kupující chce.");
      btn.disabled = true; btn.textContent = "Vyber místa";
    } else {
      set("t-note", errorText || "Vybráno: místo " + selected.join(", ") + " · " + selected.length * PAY.price + " Kč");
      btn.disabled = false; btn.textContent = "Vygenerovat QR kód (" + selected.length * PAY.price + " Kč)";
    }
  }

  /* „Vygenerovat QR kód“: podrží místa na 5 minut a ukáže QR kód s odpočtem. */
  document.getElementById("t-buy").addEventListener("click", function () {
    var buyerInput = document.getElementById("t-buyer"), buyer = buyerInput.value.trim();
    if (!buyer) { updatePick("Vyplň jméno kupujícího – kdo za místa odpovídá."); buyerInput.focus(); return; }
    var btn = document.getElementById("t-buy");
    btn.disabled = true; btn.textContent = "Rezervuji místa…";
    var seats = selected.slice();
    cashierApi({ action: "hold", table: openId, seats: seats.join(","), buyer: buyer }).then(function (res) {
      if (!res.ok) {
        if (res.tables) applyState(res.tables);
        selected = [];
        drawSeats();
        updatePick(res.error);
        return;
      }
      hold = { vs: res.vs, token: res.token, expiresAt: res.expiresAt, amount: res.amount, seats: seats, buyer: buyer };
      buyerInput.value = "";
      showPayment();
      refresh();
    });
  });

  function showPayment() {
    var message = "PLES 4FH STUL " + openId + " MISTA " + hold.seats.join(" ");
    var qr = qrcode(0, "M");
    qr.addData("SPD*1.0*ACC:" + PAY.iban + "*AM:" + hold.amount.toFixed(2) + "*CC:CZK*X-VS:" + hold.vs + "*MSG:" + message);
    qr.make();
    document.getElementById("t-qr").innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    set("t-amount", hold.amount + " Kč");
    var details = document.getElementById("t-details");
    details.innerHTML = "Kupující <b></b><br>Stůl <b>" + openId + "</b> · místa <b>" + hold.seats.join(", ") + "</b><br>" +
      "Účet <b>" + PAY.account + "</b> · VS <b>" + hold.vs + "</b>";
    details.querySelector("b").textContent = hold.buyer;
    set("t-paynote", "Místa jsou podržená. Kupující naskenuje QR kód v aplikaci banky a zaplatí. " +
                     "Až ti ukáže potvrzení platby, klikni na „Zaplaceno“.");
    finished = false;
    document.getElementById("t-paid").hidden = false;
    document.getElementById("t-paid").disabled = false;
    document.getElementById("t-back").textContent = "Zrušit rezervaci";
    document.getElementById("t-pick").hidden = true;
    document.getElementById("t-pay").hidden = false;
    startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    var el = document.getElementById("t-timer");
    function tick() {
      var left = Math.max(0, hold.expiresAt - Date.now());
      var m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
      el.textContent = "Rezervace platí ještě " + m + ":" + pad(s);
      el.classList.toggle("low", left < 60000);
      if (left === 0) {
        clearInterval(timerId);
        el.textContent = "Rezervace vypršela";
        set("t-paynote", "Čas vypršel a místa se uvolnila. Pokud kupující přesto zaplatil, " +
                         "klikni na „Zaplaceno“ – místa se zapíšou, pokud je mezitím nikdo jiný nezabral.");
        document.getElementById("t-qr").innerHTML = "";
        document.getElementById("t-back").textContent = "Zpět na plánek";
        finished = true;
        refresh();
      }
    }
    tick();
    timerId = setInterval(tick, 1000);
  }

  /* Zrušení: místa se hned uvolní. */
  function releaseHold() {
    clearInterval(timerId);
    if (!hold || finished) { hold = null; return Promise.resolve({ ok: true }); }
    var h = hold;
    hold = null;
    return cashierApi({ action: "release", vs: h.vs, token: h.token }).then(function (res) { refresh(); return res; });
  }

  document.getElementById("t-back").addEventListener("click", function () {
    if (finished) { closeTable(); return; }
    var btn = this;
    btn.disabled = true;
    set("t-paynote", "Ruším rezervaci…");
    releaseHold().then(function (res) {
      btn.disabled = false;
      if (!res.ok) { set("t-paynote", "Zrušení se nepovedlo: " + res.error); return; }
      selected = [];
      document.getElementById("t-pay").hidden = true;
      document.getElementById("t-pick").hidden = false;
      drawSeats();
      updatePick("Rezervace zrušená, místa jsou zase volná.");
    });
  });

  /* Pokladní potvrdí zaplacení → místa jsou prodaná natrvalo (banka to později ověří). */
  document.getElementById("t-paid").addEventListener("click", function () {
    if (!hold) return;
    var btn = this;
    btn.disabled = true;
    set("t-paynote", "Zapisuji platbu…");
    cashierApi({ action: "confirm", vs: hold.vs, token: hold.token }).then(function (res) {
      if (!res.ok) { btn.disabled = false; set("t-paynote", "Nepovedlo se: " + res.error); return; }
      clearInterval(timerId);
      hold = null;
      finished = true;
      set("t-timer", "✓ Zaplaceno");
      document.getElementById("t-timer").classList.remove("low");
      document.getElementById("t-qr").innerHTML = "";
      set("t-paynote", "Místa jsou prodaná a zapsaná v tabulce. Jakmile platba dorazí na účet, doplní se „Ověřeno bankou“.");
      btn.hidden = true;
      document.getElementById("t-back").textContent = "Zpět na plánek";
      refresh();
    });
  });

  function openTable(id, el) {
    planEl.querySelectorAll(".table.sel").forEach(function (x) { x.classList.remove("sel"); });
    el.classList.add("sel");
    lastTable = el; openId = id; selected = []; hold = null; finished = false;
    var s = tableState(id);
    set("t-hall", HALLS[id.split(" ")[0]] + " · stůl pro " + s.cap);
    set("t-title", "Stůl " + id);
    document.getElementById("t-pay").hidden = true;
    document.getElementById("t-pick").hidden = false;
    drawSeats();
    infoEl.textContent = "Stůl " + id + (loaded ? " · volno " + s.free + " z " + s.cap : "");

    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("open"); });
    modal.querySelector(".tclose").focus();
  }
  function closeTable() {
    if (hold && !finished && !confirm("Zavřít okénko a zrušit rezervaci těchto míst?")) return;
    releaseHold();
    openId = null;
    modal.classList.remove("open");
    setTimeout(function () { modal.hidden = true; }, 250);
    if (lastTable) lastTable.focus();
  }
  modal.addEventListener("click", function (e) { if (e.target === modal) closeTable(); });
  modal.querySelector(".tclose").addEventListener("click", closeTable);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!loginModal.hidden) closeLogin();
    else if (!modal.hidden) closeTable();
  });
  // když pokladní zavře stránku s otevřeným QR kódem, místa se uvolní nejpozději po 5 minutách (časovač ve skriptu)

  document.querySelectorAll(".floor-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".floor-tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      renderFloor(b.dataset.floor);
    });
  });
  renderCashierBar();
  renderFloor("ground");
  refresh();
  if (session) cashierApi({ action: "check" });     // ověří, že přihlášení ještě platí
  setInterval(function () { if (!hold) refresh(); }, 30000);

  /* --- ozubená kola --- */
  function gearPath(teeth, rOut, rIn) {
    var d = "", step = Math.PI * 2 / teeth;
    for (var i = 0; i < teeth; i++) {
      var a = i * step;
      [[rIn, a], [rOut, a + step * .15], [rOut, a + step * .45], [rIn, a + step * .6]].forEach(function (p, j) {
        var x = (Math.cos(p[1]) * p[0]).toFixed(2), y = (Math.sin(p[1]) * p[0]).toFixed(2);
        d += (i === 0 && j === 0 ? "M" : "L") + x + " " + y + " ";
      });
    }
    return d + "Z M 22 0 A 22 22 0 1 0 -22 0 A 22 22 0 1 0 22 0";
  }
  var gears = document.querySelectorAll(".gear");
  gears.forEach(function (g, i) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", gearPath([18, 12, 24][i] || 16, 96, 80));
    g.appendChild(p);
  });

  /* --- reakce na scrollování: kola a malé hodiny --- */
  var sc = document.querySelector(".scroll-clock");
  var ring = document.getElementById("sc-ring"), scHand = document.getElementById("sc-hand");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? y / max : 0;
    if (!reduce) gears.forEach(function (g) { g.style.transform = "rotate(" + (y * g.dataset.speed) + "deg)"; });
    ring.setAttribute("stroke-dashoffset", (138.2 * (1 - p)).toFixed(1));
    scHand.style.transform = "rotate(" + (p * 360) + "deg)";
    sc.classList.toggle("on", y > innerHeight * .6);
    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();

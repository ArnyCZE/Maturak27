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

  /* --- úvodní hodiny: ukazují aktuální čas; při načtení se k němu ručičky přetočí pozpátku (jako stroj času) --- */
  var hh = hero.querySelector(".hand-h"), hm = hero.querySelector(".hand-m"), hs = hero.querySelector(".hand-s");
  function nowAngles() {
    var d = new Date(), h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
    return { h: h * 30 + m * 0.5 + s / 120, m: m * 6 + s * 0.1, s: s * 6 };
  }
  var spinning = !reduce;
  function tickClock() {
    var a = nowAngles();
    rot(hs, a.s);
    if (!spinning) { rot(hh, a.h); rot(hm, a.m); }
  }
  if (!reduce) {
    var start = nowAngles();
    rot(hh, start.h + 720); rot(hm, start.m + 8640);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hh.classList.add("spin"); hm.classList.add("spin");
        rot(hh, start.h); rot(hm, start.m);
      });
    });
    setTimeout(function () { document.getElementById("flash").classList.add("go"); }, 3150);
    setTimeout(function () {
      hh.classList.remove("spin"); hm.classList.remove("spin");
      spinning = false;
      tickClock();
    }, 3400);
  }
  tickClock(); setInterval(tickClock, 1000);

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

  /* --- program: hodiny ukazují čas právě aktivního bodu programu --- */
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
  steps.forEach(function (s) {
    stepObs.observe(s);
    // klepnutí na bod programu ho rovnou ukáže na hodinách
    s.addEventListener("click", function () {
      steps.forEach(function (x) { x.classList.remove("active"); });
      s.classList.add("active");
      showTime(s.dataset.time, s.querySelector("h3").textContent);
    });
  });
  showTime(steps[0].dataset.time, steps[0].querySelector("h3").textContent);
  steps[0].classList.add("active");

  /* --- zasedací pořádek: veřejnost vidí obsazenost jednotlivých míst, nákupy a QR kódy jen přihlášené pokladní --- */
  var CFG = window.PLES_CONFIG;
  var API = CFG.api;
  var PAY = { iban: CFG.iban, account: CFG.account, price: CFG.price };
  var MAX_PER_PERSON = CFG.maxPerPerson || 10;
  var SHEET_CSV = "https://docs.google.com/spreadsheets/d/18tbTqbiRGQaAFtXcp2peYWdz93SIBP-x7r0L-sKOW_0/gviz/tq?tqx=out:csv&sheet=Web";
  var SEATS = window.IDEON_PLAN.seats;
  var HALLS = window.IDEON_PLAN.halls;
  var FLOORS = window.IDEON_PLAN.floors;
  var MOBILE_FLOORS = window.IDEON_PLAN.mobile || {};
  var STANDING = "Stání";   // řádek v tabulce pro vstupenky na stání (bez místa u stolu)
  var OFFLINE = "Rezervační systém teď neodpovídá – zkus to prosím za chvíli.";
  var mobileMQ = window.matchMedia("(max-width: 700px)");

  var taken = {};       // "VS 12" -> [čísla obsazených nebo právě držených židlí]
  var standing = { cap: 0, used: 0 };
  var loaded = false;   // máme aktuální obsazenost?
  var live = false;     // běží rezervační skript?
  var session = localStorage.getItem("ples-session") || "";
  var cashierName = localStorage.getItem("ples-name") || "";
  var currentFloor = "ground";
  var planEl = document.getElementById("plan");
  var infoEl = document.getElementById("table-info");

  var cart = {};            // rozpracovaný nákup pokladní: "VS 12" -> [1, 2], klidně u více stolů
  var cartStanding = 0;     // … a k tomu počet vstupenek na stání
  var quota = null;         // { name, has, left } – kolik vstupenek už kupující má / ještě smí koupit
  var hold = null;          // { vs, token, expiresAt, amount, items, standing, first, last } – právě podržený nákup
  var finished = false;     // QR je vyřízený (zaplaceno / vypršelo) – tlačítko dole jen zavře okénko
  var paidDone = false;     // pokladní už potvrdil(a) zaplacení
  var timerId = null;
  var lastTable = null, openId = null;

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
  function standingFree() { return Math.max(0, standing.cap - standing.used); }
  function ticketsWord(n) { return n === 1 ? "vstupenka" : n > 1 && n < 5 ? "vstupenky" : "vstupenek"; }

  /* Plánek. Přízemí se na mobilu otočí o 90° (podium nahoře), aby se vešlo celé bez posouvání do stran;
     když má patro v plan.js vlastní verzi na výšku (mobile), použije se ta. Stoly jsou nastojato / naležato jako na plánku. */
  function renderFloor(key) {
    currentFloor = key;
    var small = mobileMQ.matches, mob = small ? MOBILE_FLOORS[key] : null;
    var f = mob || FLOORS[key], turned = small && !mob;
    var frame = turned ? { w: f.h, h: f.w } : { w: f.w, h: f.h };
    function box(x, y, w, h) { return turned ? [f.h - y - h, x, h, w] : [x, y, w, h]; }
    planEl.innerHTML = "";
    planEl.classList.toggle("turned", small);
    planEl.classList.toggle("mobile", !!mob);
    planEl.style.aspectRatio = frame.w + " / " + frame.h;

    (f.rooms || []).forEach(function (r) { var b = box(r.x, r.y, r.w, r.h); add("room", "", b[0], b[1], b[2], b[3], frame); });
    (f.zones || []).forEach(function (z) {
      var b = box(z.x, z.y, z.w, z.h);
      add("zone " + (z.cls || ""), small && z.s !== undefined ? z.s : z.t, b[0], b[1], b[2], b[3], frame);
    });
    (f.names || []).forEach(function (n) {
      if (turned) add("hall-name", n.t, f.h - n.y - 2.4, n.x, 0, 0, frame);
      else add("hall-name", n.t, n.x, n.y, 0, 0, frame);
    });

    f.tables.forEach(function (t) {
      var id = t[0], s = tableState(id), o = t[3];
      var cx = turned ? f.h - t[2] : t[1], cy = turned ? t[1] : t[2];
      var tw = o === "v" ? f.vw : o === "h" ? f.hw : f.d * 1.15;
      var th = o === "v" ? f.vh : o === "h" ? f.hh : f.d * .7;
      if (turned && o) { var tmp = tw; tw = th; th = tmp; }
      var el = add("table" + (o === "v" ? " tall" : o === "h" ? " wide" : "") +
                   (!loaded ? " unknown" : s.free === 0 ? " full" : "") + (cart[id] && cart[id].length ? " incart" : ""),
                   "", cx, cy, tw, th, frame);
      el.style.setProperty("--p", Math.round(s.used / s.cap * 100));
      el.title = loaded ? id + " · volno " + s.free + " z " + s.cap : id;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.innerHTML = "<span>" + id.split(" ")[1] + "</span>";
      if (id === openId) el.classList.add("sel");
      el.addEventListener("click", function () { openTable(id, el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") openTable(id, el); });
    });
    renderList(key);
  }
  if (mobileMQ.addEventListener) mobileMQ.addEventListener("change", function () { renderFloor(currentFloor); });

  /* --- zobrazení „Seznam“: stoly jako dlaždice po sálech --- */
  var planWrap = document.querySelector(".plan-wrap"), swipeHint = document.querySelector(".swipe-hint");
  var listEl = document.createElement("div");
  listEl.className = "tlist";
  planWrap.insertAdjacentElement("afterend", listEl);
  var viewTabs = document.createElement("div");
  viewTabs.className = "view-tabs";
  viewTabs.setAttribute("role", "tablist");
  viewTabs.innerHTML = '<button role="tab" data-view="plan">Plánek</button><button role="tab" data-view="list">Seznam stolů</button>';
  document.querySelector(".floor-tabs").insertAdjacentElement("afterend", viewTabs);
  var viewMode = localStorage.getItem("ples-view2") || "plan";

  function applyView() {
    var list = viewMode === "list";
    planWrap.hidden = list;
    swipeHint.classList.toggle("off", list);
    listEl.hidden = !list;
    viewTabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.view === viewMode); });
  }
  viewTabs.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      viewMode = b.dataset.view;
      localStorage.setItem("ples-view2", viewMode);
      applyView();
    });
  });

  function renderList(key) {
    var f = FLOORS[key], groups = [], byHall = {};
    f.tables.forEach(function (t) {
      var hall = t[0].split(" ")[0];
      if (!byHall[hall]) { byHall[hall] = []; groups.push(hall); }
      byHall[hall].push(t[0]);
    });
    listEl.innerHTML = "";
    groups.forEach(function (hall) {
      var ids = byHall[hall].slice().sort(function (a, b) { return parseInt(a.split(" ")[1], 10) - parseInt(b.split(" ")[1], 10); });
      var free = 0, cap = 0;
      ids.forEach(function (id) { var s = tableState(id); free += s.free; cap += s.cap; });
      var sec = document.createElement("section");
      sec.className = "tlist-hall";
      var head = document.createElement("h4");
      head.innerHTML = HALLS[hall] + " <small>stoly po " + SEATS[hall] + (loaded ? " · volno " + free + " z " + cap : "") + "</small>";
      var grid = document.createElement("div");
      grid.className = "tlist-grid";
      ids.forEach(function (id) {
        var s = tableState(id), num = id.split(" ")[1];
        var b = document.createElement("button");
        b.className = "tchip" + (!loaded ? " unknown" : s.free === 0 ? " full" : "") + (cart[id] && cart[id].length ? " incart" : "") + (id === openId ? " sel" : "");
        b.style.setProperty("--p", Math.round(s.used / s.cap * 100));
        b.innerHTML = "<b>" + num + "</b><small>" + (!loaded ? s.cap + " míst" : s.free === 0 ? "plno" : s.free + "/" + s.cap) + "</small>";
        b.setAttribute("aria-label", "Stůl " + id + (loaded ? ", volno " + s.free + " z " + s.cap : ""));
        b.addEventListener("click", function () { openTable(id, b); });
        grid.appendChild(b);
      });
      sec.appendChild(head); sec.appendChild(grid);
      listEl.appendChild(sec);
    });
  }

  /* počítadlo vstupenek na stání vedle počtu volných míst u stolů */
  var standingStat = document.createElement("div");
  standingStat.className = "seat-total";
  standingStat.hidden = true;
  standingStat.innerHTML = '<div class="k">Vstupenky na stání</div>' +
    '<div class="v"><span id="sd-free">–</span> <small>z <span id="sd-total">–</span></small></div>' +
    '<div class="bar"><i id="sd-bar"></i></div>';
  document.querySelector(".seat-total").insertAdjacentElement("afterend", standingStat);

  function updateStats() {
    var total = 0, free = 0;
    Object.keys(FLOORS).forEach(function (k) {
      FLOORS[k].tables.forEach(function (t) { var s = tableState(t[0]); total += s.cap; free += s.free; });
    });
    set("st-free", free);
    set("st-total", total);
    document.getElementById("st-bar").style.width = (free / total * 100) + "%";
    standingStat.hidden = !standing.cap;
    if (standing.cap) {
      set("sd-free", standingFree());
      set("sd-total", standing.cap);
      document.getElementById("sd-bar").style.width = (standingFree() / standing.cap * 100) + "%";
    }
  }

  function applyState(tables) {
    taken = {};
    Object.keys(tables).forEach(function (id) { taken[id] = tables[id].seats || []; });
    var st = tables[STANDING];
    standing = st ? { cap: Number(st.cap) || 0, used: (st.seats || []).length } : { cap: 0, used: 0 };
    loaded = true;
    // místa, která mezitím prodal někdo jiný, z rozpracovaného nákupu vyřadíme
    var dropped = false;
    Object.keys(cart).forEach(function (id) {
      var before = cart[id].length, t = taken[id] || [];
      cart[id] = cart[id].filter(function (n) { return t.indexOf(n) === -1; });
      if (cart[id].length !== before) dropped = true;
      if (!cart[id].length) delete cart[id];
    });
    if (cartStanding > standingFree()) { cartStanding = standingFree(); dropped = true; }
    updateStats();
    renderFloor(currentFloor);
    if (openId) { drawSeats(); showTableInfo(openId); }
    renderCart(dropped ? "Některé vybrané vstupenky mezitím prodal někdo jiný – z nákupu jsem je odebral." : undefined);
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
            var id = r[0].trim(), count = parseInt(r[3], 10) || 0;
            var cap = id === STANDING ? parseInt(r[2], 10) || 0 : SEATS[id.split(" ")[0]] || 0;
            var seats = String(r[5] || "").split(",").map(function (x) { return parseInt(x, 10); }).filter(function (n) { return n > 0; });
            for (var s = 1; seats.length < Math.min(count, cap) && s <= cap; s++) if (seats.indexOf(s) === -1) seats.push(s);
            tables[id] = { cap: cap, seats: seats };
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

  function openModal(m) {
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add("open"); });
  }
  function hideModal(m) {
    m.classList.remove("open");
    setTimeout(function () { m.hidden = true; }, 250);
  }

  function openLogin() {
    document.getElementById("l-msg").textContent = "";
    openModal(loginModal);
    document.getElementById("l-login").focus();
  }
  function closeLogin() { hideModal(loginModal); }
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
        renderCart();
        closeLogin();
      });
  });

  function logout() {
    session = ""; cashierName = "";
    localStorage.removeItem("ples-session");
    localStorage.removeItem("ples-name");
    cart = {}; cartStanding = 0; quota = null;
    renderCashierBar();
    renderCart();
    renderFloor(currentFloor);
    if (openId) closeTable();
  }

  /* --- nákup pokladní: místa z libovolných stolů + vstupenky na stání, jméno a příjmení kupujícího, jeden QR kód --- */
  var cartEl = document.createElement("div");
  cartEl.className = "cart";
  cartEl.hidden = true;
  cartEl.innerHTML =
    '<div class="t-hall">Nákup</div>' +
    '<div class="c-names">' +
      '<div><label for="c-first">Jméno kupujícího</label><input id="c-first" autocomplete="off" placeholder="Jan"></div>' +
      '<div><label for="c-last">Příjmení kupujícího</label><input id="c-last" autocomplete="off" placeholder="Novák"></div>' +
    '</div>' +
    '<p class="c-quota" id="c-quota"></p>' +
    '<ul class="c-items" id="c-items"></ul>' +
    '<div class="c-standing">' +
      '<div><b>Vstupenky na stání</b><small id="c-sfree"></small></div>' +
      '<div class="c-stepper">' +
        '<button type="button" id="c-sminus" aria-label="Ubrat vstupenku na stání">−</button>' +
        '<input id="c-scount" type="number" min="0" value="0" inputmode="numeric" aria-label="Počet vstupenek na stání">' +
        '<button type="button" id="c-splus" aria-label="Přidat vstupenku na stání">+</button>' +
      '</div>' +
    '</div>' +
    '<div class="c-total" id="c-total"></div>' +
    '<p class="t-note" id="c-msg"></p>' +
    '<div class="c-actions">' +
      '<button class="pill" id="c-buy">Vygenerovat QR kód</button>' +
      '<button class="link-btn" id="c-clear">Vyprázdnit nákup</button>' +
    '</div>';
  cashierBar.insertAdjacentElement("afterend", cartEl);

  function cartItems() {
    var order = [];
    Object.keys(FLOORS).forEach(function (k) { FLOORS[k].tables.forEach(function (t) { order.push(t[0]); }); });
    return order.filter(function (id) { return cart[id] && cart[id].length; })
      .map(function (id) { return { table: id, seats: cart[id].slice().sort(function (a, b) { return a - b; }) }; });
  }
  function itemsCount(items) { return items.reduce(function (n, it) { return n + it.seats.length; }, 0); }
  function cartCount() { return itemsCount(cartItems()) + cartStanding; }

  /* Kolik vstupenek smí být v nákupu: 10 minus to, co už kupující má (zjistí se po napsání jména). */
  function cartLimit() { return quota ? quota.left : MAX_PER_PERSON; }
  function limitText(count) {
    var lim = cartLimit();
    if (quota && !lim) return "⚠️ " + quota.name + " už má " + quota.has + " " + ticketsWord(quota.has) + " – víc než " + MAX_PER_PERSON + " si koupit nemůže.";
    return "⚠️ " + (quota ? quota.name + " si může koupit už jen " + lim : "Jeden člověk si může koupit nejvýš " + lim) +
           " " + ticketsWord(lim) + " – uber z nákupu " + (count - lim) + ".";
  }
  function quotaText() {
    if (!quota) return "Napiš jméno a příjmení – ukážu, kolik vstupenek si ještě může koupit (nejvýš " + MAX_PER_PERSON + " na osobu).";
    if (!quota.has) return quota.name + " zatím nemá žádnou vstupenku – může koupit až " + MAX_PER_PERSON + ".";
    return quota.name + " už má " + quota.has + " " + ticketsWord(quota.has) + (quota.left ? " – může koupit ještě " + quota.left + "." : " – další už koupit nemůže.");
  }

  var quotaTimer = null, quotaSeq = 0;
  function checkQuota() {
    clearTimeout(quotaTimer);
    var first = document.getElementById("c-first").value.trim(), last = document.getElementById("c-last").value.trim();
    if (!first || !last) { quota = null; renderCart(); return; }
    quotaTimer = setTimeout(function () {
      var seq = ++quotaSeq, name = first + " " + last;
      set("c-quota", "Ověřuji, kolik vstupenek už má…");
      cashierApi({ action: "quota", firstName: first, lastName: last }).then(function (res) {
        if (seq !== quotaSeq) return;
        quota = res.ok ? { name: name, has: res.has, left: res.left } : null;
        renderCart();
      });
    }, 500);
  }
  document.getElementById("c-first").addEventListener("input", checkQuota);
  document.getElementById("c-last").addEventListener("input", checkQuota);

  function renderCart(msg) {
    cartEl.hidden = !session;
    if (!session) return;
    var items = cartItems(), count = itemsCount(items) + cartStanding, lim = cartLimit(), list = document.getElementById("c-items");
    var quotaEl = document.getElementById("c-quota");
    quotaEl.textContent = quotaText();
    quotaEl.classList.toggle("warn", !!quota && !quota.left);
    list.innerHTML = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "c-empty";
      empty.textContent = "Místa u stolů: zatím nic – klikni na stůl a vyber místa. Můžeš přidat místa u více stolů.";
      list.appendChild(empty);
    }
    items.forEach(function (it) {
      var li = document.createElement("li");
      li.innerHTML = "<span>Stůl <b>" + it.table + "</b> · místa " + it.seats.join(", ") + "</span>";
      var rm = document.createElement("button");
      rm.className = "link-btn"; rm.textContent = "odebrat";
      rm.setAttribute("aria-label", "Odebrat stůl " + it.table + " z nákupu");
      rm.addEventListener("click", function () { delete cart[it.table]; renderCart(""); renderFloor(currentFloor); });
      li.appendChild(rm);
      list.appendChild(li);
    });
    document.getElementById("c-scount").value = cartStanding;
    document.getElementById("c-sminus").disabled = cartStanding <= 0;
    document.getElementById("c-splus").disabled = !live || cartStanding >= standingFree() || count >= lim;
    set("c-sfree", loaded ? (standingFree() ? "zbývá " + standingFree() + " z " + standing.cap : "vyprodáno") : "");
    set("c-total", count ? count + " " + ticketsWord(count) + " · " + count * PAY.price + " Kč" : "");
    var over = count > lim;
    var btn = document.getElementById("c-buy");
    btn.disabled = !count || !live || over;
    btn.textContent = count ? "Vygenerovat QR kód (" + count * PAY.price + " Kč)" : "Vygenerovat QR kód";
    document.getElementById("c-clear").hidden = !count;
    var msgEl = document.getElementById("c-msg");
    msgEl.classList.toggle("warn", over);
    if (!live && loaded) msgEl.textContent = OFFLINE;
    else if (over) msgEl.textContent = limitText(count);
    else if (msg !== undefined) msgEl.textContent = msg;
    else if (msgEl.textContent === OFFLINE || msgEl.textContent.indexOf("⚠️") === 0) msgEl.textContent = "";
  }

  function setStanding(n) {
    var max = Math.min(standingFree(), Math.max(0, cartLimit() - itemsCount(cartItems())));
    n = Math.max(0, parseInt(n, 10) || 0);
    var capped = n > max;
    cartStanding = Math.min(n, max);
    renderCart(capped ? "Víc vstupenek na stání přidat nejde – " +
      (cartStanding >= standingFree() ? "víc jich nezbývá." : "jeden člověk může mít nejvýš " + MAX_PER_PERSON + " vstupenek.") : "");
  }
  document.getElementById("c-sminus").addEventListener("click", function () { setStanding(cartStanding - 1); });
  document.getElementById("c-splus").addEventListener("click", function () { setStanding(cartStanding + 1); });
  document.getElementById("c-scount").addEventListener("change", function () { setStanding(this.value); });

  document.getElementById("c-clear").addEventListener("click", function () {
    cart = {}; cartStanding = 0;
    renderCart("");
    renderFloor(currentFloor);
  });

  /* „Vygenerovat QR kód“: podrží všechny vstupenky nákupu na 5 minut a ukáže QR kód s odpočtem. */
  document.getElementById("c-buy").addEventListener("click", function () {
    var firstEl = document.getElementById("c-first"), lastEl = document.getElementById("c-last");
    var first = firstEl.value.trim(), last = lastEl.value.trim();
    if (!first) { set("c-msg", "Vyplň jméno kupujícího."); firstEl.focus(); return; }
    if (!last) { set("c-msg", "Vyplň příjmení kupujícího."); lastEl.focus(); return; }
    var items = cartItems(), stand = cartStanding;
    if (!items.length && !stand) return;
    var btn = this;
    btn.disabled = true; btn.textContent = "Rezervuji vstupenky…";
    set("c-msg", "");
    cashierApi({
      action: "hold",
      items: items.map(function (it) { return it.table + ":" + it.seats.join(","); }).join(";"),
      standing: stand,
      firstName: first, lastName: last
    }).then(function (res) {
      if (!res.ok) {
        if (res.limit) quota = { name: first + " " + last, has: res.has, left: res.left };
        if (res.tables) applyState(res.tables);
        renderCart(res.error);
        return;
      }
      hold = { vs: res.vs, token: res.token, expiresAt: res.expiresAt, amount: res.amount, items: items, standing: stand, first: first, last: last };
      cart = {}; cartStanding = 0; quota = null;
      firstEl.value = ""; lastEl.value = "";
      renderCart("");
      showPayment();
      refresh();
    });
  });

  /* --- okénko stolu: všichni vidí, která místa jsou volná; pokladní v něm navíc přidává místa do nákupu --- */
  var modal = document.createElement("div");
  modal.className = "tmodal";
  modal.hidden = true;
  modal.innerHTML =
    '<div class="tcard" role="dialog" aria-modal="true" aria-labelledby="t-title">' +
      '<button class="tclose" aria-label="Zavřít">×</button>' +
      '<div class="t-hall" id="t-hall"></div>' +
      '<h3 id="t-title"></h3>' +
      '<svg class="t-seats" id="t-seats" viewBox="0 0 240 160"></svg>' +
      '<div class="t-free" id="t-free"></div>' +
      '<div class="t-legend"><span><i class="free"></i>volné</span><span><i class="taken"></i>obsazené</span></div>' +
      '<p class="t-note" id="t-note"></p>' +
      '<button class="pill" id="t-done">Hotovo</button>' +
    '</div>';
  document.body.appendChild(modal);

  /* --- okénko s QR kódem nákupu a čísly papírových vstupenek --- */
  var payModal = document.createElement("div");
  payModal.className = "tmodal";
  payModal.hidden = true;
  payModal.innerHTML =
    '<div class="tcard" role="dialog" aria-modal="true" aria-labelledby="p-title">' +
      '<button class="tclose" aria-label="Zavřít">×</button>' +
      '<div class="t-hall">Platba QR kódem</div>' +
      '<h3 id="p-title">Nákup</h3>' +
      '<div class="t-timer" id="t-timer"></div>' +
      '<div class="t-qr" id="t-qr"></div>' +
      '<div class="t-free" id="t-amount"></div>' +
      '<p class="t-details" id="t-details"></p>' +
      '<div class="t-tickets" id="t-tickets"></div>' +
      '<p class="t-note" id="t-paynote"></p>' +
      '<button class="pill" id="t-paid">✓ Zaplaceno</button>' +
      '<button class="pill secondary" id="t-back">Zrušit nákup</button>' +
    '</div>';
  document.body.appendChild(payModal);

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

  function drawSeats(note) {
    var svg = document.getElementById("t-seats"), s = tableState(openId), mine = session ? (cart[openId] || []) : [];
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
      var num = i + 1, isTaken = s.seats.indexOf(num) !== -1, isSel = mine.indexOf(num) !== -1;
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

    set("t-free", !loaded ? s.cap + " míst u stolu" : s.free === 0 ? "Obsazeno" : "Volno " + s.free + " z " + s.cap + " míst");
    var noteEl = document.getElementById("t-note");
    noteEl.classList.toggle("warn", !!note);
    if (!session) {
      noteEl.textContent = !loaded ? "Aktuální obsazenost zatím nemáme načtenou." :
        s.free === 0 ? "Tento stůl je už celý obsazený." :
        "Volná místa: " + seatPositions(s.cap).map(function (p, i) { return i + 1; })
          .filter(function (n) { return s.seats.indexOf(n) === -1; }).join(", ") + ".";
      return;
    }
    var total = cartCount();
    if (note) noteEl.textContent = note;
    else if (!live) noteEl.textContent = OFFLINE;
    else if (s.free === 0) noteEl.textContent = "Tento stůl je už celý obsazený.";
    else noteEl.textContent = (mine.length ? "U tohoto stolu v nákupu: místo " + mine.slice().sort(function (a, b) { return a - b; }).join(", ") + ". "
                                           : "Klepni na volná (zlatá) místa – přidají se do nákupu. ") +
                              (total ? "V nákupu celkem " + total + " " + ticketsWord(total) + " · " + total * PAY.price + " Kč." : "");
  }

  function toggleSeat(num) {
    var mine = cart[openId] || [], i = mine.indexOf(num);
    if (i === -1 && cartCount() >= cartLimit()) {
      drawSeats(quota && !quota.left ? "⚠️ " + quota.name + " už má " + quota.has + " " + ticketsWord(quota.has) + " – další si koupit nemůže."
                                     : "⚠️ Víc vstupenek přidat nejde – " + (quota ? quota.name + " si může koupit nejvýš " + quota.left : "jeden člověk může mít nejvýš " + MAX_PER_PERSON) + ".");
      return;
    }
    cart[openId] = mine;
    if (i === -1) mine.push(num); else mine.splice(i, 1);
    if (!mine.length) delete cart[openId];
    drawSeats();
    renderCart("");
  }

  function showTableInfo(id) {
    var s = tableState(id);
    infoEl.textContent = "Stůl " + id + " · " + HALLS[id.split(" ")[0]] +
      (!loaded ? "" : s.free === 0 ? " · obsazeno" : " · volno " + s.free + " z " + s.cap + " míst");
  }

  function openTable(id, el) {
    document.querySelectorAll(".plan .table.sel, .tchip.sel").forEach(function (x) { x.classList.remove("sel"); });
    el.classList.add("sel");
    lastTable = el; openId = id;
    var s = tableState(id);
    set("t-hall", HALLS[id.split(" ")[0]] + " · stůl pro " + s.cap);
    set("t-title", "Stůl " + id);
    set("t-done", session ? "Hotovo" : "Zavřít");
    drawSeats();
    showTableInfo(id);
    openModal(modal);
    modal.querySelector(".tclose").focus();
  }
  function closeTable() {
    openId = null;
    hideModal(modal);
    renderFloor(currentFloor);
  }
  modal.addEventListener("click", function (e) { if (e.target === modal) closeTable(); });
  modal.querySelector(".tclose").addEventListener("click", closeTable);
  document.getElementById("t-done").addEventListener("click", closeTable);

  // text do zprávy pro příjemce v QR platbě: bez diakritiky a speciálních znaků
  var ACCENTS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
  function asciiText(s) {
    return s.normalize("NFD").replace(ACCENTS, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase();
  }

  /* Políčka pro čísla papírových vstupenek – jedno ke každé vstupence nákupu. */
  function buildTicketInputs() {
    var box = document.getElementById("t-tickets"), list = [];
    hold.items.forEach(function (it) {
      it.seats.forEach(function (s) { list.push({ table: it.table, label: "Stůl " + it.table + " · místo " + s }); });
    });
    for (var k = 1; k <= hold.standing; k++) list.push({ table: STANDING, label: "Stání · vstupenka " + k });
    box.innerHTML = '<div class="t-hall">Čísla papírových vstupenek</div>' +
      '<p class="t-tickets-hint">Ke každé vstupence zapiš číslo lístku, který kupujícímu dáváš.</p>';
    list.forEach(function (t, i) {
      var row = document.createElement("label");
      row.className = "t-ticket";
      var span = document.createElement("span");
      span.textContent = t.label;
      var input = document.createElement("input");
      input.type = "text"; input.inputMode = "numeric"; input.autocomplete = "off"; input.placeholder = "č. lístku";
      input.dataset.table = t.table;
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        var next = box.querySelectorAll("input")[i + 1];
        if (next) next.focus(); else document.getElementById("t-paid").focus();
      });
      row.appendChild(span); row.appendChild(input);
      box.appendChild(row);
    });
  }

  /* Přečte čísla vstupenek; vrátí text pro skript, nebo chybu. */
  function readTickets() {
    var inputs = document.querySelectorAll("#t-tickets input"), byTable = {}, order = [], seen = {};
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i], v = el.value.trim();
      el.classList.remove("bad");
      if (!/^\d{1,6}$/.test(v) || !parseInt(v, 10)) { el.classList.add("bad"); el.focus(); return { error: "Zapiš číslo papírové vstupenky ke každé vstupence (jen číslice)." }; }
      v = String(parseInt(v, 10));
      if (seen[v]) { el.classList.add("bad"); el.focus(); return { error: "Číslo vstupenky " + v + " je zapsané dvakrát." }; }
      seen[v] = 1;
      if (!byTable[el.dataset.table]) { byTable[el.dataset.table] = []; order.push(el.dataset.table); }
      byTable[el.dataset.table].push(v);
    }
    return { text: order.map(function (t) { return t + ":" + byTable[t].join(","); }).join(";") };
  }

  function showPayment() {
    var message = ("PLES 4FH " + asciiText(hold.first + " " + hold.last)).slice(0, 60);
    var qr = qrcode(0, "M");
    qr.addData("SPD*1.0*ACC:" + PAY.iban + "*AM:" + hold.amount.toFixed(2) + "*CC:CZK*X-VS:" + hold.vs + "*MSG:" + message);
    qr.make();
    document.getElementById("t-qr").innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    set("t-amount", hold.amount + " Kč");
    var lines = hold.items.map(function (it) { return "Stůl <b>" + it.table + "</b> · místa <b>" + it.seats.join(", ") + "</b>"; });
    if (hold.standing) lines.push("Na stání: <b>" + hold.standing + " " + ticketsWord(hold.standing) + "</b>");
    var details = document.getElementById("t-details");
    details.innerHTML = "Kupující <b></b><br>" + lines.join("<br>") +
      "<br>Účet <b>" + PAY.account + "</b> · VS <b>" + hold.vs + "</b>";
    details.querySelector("b").textContent = hold.first + " " + hold.last;
    buildTicketInputs();
    set("t-paynote", "Vstupenky jsou podržené. Kupující naskenuje QR kód v aplikaci banky a zaplatí. " +
                     "Až ti ukáže potvrzení platby, zapiš čísla papírových vstupenek a klikni na „Zaplaceno“.");
    finished = false; paidDone = false;
    document.getElementById("t-paid").hidden = false;
    document.getElementById("t-paid").disabled = false;
    document.getElementById("t-back").disabled = false;
    document.getElementById("t-back").textContent = "Zrušit nákup";
    openModal(payModal);
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
        set("t-paynote", "Čas vypršel a vstupenky se uvolnily. Pokud kupující přesto zaplatil, zapiš čísla vstupenek " +
                         "a klikni na „Zaplaceno“ – zapíšou se, pokud je mezitím nikdo jiný nekoupil.");
        document.getElementById("t-qr").innerHTML = "";
        document.getElementById("t-back").textContent = "Zpět na plánek";
        finished = true;
        refresh();
      }
    }
    tick();
    timerId = setInterval(tick, 1000);
  }

  function closePay() {
    if (hold && !finished && !confirm("Zavřít okénko a zrušit rezervaci těchto vstupenek?")) return;
    if (hold && !finished) releaseHold();
    hold = null;
    clearInterval(timerId);
    hideModal(payModal);
  }

  /* Zrušení: vstupenky se hned uvolní. */
  function releaseHold() {
    clearInterval(timerId);
    var h = hold;
    hold = null;
    return cashierApi({ action: "release", vs: h.vs, token: h.token }).then(function (res) { refresh(); return res; });
  }

  /* „Zrušit nákup“: vstupenky se uvolní, ale zůstanou vybrané v nákupu – pokladní je může upravit nebo nákup vyprázdnit. */
  document.getElementById("t-back").addEventListener("click", function () {
    if (finished || !hold) { closePay(); return; }
    var btn = this, h = hold;
    btn.disabled = true;
    set("t-paynote", "Ruším rezervaci…");
    releaseHold().then(function (res) {
      btn.disabled = false;
      if (!res.ok) { hold = h; startTimer(); set("t-paynote", "Zrušení se nepovedlo: " + res.error); return; }
      h.items.forEach(function (it) { cart[it.table] = it.seats.slice(); });
      cartStanding = h.standing;
      document.getElementById("c-first").value = h.first;
      document.getElementById("c-last").value = h.last;
      finished = true;
      hideModal(payModal);
      renderFloor(currentFloor);
      checkQuota();
      renderCart("Nákup zrušený, vstupenky jsou zase volné. Zůstaly tu vybrané – můžeš je upravit, nebo nákup vyprázdnit.");
      cartEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });

  /* Pokladní zapíše čísla papírových vstupenek a potvrdí zaplacení → prodáno natrvalo (banka to později ověří). */
  document.getElementById("t-paid").addEventListener("click", function () {
    if (!hold || paidDone) return;
    var tickets = readTickets();
    if (tickets.error) { set("t-paynote", tickets.error); return; }
    var btn = this;
    btn.disabled = true;
    set("t-paynote", "Zapisuji platbu…");
    cashierApi({ action: "confirm", vs: hold.vs, token: hold.token, tickets: tickets.text }).then(function (res) {
      if (!res.ok) { btn.disabled = false; set("t-paynote", "Nepovedlo se: " + res.error); return; }
      clearInterval(timerId);
      hold = null;
      finished = true; paidDone = true;
      set("t-timer", "✓ Zaplaceno");
      document.getElementById("t-timer").classList.remove("low");
      document.getElementById("t-qr").innerHTML = "";
      document.querySelectorAll("#t-tickets input").forEach(function (el) { el.disabled = true; });
      set("t-paynote", "Vstupenky jsou prodané a zapsané v tabulce i s čísly lístků. Jakmile platba dorazí na účet, doplní se „Ověřeno bankou“.");
      btn.hidden = true;
      document.getElementById("t-back").textContent = "Zpět na plánek";
      refresh();
    });
  });

  payModal.addEventListener("click", function (e) { if (e.target === payModal) closePay(); });
  payModal.querySelector(".tclose").addEventListener("click", closePay);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!loginModal.hidden) closeLogin();
    else if (!payModal.hidden) closePay();
    else if (!modal.hidden) closeTable();
  });
  // když pokladní zavře stránku s otevřeným QR kódem, vstupenky se uvolní nejpozději po 5 minutách (časovač ve skriptu)

  document.querySelectorAll(".floor-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".floor-tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      renderFloor(b.dataset.floor);
    });
  });
  applyView();
  renderCashierBar();
  renderCart();
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

  /* --- reakce na scrollování: kola, malé hodiny a šipka v úvodu --- */
  var sc = document.querySelector(".scroll-clock");
  var ring = document.getElementById("sc-ring"), scHand = document.getElementById("sc-hand");
  var arrow = document.querySelector(".scroll-hint");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? y / max : 0;
    if (!reduce) gears.forEach(function (g) { g.style.transform = "rotate(" + (y * g.dataset.speed) + "deg)"; });
    ring.setAttribute("stroke-dashoffset", (138.2 * (1 - p)).toFixed(1));
    scHand.style.transform = "rotate(" + (p * 360) + "deg)";
    sc.classList.toggle("on", y > innerHeight * .6);
    if (arrow) arrow.classList.toggle("gone", y > 60);
    ticking = false;
  }
  addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();

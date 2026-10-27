/* Prodejní stránka: vybere stůl a počet míst, přes skript v tabulce je na 5 minut podrží
   a ukáže QR kód pro platbu s vlastním variabilním symbolem. */
(function () {
  var PRICE = 450;   // jen pro zobrazení – skutečnou cenu počítá skript v tabulce
  var HALLS = { VS: "Velký sál", LS: "Levý sál", PS: "Pravý sál", G: "Galerie" };
  var cfg = { url: localStorage.getItem("ples-url") || "", pin: localStorage.getItem("ples-pin") || "" };
  var free = {};
  var current = null;     // aktuální objednávka
  var timerId = null, pollId = null;

  function $(id) { return document.getElementById(id); }
  function show(id, on) { $(id).hidden = !on; }
  function msg(id, text, kind) { var el = $(id); el.textContent = text || ""; el.className = "msg" + (kind ? " " + kind : ""); }

  function api(payload) {
    payload.pin = cfg.pin;
    // bez hlavičky Content-Type – jinak by prohlížeč blokoval požadavek na Google
    return fetch(cfg.url, { method: "POST", body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "Nepodařilo se spojit se skriptem. Zkontroluj internet a adresu v Nastavení." }; });
  }

  /* --- nastavení --- */
  function openSettings() {
    $("cfg-url").value = cfg.url; $("cfg-pin").value = cfg.pin;
    show("setup", true); show("order", false); show("payment", false);
  }
  $("open-settings").addEventListener("click", function (e) { e.preventDefault(); openSettings(); });
  $("cfg-save").addEventListener("click", function () {
    cfg.url = $("cfg-url").value.trim(); cfg.pin = $("cfg-pin").value.trim();
    localStorage.setItem("ples-url", cfg.url); localStorage.setItem("ples-pin", cfg.pin);
    msg("cfg-msg", "Ověřuji…");
    api({ action: "tables" }).then(function (res) {
      if (!res.ok) { msg("cfg-msg", res.error, "bad"); return; }
      msg("cfg-msg", "");
      show("setup", false);
      newOrder();
    });
  });

  /* --- výběr stolu --- */
  function loadTables() {
    return api({ action: "tables" }).then(function (res) {
      if (!res.ok) {
        if (res.error === "Špatný PIN.") { openSettings(); msg("cfg-msg", res.error, "bad"); }
        else msg("order-msg", res.error, "bad");
        return false;
      }
      free = res.tables;
      fillTables();
      return true;
    });
  }

  function fillTables() {
    var sel = $("table"), prev = sel.value;
    sel.innerHTML = "";
    Object.keys(HALLS).forEach(function (hall) {
      var group = document.createElement("optgroup");
      group.label = HALLS[hall];
      Object.keys(free)
        .filter(function (id) { return id.split(" ")[0] === hall; })
        .sort(function (a, b) { return parseInt(a.split(" ")[1], 10) - parseInt(b.split(" ")[1], 10); })
        .forEach(function (id) {
          var o = document.createElement("option");
          o.value = id;
          o.textContent = id + " – volno " + free[id];
          o.disabled = free[id] === 0;
          group.appendChild(o);
        });
      if (group.children.length) sel.appendChild(group);
    });
    if (prev && free[prev] > 0) sel.value = prev;
    if (sel.selectedOptions[0] && sel.selectedOptions[0].disabled) {
      var firstFree = sel.querySelector("option:not([disabled])");
      if (firstFree) sel.value = firstFree.value;
    }
    fillCounts();
  }

  function fillCounts() {
    var n = free[$("table").value] || 0, sel = $("count"), prev = parseInt(sel.value, 10) || 1;
    sel.innerHTML = "";
    for (var i = 1; i <= n; i++) {
      var o = document.createElement("option");
      o.value = i; o.textContent = i;
      sel.appendChild(o);
    }
    sel.value = Math.min(prev, n) || 1;
    updatePrice();
  }
  function updatePrice() { $("price").value = ((parseInt($("count").value, 10) || 0) * PRICE) + " Kč"; }
  $("table").addEventListener("change", fillCounts);
  $("count").addEventListener("change", updatePrice);

  /* --- podržení míst a QR platba --- */
  $("hold").addEventListener("click", function () {
    var btn = $("hold");
    btn.disabled = true;
    msg("order-msg", "Podržuji místa…");
    var order = { table: $("table").value, count: $("count").value, name: $("name").value, contact: $("contact").value };
    api({ action: "hold", table: order.table, count: order.count, name: order.name, contact: order.contact }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) { msg("order-msg", res.error, "bad"); loadTables(); return; }
      msg("order-msg", "");
      current = res; current.table = order.table; current.count = order.count;
      showPayment();
    });
  });

  function qrPayload(o) {
    // český standard QR Platba (SPD)
    return "SPD*1.0*ACC:" + o.iban + "*AM:" + Number(o.amount).toFixed(2) + "*CC:CZK*X-VS:" + o.vs + "*MSG:" + o.message;
  }

  function showPayment() {
    var qr = qrcode(0, "M");
    qr.addData(qrPayload(current));
    qr.make();
    $("qr").innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    $("pay-amount").textContent = current.amount + " Kč";
    $("pay-table").textContent = current.table;
    $("pay-count").textContent = current.count;
    $("pay-vs").textContent = current.vs;
    $("pay-account").textContent = current.account;
    $("timer-hint").textContent = "Místa jsou podržená. Po zaplacení potvrď rezervaci.";
    show("pay-state", false);
    show("confirm", true); show("cancel", true); show("next", false);
    show("timer", true);
    msg("pay-msg", "");
    show("order", false); show("payment", true);
    startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
    function tick() {
      var left = Math.max(0, current.expiresAt - Date.now());
      var m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
      $("timer").textContent = m + ":" + (s < 10 ? "0" : "") + s;
      $("timer").classList.toggle("low", left < 60000);
      if (left === 0) {
        clearInterval(timerId);
        $("timer-hint").textContent = "Čas vypršel – místa se uvolnila. Vytvoř nový QR kód.";
        show("confirm", false); show("cancel", false); show("next", true);
      }
    }
    tick();
    timerId = setInterval(tick, 1000);
  }

  $("confirm").addEventListener("click", function () {
    var btn = $("confirm");
    btn.disabled = true;
    api({ action: "confirm", vs: current.vs }).then(function (res) {
      btn.disabled = false;
      if (!res.ok) { msg("pay-msg", res.error, "bad"); return; }
      clearInterval(timerId);
      show("timer", false);
      $("timer-hint").textContent = "Rezervace potvrzená. Jakmile od Fio přijde platba, změní se stav na „zaplaceno“.";
      setState("rezervace");
      show("confirm", false); show("cancel", false); show("next", true);
      startPolling();
    });
  });

  $("cancel").addEventListener("click", function () {
    api({ action: "cancel", vs: current.vs }).then(function () { newOrder(); });
  });
  $("next").addEventListener("click", newOrder);

  function setState(state) {
    var el = $("pay-state");
    el.textContent = state === "zaplaceno" ? "✓ Zaplaceno" : "Rezervováno – čeká na platbu";
    el.classList.toggle("ok", state === "zaplaceno");
    show("pay-state", true);
  }

  function startPolling() {
    clearInterval(pollId);
    var vs = current.vs;
    pollId = setInterval(function () {
      if (!current || current.vs !== vs) return clearInterval(pollId);
      api({ action: "status", vs: vs }).then(function (res) {
        if (res.ok && res.status === "zaplaceno") { setState("zaplaceno"); clearInterval(pollId); }
      });
    }, 30000);
  }

  function newOrder() {
    clearInterval(timerId); clearInterval(pollId);
    current = null;
    $("name").value = ""; $("contact").value = "";
    show("payment", false); show("order", true);
    msg("order-msg", "Načítám volná místa…");
    loadTables().then(function (ok) { if (ok) msg("order-msg", ""); });
  }

  if (cfg.url && cfg.pin) newOrder(); else openSettings();
})();

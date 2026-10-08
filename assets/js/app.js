/* ═══════════════════════════════════════════════════════════════════════════
   ✏️  APP.JS: HOW THE SITE BEHAVES. Most of this you never need to touch.

   THE FEW THINGS WORTH CHANGING are marked ✏️ EDIT. Search for:
     [GRID]      row height and gap of the photo grid
     [ZOOM]      how far a photo zooms when clicked
     [REQUEST]   the subject line and messages of the "Request to use" form
     [ROUTES]    which page changes animate

   Words live in config.js · looks live in assets/css/site.css.
   Photos + their data come from data/color.json and data/bw.json, which your two
   private photo repos write automatically. NEVER edit those two files by hand.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ───────────────────────── settings from config.js ───────────────────────── */
  var CFG = window.SITE || {};
  var SIDES = ["color", "bw"];
  var SIDE_DEF = {
    color: { label: "Color", short: "Color", kicker: "Side A" },
    bw: { label: "Black & White", short: "B&W", kicker: "Side B" },
  };
  function sideCfg(k) { return Object.assign({}, SIDE_DEF[k], (CFG.sides || {})[k] || {}); }
  var fullName = CFG.fullName || CFG.firstName || "";
  var showPlace = CFG.showPlace !== false;
  var showCamera = CFG.showCameraData === true;
  var pageMs = +CFG.pageTransitionMs || 700;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var pad = function (n) { n = String(n); return n.length < 2 ? "0" + n : n; };
  /* Soria's straight apostrophe (') has a stray mark in the font file, so text shown in Soria
     always uses the curly one (’). Straight double quotes become curly ones too. */
  var smart = function (s) {
    return String(s == null ? "" : s).replace(/(\w)'(\w)/g, "$1’$2").replace(/'/g, "’")
      .replace(/(^|[\s(])"/g, "$1“").replace(/"/g, "”");
  };
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canMorph = !!document.startViewTransition && !reduceMotion;
  root.classList.toggle("no-vt", !canMorph);
  root.style.setProperty("--page-ms", pageMs + "ms");

  var DATA = { sides: {}, photos: [] };
  var BYID = {};
  var state = { view: null, side: null, cat: "all", list: [] };

  /* ───────────────────────── small helpers ───────────────────────── */
  function photoYear(p) { var m = /^(\d{4})/.exec(p.date || ""); return m ? +m[1] : new Date().getFullYear(); }
  function fmtF(e) { return e.aperture ? "f/" + (+e.aperture) : ""; }
  function fmtEV(v) { return v == null || Math.abs(v) < 0.05 ? "" : (v > 0 ? "+" : "−") + Math.abs(Math.round(v * 10) / 10) + " EV"; }
  function catOf(p) {
    var cats = (DATA.sides[p.side] || {}).categories || [];
    for (var i = 0; i < cats.length; i++) if (cats[i].slug === p.cat) return cats[i];
    return { slug: p.cat, title: p.cat };
  }
  function srcset(img) { return img.map(function (v) { return v.u + " " + v.w + "w"; }).join(", "); }
  function focus(p) { return Math.round((p.fx == null ? .5 : p.fx) * 100) + "% " + Math.round((p.fy == null ? .5 : p.fy) * 100) + "%"; }
  function photoUrl(p) { return location.origin + location.pathname + "#/photo/" + p.id; }
  function coverOf(side) {
    // your _cover image if there is one, otherwise the first photo of that side
    return DATA.sides[side].cover || ordered(DATA.photos.filter(function (p) { return p.side === side; }), "all")[0] || null;
  }


  /* The order of photos = the "visual flow" worked out from the pixels when you publish
     (scripts/pixels.py in your photo repos). Similar-looking photos end up next to each other. */
  function ordered(list, cat) {
    var key = cat === "all" ? "flow" : "cflow";
    return list.slice().sort(function (a, b) {
      var x = a[key], y = b[key];
      if (x == null || y == null) return (b.date || "").localeCompare(a.date || "");
      return x - y;
    });
  }

  /* ───────────────────────── words from config.js ───────────────────────── */
  function fillSiteText() {
    $$("[data-site]").forEach(function (el) {
      var key = el.getAttribute("data-site");
      var v = key === "fullName" ? fullName : CFG[key];
      if (v) el.textContent = smart(v);
    });
    SIDES.forEach(function (k) { $$('[data-side-short="' + k + '"]').forEach(function (el) { el.textContent = sideCfg(k).short; }); });
    var y = new Date().getFullYear();
    $$(".years").forEach(function (el) { el.textContent = CFG.firstYear && CFG.firstYear < y ? CFG.firstYear + "–" + y : String(y); });
    $("#about-lead").textContent = smart(CFG.about || "");
    var q = $("#quote");
    if (CFG.quote) q.textContent = "“" + smart(CFG.quote.replace(/^["“]|["”]$/g, "")) + "”"; else q.hidden = true;
    var line = $("#contact-line");
    line.textContent = CFG.contactLine || "";
    line.hidden = !CFG.contactLine;
  }

  /* ───────────────────────── switching pages ───────────────────────── */
  function setTone(view, side) {
    root.setAttribute("data-view", view);
    root.setAttribute("data-tone", view === "home" || (view === "gallery" && side === "bw") ? "dark" : "paper");
    $$(".nav a").forEach(function (a) {
      var k = a.getAttribute("data-nav");
      a.classList.toggle("on", (view === "gallery" && k === side) || k === view);
    });
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.content = root.getAttribute("data-tone") === "dark" ? "#0d0d0c" : "#f2efe8";
  }
  function showView(view) {
    var changed = state.view !== view;
    ["home", "gallery", "about"].forEach(function (v) { $("#view-" + v).hidden = v !== view; });
    if (changed) {
      window.scrollTo(0, 0);
      if (!canMorph) { var el = $("#view-" + view); el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); }
    }
    state.view = view;
    if (view !== "gallery") state.side = null;
    setTone(view, state.side);
    closeMenu();
    onScroll();
  }

  /* ── HOME: the two sides ── */
  function renderHome() {
    $("#split").innerHTML = SIDES.map(function (k, i) {
      var sc = sideCfg(k), s = DATA.sides[k];
      var sets = s.categories.filter(function (c) { return c.count; }).length;
      return '<a class="side side-' + (i ? "b" : "a") + '" href="#/' + k + '" aria-label="' + esc(sc.label) + '">' +
        '<div class="side-media" data-media="' + k + '" style="view-transition-name:vt-hero-' + k + '"></div>' +
        '<div class="side-label">' +
        '<div class="side-kick">' + esc(sc.kicker) + "</div>" +
        '<h2 class="side-title" style="view-transition-name:vt-title-' + k + '">' + esc(smart(sc.label)) + "</h2>" +
        '<div class="side-meta">' + pad(s.count || 0) + " frames" +
        (sets ? '<span class="bar">|</span>' + sets + (sets === 1 ? " set" : " sets") : "") +
        '<span class="go" aria-hidden="true">→</span></div>' +
        "</div></a>";
    }).join("");
    SIDES.forEach(function (k) { putCover($('[data-media="' + k + '"]'), coverOf(k), "(max-width: 760px) 100vw, 66vw", true); });
  }
  function putCover(box, pick, sizes, eager) {
    if (!pick) return;
    box.style.backgroundColor = pick.color || "";
    box.style.backgroundImage = "url(" + pick.lqip + ")";
    var img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    if (eager) img.setAttribute("fetchpriority", "high");
    img.sizes = sizes;
    img.srcset = srcset(pick.img);
    img.style.objectPosition = focus(pick);
    box.innerHTML = "";
    box.appendChild(img);
    var on = function () { img.classList.add("on"); };
    if (img.complete && img.naturalWidth) on(); else img.addEventListener("load", on, { once: true });
  }

  /* ── ONE SIDE ── */
  function showGallery(side, cat) {
    var s = DATA.sides[side];
    if (cat !== "all" && !s.categories.some(function (c) { return c.slug === cat; })) cat = "all";
    var same = state.view === "gallery" && state.side === side && state.cat === cat;
    var sideChanged = state.side !== side || state.view !== "gallery";
    state.side = side; state.cat = cat;
    showView("gallery");
    if (same) return;

    if (sideChanged) {
      window.scrollTo(0, 0);
      var sc = sideCfg(side);
      var media = $("#g-hero-media");
      media.style.viewTransitionName = "vt-hero-" + side;
      $("#g-h1").style.viewTransitionName = "vt-title-" + side;
      putHero(media, side);
      $("#g-kicker").innerHTML = esc(sc.kicker) + '<span class="bar">|</span><b>' + pad(s.count || 0) + "</b> frames";
      $("#g-h1").textContent = smart(sc.label);
      $(".flip").setAttribute("data-on", side);
      $$(".flip-opt").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-flip") === side); });
    }

    var cats = s.categories.filter(function (c) { return c.count > 0; });
    $("#g-tabs").innerHTML =
      '<a class="tab' + (cat === "all" ? " on" : "") + '" href="#/' + side + '">All<sup>' + pad(s.count || 0) + "</sup></a>" +
      cats.map(function (c) {
        return '<a class="tab' + (cat === c.slug ? " on" : "") + '" href="#/' + side + "/" + c.slug + '">' + esc(c.title) + "<sup>" + pad(c.count) + "</sup></a>";
      }).join("");
    $("#g-tabs").hidden = cats.length < 2;
    var current = cats.filter(function (c) { return c.slug === cat; })[0];
    $("#g-desc").hidden = !(current && current.description);
    $("#g-desc").textContent = current ? smart(current.description) : "";
    buildGrid();
  }

  /* The cover at the top of a side starts with the exact file the home page already loaded,
     so the opening animation is instantly sharp; then it quietly swaps to a bigger file. */
  var pendingDecode = null;
  function putHero(box, side) {
    var pick = coverOf(side);
    box.innerHTML = "";
    box.style.backgroundImage = "";
    if (!pick) return;
    box.style.backgroundColor = pick.color || "";
    box.style.backgroundImage = "url(" + pick.lqip + ")";
    var img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.style.objectPosition = focus(pick);
    var homeImg = $('[data-media="' + side + '"] img');
    var cached = homeImg && homeImg.complete && homeImg.currentSrc;
    if (cached) {
      img.src = cached;
      img.className = "on";
      img.style.transition = "none";
      pendingDecode = Promise.race([img.decode ? img.decode().catch(function () {}) : null, new Promise(function (r) { setTimeout(r, 600); })]);
      setTimeout(function () { img.style.transition = ""; img.sizes = "100vw"; img.srcset = srcset(pick.img); }, pageMs + 100);
    } else {
      img.sizes = "100vw";
      img.srcset = srcset(pick.img);
      img.addEventListener("load", function () { img.classList.add("on"); }, { once: true });
    }
    box.appendChild(img);
  }

  var grid, tiles = [], lastW = 0;
  function buildGrid() {
    var list = DATA.photos.filter(function (p) { return p.side === state.side && (state.cat === "all" || p.cat === state.cat); });
    state.list = ordered(list, state.cat);
    grid.innerHTML = "";
    tiles = [];
    $("#g-empty").hidden = state.list.length > 0;
    var frag = document.createDocumentFragment();
    state.list.forEach(function (p, i) {
      var a = document.createElement("a");
      a.className = "tile";
      a.href = "#/photo/" + p.id;
      a.setAttribute("data-id", p.id);
      a.setAttribute("aria-label", (showPlace && p.loc) || "Photograph");
      a.style.setProperty("--lq", "url(" + p.lqip + ")");
      a.style.backgroundColor = p.color || "";
      a.style.setProperty("--d", Math.min(i, 18) * 45 + "ms");
      var img = document.createElement("img");
      img.alt = "";
      img.loading = i < 8 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      img.sizes = "(max-width: 600px) 50vw, 25vw";
      img.srcset = srcset(p.img);
      img.addEventListener("load", function () { img.classList.add("ld"); }, { once: true });
      a.appendChild(img);
      if (showPlace && p.loc) a.insertAdjacentHTML("beforeend", '<span class="t-cap"><span>' + esc(p.loc) + "</span></span>");
      frag.appendChild(a);
      tiles.push(a);
    });
    grid.appendChild(frag);
    layout();
  }

  /* Rows of equal height with the best possible line breaks (the way TeX lays out a paragraph):
     every way of cutting the photos into rows is scored by cost = 100·ln²(row height ÷ ideal height)
     (+ a small penalty for a lone, non-panoramic photo), and the cheapest total wins. */
  function rowBreaks(ars, W, target, gap) {
    var n = ars.length, maxPerRow = W < 600 ? 3 : 8;
    var cost = [0], prev = [-1];
    for (var i = 1; i <= n; i++) { cost[i] = Infinity; prev[i] = -1; }
    for (var i0 = 0; i0 < n; i0++) {
      if (cost[i0] === Infinity) continue;
      var sum = 0;
      for (var k = i0; k < n && k - i0 < maxPerRow; k++) {
        sum += ars[k];
        var cnt = k - i0 + 1, h = (W - gap * (cnt - 1)) / sum, last = k === n - 1, c;
        if (cnt > 1 && h < target * 0.45) break;
        if (last && h >= target) c = 0;                          // the last row may stay short
        else {
          c = 100 * Math.pow(Math.log(h / target), 2);
          if (cnt === 1 && ars[k] < 1.6) c += 30;
        }
        if (cost[i0] + c < cost[k + 1]) { cost[k + 1] = cost[i0] + c; prev[k + 1] = i0; }
      }
    }
    var rows = [], j = n;
    while (j > 0) { var s = prev[j]; if (s < 0) s = j - 1; rows.unshift([s, j]); j = s; }
    return rows;
  }
  function layout() {
    var W = grid.clientWidth;
    if (!W) { lastW = 0; return; }
    lastW = W;
    if (!tiles.length) { grid.style.height = "0px"; return; }

    /* ✏️ EDIT [GRID] ▸ gap = space between photos (px) on phones / tablets / computers.
       ✏️ EDIT [GRID] ▸ target = the ideal row height (px). Bigger number = bigger photos, fewer per row. */
    var gap = W < 600 ? 4 : W < 1000 ? 6 : 8;
    var target = W < 600 ? 170 : W < 1000 ? 240 : Math.min(380, Math.max(270, W / 4.4));

    var ars = state.list.map(function (p) { return Math.max(0.3, Math.min(5, p.w / p.h)); });
    var y = 0;
    rowBreaks(ars, W, target, gap).forEach(function (r) {
      var sum = 0, cnt = r[1] - r[0];
      for (var i = r[0]; i < r[1]; i++) sum += ars[i];
      var h = (W - gap * (cnt - 1)) / sum, full = true;
      if (r[1] === tiles.length && h > target) { h = target; full = false; }
      var x = 0;
      for (var k = r[0]; k < r[1]; k++) {
        var w = ars[k] * h;
        if (full && k === r[1] - 1) w = W - x;
        var t = tiles[k];
        t.style.left = Math.round(x) + "px";
        t.style.top = Math.round(y) + "px";
        t.style.width = Math.round(w) + "px";
        t.style.height = Math.round(h) + "px";
        t.firstChild.sizes = Math.ceil(w) + "px";
        x += w + gap;
      }
      y += h + gap;
    });
    grid.style.height = Math.round(y - gap) + "px";
  }

  /* ── ABOUT: your Color cover beside the text on wide screens ── */
  function renderAboutPhoto() {
    var pick = coverOf("color") || coverOf("bw"), fig = $("#about-photo");
    if (!pick) { fig.hidden = true; return; }
    fig.style.backgroundImage = "url(" + pick.lqip + ")";
    fig.innerHTML = '<img alt="" draggable="false" loading="lazy" sizes="34vw" srcset="' + srcset(pick.img) + '" style="object-position:' + focus(pick) + '">';
  }

  /* ───────────────────────── the photo viewer ───────────────────────── */
  /* ✏️ EDIT [ZOOM] ▸ How far a photo zooms on click / Z key (2.5 = 2.5×). Maximum zoom is ZOOM_MAX. */
  var ZOOM = 2.5, ZOOM_MAX = 6;

  var LB = { list: [], idx: -1, cameFromGrid: false, backOK: false, s: 1, tx: 0, ty: 0, token: 0, closeTimer: 0 };

  function openViewer(p) {
    LB.list = state.list.indexOf(p) >= 0 ? state.list : ordered(DATA.photos.filter(function (q) { return q.side === p.side; }), "all");
    LB.backOK = LB.cameFromGrid; LB.cameFromGrid = false;
    clearTimeout(LB.closeTimer);
    LB.el.classList.remove("closing");
    if (LB.el.hidden) {
      LB.el.hidden = false;
      root.classList.add("lb-open");
      setTimeout(function () { LB.el.focus({ preventScroll: true }); }, 30);
    }
    show(LB.list.indexOf(p));
  }

  function show(idx) {
    if (idx < 0 || idx >= LB.list.length) return;
    LB.idx = idx;
    var p = LB.list[idx], img = LB.img, token = ++LB.token;
    resetZoom(true);
    img.classList.add("swap");
    var fresh = new Image();
    fresh.sizes = stageSizes(1);
    fresh.srcset = srcset(p.img);
    var apply = function () {
      if (token !== LB.token) return;
      img.sizes = stageSizes(1);
      img.srcset = srcset(p.img);
      img.alt = (showPlace && p.loc) || "Photograph";
      requestAnimationFrame(function () { img.classList.remove("swap"); });
    };
    if (fresh.decode) fresh.decode().then(apply, apply); else apply();

    $("#lb-no").textContent = pad(idx + 1);
    $("#lb-total").textContent = pad(LB.list.length);
    $("#lb-where").textContent = sideCfg(p.side).label + " · " + catOf(p).title;
    $("#lb-place").textContent = showPlace ? (p.loc || "") : "";
    $("#lb-copy").textContent = "© " + photoYear(p) + " " + fullName + ". All rights reserved.";
    $("#lb-req").hidden = CFG.showRequestButton === false;

    // camera readout: only when config.js → showCameraData is true, and only the values the photo has
    var cam = $("#lb-cam"), e = p.exif || {};
    var cells = showCamera ? [[e.shutter, "Shutter"], [fmtF(e), "Aperture"], [e.iso ? String(e.iso) : "", "ISO"],
      [e.focal ? Math.round(e.focal) + "mm" : "", "Focal"], [fmtEV(e.ev), "Exp. comp"]].filter(function (c) { return c[0]; }) : [];
    cam.innerHTML = cells.map(function (c) { return "<span><b>" + esc(c[0]) + "</b>" + c[1] + "</span>"; }).join("");
    cam.hidden = !cells.length;

    [idx + 1, idx - 1].forEach(function (j) {
      var q = LB.list[(j + LB.list.length) % LB.list.length];
      if (q && q !== p) { var im = new Image(); im.sizes = stageSizes(1); im.srcset = srcset(q.img); }
    });
  }
  function stageSizes(scale) { return Math.ceil(Math.min((LB.stage ? LB.stage.clientWidth : innerWidth) * scale, 4000)) + "px"; }

  function closeViewer(fromRoute) {
    if (LB.el.hidden || LB.el.classList.contains("closing")) return;
    LB.el.classList.add("closing");                       // fade out smoothly, then hide
    clearTimeout(LB.closeTimer);
    LB.closeTimer = setTimeout(function () {
      LB.el.hidden = true;
      LB.el.classList.remove("closing");
      root.classList.remove("lb-open");
      resetZoom(true);
    }, reduceMotion ? 0 : 360);
    if (!fromRoute) {
      if (LB.backOK) history.back();
      else location.replace("#/" + (state.side || "") + (state.side && state.cat !== "all" ? "/" + state.cat : ""));
    }
    var tile = grid.querySelector('[data-id="' + (LB.list[LB.idx] || {}).id + '"]');
    if (tile) tile.focus({ preventScroll: true });
  }
  function step(d) {
    if (!LB.list.length) return;
    var n = (LB.idx + d + LB.list.length) % LB.list.length;
    show(n);
    history.replaceState(null, "", "#/photo/" + LB.list[n].id);
  }

  /* zoom & pan */
  function dispRect() {
    var p = LB.list[LB.idx]; if (!p) return { w: 0, h: 0 };
    var bw = LB.img.clientWidth, bh = LB.img.clientHeight, ar = p.w / p.h;
    return bw / bh > ar ? { w: bh * ar, h: bh } : { w: bw, h: bw / ar };
  }
  function applyZoom() {
    if (LB.s <= 1.001) { LB.s = 1; LB.tx = 0; LB.ty = 0; }
    var r = dispRect(), sw = LB.stage.clientWidth, sh = LB.stage.clientHeight;
    var mx = Math.max(0, (r.w * LB.s - sw) / 2 + 24), my = Math.max(0, (r.h * LB.s - sh) / 2 + 24);
    LB.tx = Math.max(-mx, Math.min(mx, LB.tx));
    LB.ty = Math.max(-my, Math.min(my, LB.ty));
    LB.img.style.transform = LB.s === 1 ? "" : "translate3d(" + LB.tx + "px," + LB.ty + "px,0) scale(" + LB.s + ")";
    LB.stage.classList.toggle("zoomed", LB.s > 1);
    $("#lb-zoomtag").textContent = LB.s.toFixed(1) + "×";
    if (LB.s > 1) {
      var want = stageSizes(LB.s);
      if (parseInt(want, 10) > parseInt(LB.img.sizes, 10)) LB.img.sizes = want;   // loads the sharper file
    }
  }
  function resetZoom(instant) {
    LB.s = 1; LB.tx = 0; LB.ty = 0;
    if (!LB.img) return;
    if (instant) { LB.img.style.transition = "none"; applyZoom(); void LB.img.offsetWidth; LB.img.style.transition = ""; }
    else applyZoom();
  }
  function zoomAt(newS, cx, cy) {
    newS = Math.max(1, Math.min(ZOOM_MAX, newS));
    var r = LB.stage.getBoundingClientRect();
    var ox = r.left + LB.img.offsetLeft + LB.img.clientWidth / 2, oy = r.top + LB.img.offsetTop + LB.img.clientHeight / 2;
    var px = (cx == null ? ox : cx) - ox, py = (cy == null ? oy : cy) - oy;
    LB.tx = px - ((px - LB.tx) * newS) / LB.s;
    LB.ty = py - ((py - LB.ty) * newS) / LB.s;
    LB.s = newS;
    applyZoom();
  }
  /* Z key / zoom button: zoom into the photo's subject (found from its pixels when you published) */
  function zoomToFocus() {
    var p = LB.list[LB.idx]; if (!p) return;
    var r = LB.stage.getBoundingClientRect(), d = dispRect();
    zoomAt(ZOOM,
      r.left + LB.img.offsetLeft + LB.img.clientWidth / 2 + ((p.fx == null ? .5 : p.fx) - .5) * d.w,
      r.top + LB.img.offsetTop + LB.img.clientHeight / 2 + ((p.fy == null ? .5 : p.fy) - .5) * d.h);
  }
  function toggleZoom() { if (LB.s > 1) resetZoom(); else zoomToFocus(); }

  function setupViewer() {
    LB.el = $("#lb"); LB.img = $("#lb-img"); LB.stage = $("#lb-stage");
    LB.el.addEventListener("click", function (ev) {
      var a = ev.target.closest("[data-act]");
      if (!a) return;
      var act = a.getAttribute("data-act");
      if (act === "close") closeViewer();
      else if (act === "next") step(1);
      else if (act === "prev") step(-1);
      else if (act === "zoom") toggleZoom();
      else if (act === "share") share();
    });
    LB.stage.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      if (ev.ctrlKey || Math.abs(ev.deltaY) >= Math.abs(ev.deltaX)) zoomAt(LB.s * Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0022)), ev.clientX, ev.clientY);
      else if (LB.s > 1) { LB.tx -= ev.deltaX; applyZoom(); }
    }, { passive: false });

    var pts = {}, start = null, pinch = null, moved = false, lastTap = 0, pressTimer = null;
    LB.stage.addEventListener("pointerdown", function (ev) {
      if (ev.target.closest("button")) return;
      LB.stage.setPointerCapture(ev.pointerId);
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        start = { x: ev.clientX, y: ev.clientY, tx: LB.tx, ty: LB.ty, t: Date.now() };
        moved = false;
        if (ev.pointerType === "touch") { clearTimeout(pressTimer); pressTimer = setTimeout(function () { if (!moved) protectNotice(); }, 650); }
      } else if (ids.length === 2) {
        clearTimeout(pressTimer);
        var a = pts[ids[0]], b = pts[ids[1]];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: LB.s };
        LB.stage.classList.add("pinching");
      }
    });
    LB.stage.addEventListener("pointermove", function (ev) {
      if (!pts[ev.pointerId]) return;
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(pts);
      if (pinch && ids.length >= 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        zoomAt(pinch.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
        moved = true;
        return;
      }
      if (!start) return;
      var dx = ev.clientX - start.x, dy = ev.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) { moved = true; clearTimeout(pressTimer); }
      if (LB.s > 1) { LB.stage.classList.add("dragging"); LB.tx = start.tx + dx; LB.ty = start.ty + dy; applyZoom(); }
      else if (ev.pointerType !== "mouse") {
        LB.img.style.transition = "none";
        LB.img.style.transform = "translate3d(" + dx * 0.9 + "px," + Math.max(0, dy) * 0.6 + "px,0)";
      }
    });
    function end(ev) {
      if (!pts[ev.pointerId]) return;
      delete pts[ev.pointerId];
      clearTimeout(pressTimer);
      LB.stage.classList.remove("dragging");
      if (pinch) { if (Object.keys(pts).length < 2) { pinch = null; LB.stage.classList.remove("pinching"); start = null; } return; }
      if (!start) return;
      var dx = ev.clientX - start.x, dy = ev.clientY - start.y, quick = Date.now() - start.t < 600;
      LB.img.style.transition = "";
      if (LB.s === 1 && ev.pointerType !== "mouse" && moved) {
        LB.img.style.transform = "";
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        else if (dy > 110 && Math.abs(dy) > Math.abs(dx)) closeViewer();
      } else if (!moved && ev.type === "pointerup") {
        var now = Date.now();
        if (ev.pointerType === "mouse") { if (LB.s > 1) resetZoom(); else zoomAt(ZOOM, ev.clientX, ev.clientY); }
        else if (now - lastTap < 320) { if (LB.s > 1) resetZoom(); else zoomAt(ZOOM, ev.clientX, ev.clientY); lastTap = 0; }
        else lastTap = now;
      } else if (quick && LB.s === 1 && Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      start = null;
    }
    LB.stage.addEventListener("pointerup", end);
    LB.stage.addEventListener("pointercancel", end);

    addEventListener("keydown", function (ev) {
      if (LB.el.hidden) return;
      var k = ev.key;
      if (!REQ.el.hidden) return;                 // the request form is open on top: it handles keys itself
      if (k === "Escape") closeViewer();
      else if (k === "ArrowRight") step(1);
      else if (k === "ArrowLeft") step(-1);
      else if (k === "z" || k === "Z") toggleZoom();
      else if (k === "+" || k === "=") zoomAt(LB.s * 1.4);
      else if (k === "-" || k === "_") zoomAt(LB.s / 1.4);
      else return;
      ev.preventDefault();
    });
    addEventListener("resize", function () { if (!LB.el.hidden) { LB.img.sizes = stageSizes(Math.max(1, LB.s)); applyZoom(); } });
  }
  function share() {
    var p = LB.list[LB.idx]; if (!p) return;
    var url = photoUrl(p);
    var fallback = function () { toast('Copy this link: <span class="selectable">' + esc(url) + "</span>", 6000); };
    if (navigator.share && innerWidth <= 760) navigator.share({ url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Link copied."); }, fallback);
    else fallback();
  }

  /* ───────────────────────── light protection ───────────────────────── */
  function protectNotice() { toast('© These photos are copyrighted. To use one, <a href="#" data-request>please ask first</a>.', 4800); }
  function setupProtection() {
    if (CFG.blockRightClick === false) return;
    var onPhoto = function (t) { return t.closest && (t.closest(".tile") || t.closest("#lb-stage") || t.closest(".side-media") || t.closest(".g-hero-media") || t.closest(".about-photo")); };
    document.addEventListener("contextmenu", function (ev) { if (onPhoto(ev.target)) { ev.preventDefault(); protectNotice(); } });
    document.addEventListener("dragstart", function (ev) { if (onPhoto(ev.target) || ev.target.tagName === "IMG") ev.preventDefault(); });
    addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && (ev.key || "").toLowerCase() === "s") { ev.preventDefault(); protectNotice(); }
    });
  }
  /* ───────────────────────── [REQUEST] the "Request to use" form ─────────────────────────
     Sends the form to Web3Forms (free), which emails it to you. Your address never appears on the site.
     The key in config.js (formKey) is what tells Web3Forms whose inbox to deliver to. */
  var REQ = { el: null, photo: null, closeTimer: 0, lastFocus: null };

  function openRequest(p) {
    REQ.photo = p || null;
    REQ.lastFocus = document.activeElement;
    clearTimeout(REQ.closeTimer);
    REQ.el.classList.remove("closing");
    var box = $("#req-photo"), which = $("#req-which"), whichLabel = $("#req-which-label");
    if (p) {
      // opened from a photo: show it, and send its link automatically
      box.innerHTML = '<img alt="" draggable="false" src="' + esc(p.img[0].u) + '"><span>' + esc((showPlace && p.loc) || sideCfg(p.side).label + " · " + catOf(p).title) + "</span>";
      box.hidden = false;
      which.hidden = whichLabel.hidden = true;
      which.value = photoUrl(p);
    } else {
      box.hidden = true;
      which.hidden = whichLabel.hidden = false;
      which.value = "";
    }
    setStatus("", "");
    REQ.el.hidden = false;
    root.classList.add("req-open");
    setTimeout(function () { $("#req-name").focus({ preventScroll: true }); }, 60);
  }
  function closeRequest() {
    if (REQ.el.hidden || REQ.el.classList.contains("closing")) return;
    REQ.el.classList.add("closing");
    REQ.closeTimer = setTimeout(function () {
      REQ.el.hidden = true;
      REQ.el.classList.remove("closing");
      root.classList.remove("req-open");
      if (REQ.lastFocus && REQ.lastFocus.focus) REQ.lastFocus.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 320);
  }
  function setStatus(text, kind) {
    var st = $("#req-status");
    st.textContent = text;
    st.className = "req-status" + (kind ? " " + kind : "");
  }
  function sendRequest(ev) {
    ev.preventDefault();
    var form = $("#req-form"), btn = $(".req-send");
    var name = $("#req-name").value.trim(), email = $("#req-email").value.trim(), msg = $("#req-msg").value.trim();
    /* ✏️ EDIT [REQUEST] ▸ The messages people see after pressing "Send request". */
    var T = {
      missing: "Please fill in your name, a valid email and what it's for.",
      sending: "Sending…",
      sent: "Thank you! Your request was sent. I'll get back to you by email.",
      failed: "Sorry, that didn't send. Please try again in a minute.",
      notReady: "This form isn't connected yet. (Site owner: add your Web3Forms key in config.js → formKey.)",
    };
    if (!name || !msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus(T.missing, "err"); return; }
    if (!CFG.formKey) { setStatus(T.notReady, "err"); return; }
    if (form.botcheck.checked) { setStatus(T.sent, "ok"); return; }   // a spam bot ticked the hidden box: pretend, send nothing
    var p = REQ.photo;
    /* ✏️ EDIT [REQUEST] ▸ The subject line of the email you receive. */
    var subject = "Photo request" + (p ? ": " + ((p.loc || "") + " (" + p.id + ")").trim() : "") + " from " + name;
    btn.disabled = true;
    setStatus(T.sending, "");
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: CFG.formKey,
        subject: subject,
        from_name: (CFG.monogram || "Photo") + " website",
        name: name,
        email: email,
        photo: $("#req-which").value.trim() || "(not given)",
        message: msg,
        botcheck: false,
      }),
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && j.success !== false; }); })
      .then(function (ok) {
        if (ok) { setStatus(T.sent, "ok"); form.reset(); setTimeout(closeRequest, 2600); }
        else setStatus(T.failed, "err");
      })
      .catch(function () { setStatus(T.failed, "err"); })
      .then(function () { btn.disabled = false; });
  }
  function setupRequest() {
    REQ.el = $("#req");
    document.addEventListener("click", function (ev) {
      var opener = ev.target.closest("[data-request]");
      if (opener) {
        ev.preventDefault();
        openRequest(opener.id === "lb-req" && !LB.el.hidden ? LB.list[LB.idx] : null);
        return;
      }
      if (!REQ.el.hidden && (ev.target === REQ.el || ev.target.closest("[data-req-close]"))) closeRequest();
    });
    $("#req-form").addEventListener("submit", sendRequest);
    addEventListener("keydown", function (ev) {
      if (!REQ.el.hidden && ev.key === "Escape") { ev.preventDefault(); closeRequest(); }
    });
  }

  var toastTimer;
  function toast(html, ms) {
    var t = $("#toast");
    t.innerHTML = html;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, ms || 3200);
  }

  /* ───────────────────────── [ROUTES] which page to show ───────────────────────── */
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/");
    var a = h[0] || "", b = h[1] || "";
    if (a === "photo" && BYID[b]) {
      var p = BYID[b];
      if (!(state.view === "gallery" && state.side === p.side && (state.cat === "all" || state.cat === p.cat))) showGallery(p.side, "all");
      openViewer(p);
      return;
    }
    if (!LB.el.hidden) closeViewer(true);
    if (SIDES.indexOf(a) >= 0) showGallery(a, b || "all");
    else if (a === "about" || a === "licensing") {
      showView("about");
      if (b === "licensing" || a === "licensing") setTimeout(function () { $("#licensing").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }, pageMs * 0.6);
    } else showView("home");
  }

  /* ✏️ EDIT [ROUTES] ▸ Page changes animate with the "morph" (the side's photo grows into the cover).
     Opening/closing a single photo uses its own fade instead. To turn the morph OFF everywhere,
     change "canMorph &&" below to "false &&". */
  var lastHash = location.hash;
  function onHashChange() {
    var from = lastHash, to = location.hash;
    lastHash = to;
    var photoInvolved = /^#\/photo\//.test(from) || /^#\/photo\//.test(to);
    if (canMorph && !photoInvolved) {
      document.startViewTransition(function () { route(); var w = pendingDecode; pendingDecode = null; return w; });
    } else { route(); pendingDecode = null; }
  }

  function closeMenu() { root.classList.remove("menu-open"); $("#menu-btn").setAttribute("aria-expanded", "false"); }
  function onScroll() {
    root.classList.toggle("scrolled", scrollY > 8);
    var hero = state.view === "gallery" ? $(".g-hero") : null;
    var headH = parseInt(getComputedStyle(root).getPropertyValue("--head-h"), 10) || 64;
    root.classList.toggle("past-hero", !!hero && scrollY > hero.offsetHeight - headH);
  }

  /* ───────────────────────── start-up ───────────────────────── */
  function load(side) {
    return fetch("data/" + side + ".json").then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function boot() {
    grid = $("#grid");
    fillSiteText();
    setupViewer();
    setupProtection();
    setupRequest();
    grid.addEventListener("click", function (ev) { if (ev.target.closest(".tile")) LB.cameFromGrid = true; });
    $("#menu-btn").addEventListener("click", function () {
      var on = root.classList.toggle("menu-open");
      this.setAttribute("aria-expanded", String(on));
    });
    $$("#nav a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { if (grid.clientWidth !== lastW) layout(); }) : null;
    if (ro) ro.observe(grid); else addEventListener("resize", layout);
    addEventListener("scroll", onScroll, { passive: true });

    Promise.all(SIDES.map(load)).then(function (res) {
      SIDES.forEach(function (side, i) {
        var d = res[i] || {};
        DATA.sides[side] = { categories: d.categories || [], count: d.count || 0, cover: d.cover || null };
        (d.photos || []).forEach(function (p) {
          if (!p.img || !p.img.length) return;
          p.side = side;
          DATA.photos.push(p);
          BYID[p.id] = p;
        });
      });
      renderHome();
      renderAboutPhoto();
      addEventListener("hashchange", onHashChange);
      route();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

(function () {
  'use strict';
  var root = document.getElementById('welcomeLoop');
  if (!root) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var leavesContainer = document.getElementById('wlLeaves');
  var textEl = document.getElementById('wlText');
  var flareEl = document.getElementById('wlFlare');

  if (reduceMotion) {
    textEl.classList.add('wl-text-visible');
    return;
  }

  var GREENS = ['#14532d', '#166534', '#15803d', '#0f3d20', '#1b5e34', '#1f7a3f'];
  var TYPES  = ['jt-leaf-a', 'jt-leaf-b1', 'jt-leaf-b2', 'jt-leaf-c1', 'jt-leaf-c2'];
  var VARIANTS = ['v1', 'v2', 'v3'];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickVariant() { return pick(VARIANTS); }

  // Tile the banner into a jittered grid — each tile becomes one leaf.
  function tileGrid() {
    var w = root.clientWidth || 800;
    var h = root.clientHeight || 200;
    var size = Math.max(54, Math.min(100, w / 9));
    var cols = Math.ceil(w / (size * 0.72)) + 1;
    var rows = Math.ceil(h / (size * 0.72)) + 1;
    var cx = cols / 2, cy = rows / 2;
    var tiles = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var jx = (Math.random() - 0.5) * size * 0.5;
        var jy = (Math.random() - 0.5) * size * 0.5;
        var x = c * size * 0.72 - size * 0.3 + jx;
        var y = r * size * 0.72 - size * 0.3 + jy;
        var dist = Math.sqrt(Math.pow(c - cx, 2) + Math.pow(r - cy, 2));
        tiles.push({ x: x, y: y, size: size * (0.85 + Math.random() * 0.4), dist: dist });
      }
    }
    return tiles;
  }

  // Built exactly once — the clear/gather cycle re-triggers animations on
  // these same nodes forever, never recreating DOM (that repeat rebuild was
  // the actual cause of periodic jank, not the animation itself).
  function buildLeaves(tiles) {
    leavesContainer.innerHTML = '';
    var frag = document.createDocumentFragment();
    var items = [];
    tiles.forEach(function (t) {
      var el = document.createElement('div');
      el.className = 'wl-leaf';
      el.style.left = t.x + 'px';
      el.style.top = t.y + 'px';
      el.style.width = t.size + 'px';
      el.style.height = t.size + 'px';
      el.style.color = pick(GREENS);
      el.style.zIndex = Math.round(t.size); // bigger tiles = nearer = layer on top
      var restRot = Math.floor(rand(-16, 16));
      el.style.transform = 'rotate(' + restRot + 'deg)';
      el.innerHTML = '<svg><use href="leaf-sprite.svg#' + pick(TYPES) + '"></use></svg>';
      frag.appendChild(el);
      items.push({ el: el, dist: t.dist, restRot: restRot });
    });
    leavesContainer.appendChild(frag);
    return items;
  }

  var maxDist = 1, leaves = [];
  var cycleTimers = [];
  var hasStarted = false;

  function after(ms, fn) { cycleTimers.push(setTimeout(fn, ms)); }
  function computeMaxDist(items) {
    var m = 1;
    for (var i = 0; i < items.length; i++) if (items[i].dist > m) m = items[i].dist;
    return m;
  }

  function clearLeaves(items, maxD) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var startRot = item.restRot || 0;
      item.el.style.setProperty('--start-rot', startRot + 'deg');
      item.el.style.setProperty('--fall-x', Math.round(rand(-22, 22)) + 'px');
      item.el.style.setProperty('--fall-rot', (startRot + rand(-32, 32)) + 'deg');
      var delay = (item.dist / maxD) * 0.6 + Math.random() * 0.14;
      var dur = rand(1.9, 2.5);
      item.el.style.animationDelay = delay.toFixed(2) + 's';
      item.el.style.animationDuration = dur.toFixed(2) + 's';
      item.el.classList.remove('wl-gathering', 'v1', 'v2', 'v3');
      item.el.classList.add('wl-clearing', pickVariant());
    }
  }

  function gatherLeaves(items, maxD) {
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var restRot = item.restRot || 0;
      var gatherStartRot = restRot + Math.floor(rand(-32, 32));
      item.el.style.setProperty('--gather-start-rot', gatherStartRot + 'deg');
      item.el.style.setProperty('--gather-x', Math.round(rand(-22, 22)) + 'px');
      item.el.style.setProperty('--rest-rot', restRot + 'deg');
      var delay = (item.dist / maxD) * 0.6 + Math.random() * 0.14;
      var dur = rand(1.9, 2.5);
      item.el.style.animationDelay = delay.toFixed(2) + 's';
      item.el.style.animationDuration = dur.toFixed(2) + 's';
      item.el.classList.remove('wl-clearing', 'v1', 'v2', 'v3');
      void item.el.offsetWidth; // force reflow so the animation restarts cleanly on the reused element
      item.el.classList.add('wl-gathering', pickVariant());
    }
  }

  function runCycle() {
    if (!leaves.length) {
      var tiles = tileGrid();
      leaves = buildLeaves(tiles); // only ever runs once
      maxDist = computeMaxDist(leaves);
    }
    after(900, function () {
      clearLeaves(leaves, maxDist);
      textEl.classList.add('wl-text-visible');
      flareEl.classList.remove('wl-flare-burst');
      void flareEl.offsetWidth;
      flareEl.classList.add('wl-flare-burst');
    });
    after(7800, function () { textEl.classList.remove('wl-text-visible'); });
    after(8100, function () { gatherLeaves(leaves, maxDist); });
    after(11500, function () { runCycle(); }); // intentional permanent loop
  }

  function start() {
    if (hasStarted) return;
    hasStarted = true;
    runCycle();
  }

  // Lazily trigger the first play once actually on screen, then stop
  // watching — nothing here looks at scroll position again after that, so
  // scrolling away and back mid-reveal just shows it exactly where it is.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !hasStarted) { start(); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(root);
})();

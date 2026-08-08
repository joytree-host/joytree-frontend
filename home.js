(function () {
  'use strict';

  // ---------------------------------------------------------------- theme
  // Same pattern as docs.joytree.site: data-theme attribute on <html>,
  // persisted to localStorage, defaults to the system preference on first
  // visit so a new visitor's OS setting is respected.
  var THEME_KEY = 'joytree-theme';
  var root = document.documentElement;

  function applyTheme(mode) {
    root.setAttribute('data-theme', mode);
  }

  function initTheme() {
    var saved = null;
    try { saved = window.localStorage ? window.localStorage.getItem(THEME_KEY) : null; } catch (_) {}
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  }
  initTheme();

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { if (window.localStorage) window.localStorage.setItem(THEME_KEY, next); } catch (_) {}
      });
    }

    // ------------------------------------------------------------ mobile menu
    var navToggle = document.getElementById('navToggle');
    var mobileMenu = document.getElementById('mobileMenu');
    if (navToggle && mobileMenu) {
      navToggle.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
    // ------------------------------------------------------------- story carousel
    var storySlides = Array.prototype.slice.call(document.querySelectorAll('.story-slide'));
    var storyDots = Array.prototype.slice.call(document.querySelectorAll('.story-dot'));
    var storyIdx = 0;
    var storyTimer = null;

    function showStory(i) {
      storyIdx = (i + storySlides.length) % storySlides.length;
      storySlides.forEach(function (s, n) { s.classList.toggle('active', n === storyIdx); });
      storyDots.forEach(function (d, n) { d.classList.toggle('active', n === storyIdx); });
    }
    function storyAutoplay() {
      if (storyTimer) clearInterval(storyTimer);
      storyTimer = setInterval(function () { showStory(storyIdx + 1); }, 3400);
    }
    if (storySlides.length) {
      var prevBtn = document.getElementById('storyPrev');
      var nextBtn = document.getElementById('storyNext');
      if (prevBtn) prevBtn.addEventListener('click', function () { showStory(storyIdx - 1); storyAutoplay(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { showStory(storyIdx + 1); storyAutoplay(); });
      storyDots.forEach(function (dot, n) {
        dot.addEventListener('click', function () { showStory(n); storyAutoplay(); });
      });
      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reducedMotion) storyAutoplay();
    }

    // ------------------------------------------------------ how-it-works tabs
    var howSteps = Array.prototype.slice.call(document.querySelectorAll('.how-step'));
    var codeTabs = Array.prototype.slice.call(document.querySelectorAll('.code-tab'));
    var codePanels = Array.prototype.slice.call(document.querySelectorAll('.code-panel'));
    function selectHowIndex(i) {
      howSteps.forEach(function (s, n) { s.classList.toggle('active', n === i); });
      codeTabs.forEach(function (t, n) { t.classList.toggle('active', n === i); });
      codePanels.forEach(function (p, n) { p.classList.toggle('active', n === i); });
    }
    howSteps.forEach(function (step, i) { step.addEventListener('click', function () { selectHowIndex(i); }); });
    codeTabs.forEach(function (tab, i) { tab.addEventListener('click', function () { selectHowIndex(i); }); });

    // ---------------------------------------------------------- snippet copy
    document.querySelectorAll('.snippet-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var body = btn.closest('.snippet-card').querySelector('.snippet-body');
        var text = body.innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = orig; }, 1600);
          });
        }
      });
    });
  });

  // ---------------------------------------------------------------- PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();

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
  });

  // ---------------------------------------------------------------- PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();

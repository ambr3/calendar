/*
 * Seclusa theme boot — day/night mode before first paint.
 * Page background stays the orange lines. No solid swatches, no Day/Night sky.
 *
 * Storage:
 *   ssc.pref_key_night_mode — light | dark | system
 *   Absent means dark. Calendar defaults to dark, not the device theme.
 */
(function () {
  var KEY_THEME = "ssc.pref_key_night_mode";
  var KEY_BG = "ssc.pref_key_bg";
  var LEGACY_KEY = "privacy_calendar_theme";

  function readPref() {
    try {
      var v = localStorage.getItem(KEY_THEME);
      if (v === "light" || v === "dark" || v === "system") return v;
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy === "light") return "light";
      if (legacy === "dark" || legacy === "bw") return "dark";
      return null;
    } catch (err) {
      return null;
    }
  }

  try {
    var html = document.documentElement;
    var saved = readPref();
    if (saved === "light" || saved === "dark") {
      html.setAttribute("data-theme", saved);
    } else if (saved === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      html.setAttribute("data-theme", "light");
    } else {
      html.setAttribute("data-theme", "dark");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", html.getAttribute("data-theme") === "light" ? "#e4e4e4" : "#0a0a0a");

    try { html.removeAttribute("style"); } catch (err) { /* ignore */ }
    html.removeAttribute("data-bg");
    html.removeAttribute("data-bg-tone");
    try {
      if (localStorage.getItem(KEY_BG) && localStorage.getItem(KEY_BG) !== "grid") {
        localStorage.setItem(KEY_BG, "grid");
      }
    } catch (err) { /* ignore */ }
  } catch (err) {
    /* Storage blocked, or no matchMedia. The dark default in the markup stands. */
  }
})();

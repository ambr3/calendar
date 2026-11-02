/* App shell for Seclusa Calendar: theme toggle, About and Backup sheets,
   and the merge/replace dialog used when importing a calendar file.

   Theme follows the shared Seclusa template: system / light / dark, stored
   under ssc.pref_key_night_mode (same key as theme-boot.js). */
"use strict";

const $ = (id) => document.getElementById(id);

/* Resolves "merge", "replace" or null. Escape and Cancel both give null, so
   closing the dialog by accident never replaces anything. */
function chooseMerge(title, text) {
  return new Promise((resolve) => {
    $("ch-title").textContent = title;
    $("ch-text").textContent = text;
    const dlg = $("dlg-choice");
    const done = (v) => {
      dlg.removeEventListener("close", onClose);
      if (dlg.open) dlg.close();
      $("ch-merge").onclick = null;
      $("ch-replace").onclick = null;
      $("ch-cancel").onclick = null;
      resolve(v);
    };
    const onClose = () => done(null);
    dlg.addEventListener("close", onClose, { once: true });
    $("ch-merge").onclick = () => done("merge");
    $("ch-replace").onclick = () => done("replace");
    $("ch-cancel").onclick = () => done(null);
    dlg.showModal();
  });
}

let openSheet = null;

function showSheet(id) {
  closeSheet();
  openSheet = id;
  $("scrim").classList.add("open");
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden", "false");
}

function closeSheet() {
  if (openSheet) {
    $(openSheet).classList.remove("open");
    $(openSheet).setAttribute("aria-hidden", "true");
  }
  openSheet = null;
  $("scrim").classList.remove("open");
}

(function () {
  const THEME_KEY = "ssc.pref_key_night_mode";
  const LEGACY_KEY = "privacy_calendar_theme";
  const ORDER = ["system", "light", "dark"];
  const LABELS = { system: "System", light: "Light", dark: "Dark" };
  const LIGHT = "#ffffff";
  const DARK = "#0a0a0a";

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      /* storage full or blocked: the theme is cosmetic */
    }
  }
  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) { /* ignore */ }
  }

  function prefersDark() {
    try {
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (_) {
      return false;
    }
  }

  function readMode() {
    const v = safeGet(THEME_KEY);
    if (v === "light" || v === "dark") return v;
    if (v === "system" || v === null || v === "") {
      const legacy = safeGet(LEGACY_KEY);
      if (legacy === "light") {
        safeSet(THEME_KEY, "light");
        safeRemove(LEGACY_KEY);
        return "light";
      }
      if (legacy === "dark" || legacy === "bw") {
        safeSet(THEME_KEY, "dark");
        safeRemove(LEGACY_KEY);
        return "dark";
      }
      return "system";
    }
    return "system";
  }

  function resolve(mode) {
    if (mode === "dark") return "dark";
    if (mode === "light") return "light";
    return prefersDark() ? "dark" : "light";
  }

  function applyMode(mode) {
    const theme = resolve(mode);
    document.documentElement.setAttribute("data-theme", theme);
    const pane = document.getElementById("pane-calendar");
    if (pane) pane.setAttribute("data-theme", theme);
    const colour = theme === "dark" ? DARK : LIGHT;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute("content", colour);
    });
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    const label = document.getElementById("theme-toggle-label");
    if (label) label.textContent = LABELS[next];
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", mode === "system" ? "false" : "true");
      btn.title = "Switch to " + LABELS[next].toLowerCase() + " theme";
    }
  }

  function setMode(mode) {
    if (mode === "system") safeRemove(THEME_KEY);
    else safeSet(THEME_KEY, mode);
    safeRemove(LEGACY_KEY);
    applyMode(mode);
  }

  /* Import/export and clear-all call this so shell owns the theme key. */
  window.SeclusaTheme = {
    current: readMode,
    set: setMode,
    apply: applyMode,
    key: THEME_KEY,
    legacyKey: LEGACY_KEY,
  };

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = readMode();
      const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
      setMode(next);
    });
  }

  if (window.matchMedia) {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readMode() === "system") applyMode("system");
    };
    if (query.addEventListener) query.addEventListener("change", onChange);
    else if (query.addListener) query.addListener(onChange);
  }

  const scrim = $("scrim");
  const aboutBtn = $("nav-about");
  const backupBtn = $("nav-backup");
  if (scrim) scrim.addEventListener("click", closeSheet);
  if (aboutBtn) aboutBtn.addEventListener("click", () => showSheet("sheet-about"));
  if (backupBtn) backupBtn.addEventListener("click", () => showSheet("sheet-backup"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  applyMode(readMode());
})();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
}

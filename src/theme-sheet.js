/* Seclusa Theme sheet — System / Light / Dark only.
   Calendar does not offer solid background swatches. */
(function (global) {
  "use strict";

  function syncSheetUi(getMode) {
    var mode = typeof getMode === "function" ? getMode() : "system";
    document.querySelectorAll("[data-theme-opt]").forEach(function (btn) {
      var opt = btn.getAttribute("data-theme-opt");
      var on = opt === mode;
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.classList.toggle("active", on);
    });
  }

  function refreshNavLabel(getMode) {
    var mode = typeof getMode === "function" ? getMode() : "system";
    var label = document.getElementById("theme-toggle-label");
    if (label) label.textContent = "Theme";
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", mode === "system" ? "false" : "true");
      btn.title = "Theme settings";
    }
  }

  /**
   * @param {object} opts
   * @param {function(): string} opts.getMode
   * @param {function(string): void} opts.setMode
   * @param {function(string): void} [opts.showSheet]
   */
  function wire(opts) {
    opts = opts || {};
    var getMode = opts.getMode || function () { return "system"; };
    var setMode = opts.setMode || function () {};
    var showSheet = opts.showSheet || function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("open");
      var scrim = document.getElementById("scrim");
      if (scrim) scrim.classList.add("open");
    };

    refreshNavLabel(getMode);
    syncSheetUi(getMode);

    var themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        syncSheetUi(getMode);
        showSheet("sheet-theme");
      });
    }

    document.querySelectorAll("[data-theme-opt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var opt = btn.getAttribute("data-theme-opt");
        if (opt !== "system" && opt !== "light" && opt !== "dark") return;
        setMode(opt);
        refreshNavLabel(getMode);
        syncSheetUi(getMode);
      });
    });
  }

  global.SeclusaThemeSheet = {
    syncSheetUi: syncSheetUi,
    refreshNavLabel: refreshNavLabel,
    wire: wire
  };
})(typeof window !== "undefined" ? window : this);

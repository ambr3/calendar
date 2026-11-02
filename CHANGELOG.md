# Changelog

All notable changes to **Seclusa Calendar**.

## 0.3.4 — 2026-11-02

### Changed
- PWA icons use a black-and-white calendar mark (distinct from Notes).

## 0.3.3 — 2026-11-02

### Fixed
- Reminders for multi-day timed events fire on each day of the span.
- JSON Replace clears countdowns and settings when the file omits them.
- iCalendar import offers merge/replace; UTC (`Z`) timestamps map to local day/time.
- Holidays and important dates expand when navigating outside the initial year window.
- Search jumps to the next occurrence of a recurring event.
- Reminder dedupe survives a reload; same-day `endTime` before `time` is dropped.
- Recurrence day math no longer drifts across DST; unused `src/recurrence.js` is no longer loaded.

## 0.3.2 — 2026-11-02

### Changed
- Version bump for GitHub Pages publish.

## 0.3.1 — 2026-11-02

### Added
- HTTP Observatory scan PDF; README notes why a **B** on GitHub Pages is
  accepted (missing framing/nosniff headers; real protection is the meta CSP
  and local-only data).

## 0.3.0 — 2026-11-02

### Changed
- Theme matches the Seclusa template: system / light / dark via
  `ssc.pref_key_night_mode`, with `theme-boot.js` before first paint.
  Old `privacy_calendar_theme` values (`bw` → dark) migrate automatically.
- Removed the Settings accent-colour picker; chrome uses the base
  black/white accent. Event colours are unchanged.

### Fixed
- Backup sheet and bottom-bar tab so JSON / iCalendar export and restore are
  reachable again after the split from NoCal.
- Service worker precaches local fonts; UI uses bundled DM Sans / Sora.
- Stale NoCal / notes wording, leftover Apache licence file, and the DM Sans
  OFL copyright line.

## 0.2.2 — 2026-11-02

### Changed
- Theme matches the Seclusa template: system / light / dark via
  `ssc.pref_key_night_mode`, with `theme-boot.js` before first paint.
- Old `privacy_calendar_theme` values (`bw` → dark) migrate automatically.
- Removed the Settings accent-colour picker; chrome uses the base
  black/white accent. Event colours are unchanged.

## 0.2.1 — 2026-11-02

### Fixed
- Backup sheet and bottom-bar tab so JSON / iCalendar export and restore are
  reachable again after the split from NoCal.
- Service worker precaches local fonts (offline no longer falls back silently).
- Stale NoCal / notes wording in Settings, About, privacy policy and the
  public API name (`SeclusaCalendar`).
- Font licence path in `LICENSE`; dead notes layout CSS variables.
- Apply bundled DM Sans / Sora instead of leaving the UI on system fonts.
- Drop leftover `LICENSE-APACHE-2.0.txt` (calendar is GPL-3.0 only).
- Correct the DM Sans OFL copyright line (was a Sora copy-paste).

## 0.2.0 — 2026-11-01

### Changed
- Seclusa Calendar is now its own app, split out of Seclusa NoCal. The
  calendar views, events, holidays, countdowns, birthdays and import/export are
  unchanged; the notes pane, notes sheets and combined backup are gone.
- Exports are named `seclusa-calendar-<date>.json` and `.ics`.
- The service worker uses its own cache prefix, so installing notes and
  calendar side by side no longer clears the other app's cache.

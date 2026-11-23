# Changelog

All notable changes to **Seclusa Calendar**.

## 0.3.17 — 2026-11-23

### Changed
- In landscape view, the date card sits on the left and the calendar grid sits on the right.

## 0.3.16 — 2026-11-21

### Fixed
- A zoomed mobile browser no longer makes the whole calendar scroll. The shell stays on the visible screen, and the week view still scrolls inside its hours.

## 0.3.15 — 2026-11-21

### Changed
- Settings, search, public dates, countdowns, and birthdays open as centered cards. Theme, backup, about, and public dates live in Settings.
- Dark is the default when nothing is saved. Light mode is a softer grey, and the browser chrome matches that grey.
- A day with something on is slightly shaded, and the event colour is a line along the bottom.
- An empty day says "Nothing on, time to relax".

### Fixed
- A browser that blocks notifications no longer stops the reminder control from being set up.

## 0.3.14 — 2026-11-21

### Fixed
- Timed events that span several days keep their end day in an iCalendar export.
- Merging a backup or an iCalendar file cannot grow the calendar past 10,000 events.
- Overlapping events in week view sit side by side.
- Birthdays lists only events marked as a birthday.
- The empty countdown hint points at the form below the list.

## 0.3.13 — 2026-11-21

### Changed
- Month opens on a Today deck: large date, weekday, and the next event, with the keypad filling the rest of the card.
- Menu, Theme, Backup, About, and the day view open as cards. The bottom bar is gone; every option is in the menu.
- Week always starts on Monday. Footer shows the GPL link, made-with line, and version.
- Theme is System / Light / Dark only. Orange lines stay; solid background swatches are gone.
- Deck and today cell use a softer night grey and a softer day charcoal.

### Removed
- Unused background-swatch code, sheet grabbers, and the local icon preview page.

## 0.3.12 — 2026-11-14

### Fixed
- iOS status bar uses `black` instead of `black-translucent` (no top blur).

## 0.3.11 — 2026-11-07

### Fixed
- PWA install on GitHub Pages: dropped the relative `id` that resolved outside `/calendar/`.

## 0.3.10 — 2026-11-07

### Changed
- PWA icon is a white tile with a black **31**.

### Fixed
- Encrypted backup rejects overlong passwords and unsupported key-derivation settings.

## 0.3.9 — 2026-11-06

### Changed
- PWA icon is a solid black calendar on white, matching the Notes mark.
- Week view draws overnight and all-day events across the hours they cover.

### Fixed
- A reminder set to None no longer fires at the event time after reload.
- Repeating events honour a one-day reminder.
- Replacing from an empty iCalendar file no longer drops the events already stored.
- The service worker only caches the calendar page as the offline shell.

## 0.3.8 — 2026-11-03

### Changed
- Theme nav label is always **Theme**.
- Orange ruled lines faded further.
- About links point at the GitHub repo (`ambr3/calendar`) for source, README, and privacy policy.

## 0.3.7 — 2026-11-03

### Added
- Theme sheet: System / Light / Dark plus background swatches (lines, named colours, custom hex).

## 0.3.6 — 2026-11-03

### Fixed
- Orange ruled-lines theme shows full-page again (opaque body background was covering it).

## 0.3.5 — 2026-11-03

### Added
- Separate Share and Save / Download for JSON and iCalendar.
- Optional encrypted JSON backup (same AES-GCM container as Notes).
- Last-backup label and a soft reminder after 30 days on the Backup sheet.

### Changed
- iCalendar stays plaintext (for other calendar apps); encrypt JSON for a secure stash.

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

/* Tests for the pure logic in ../calendar/app.js.
   No dependencies, no test framework: run with `node test/calendar.test.mjs`.

   The calendar script exports its date and recurrence helpers on
   globalThis.__SECLUSA_CORE__ when it is loaded without a document, so the
   tests exercise the real source rather than a copy. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runInNewContext } from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const context = { localStorage: { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } } };
runInNewContext(readFileSync(join(here, "..", "calendar", "app.js"), "utf8"), context);
const core = context.__SECLUSA_CORE__;

let passed = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) {
    passed++;
    return;
  }
  failures.push(name + (detail ? " — " + detail : ""));
}

function eq(name, got, want) {
  check(name, JSON.stringify(got) === JSON.stringify(want), "got " + JSON.stringify(got) + ", want " + JSON.stringify(want));
}

/* ------------------------------------------------------------ date helpers */
{
  eq("dateKey pads month and day", core.dateKey(2026, 0, 5), "2026-01-05");
  const parsed = core.parseDateKey("2026-11-01");
  eq("parseDateKey gives the right day", [parsed.getFullYear(), parsed.getMonth(), parsed.getDate()], [2026, 10, 1]);
  eq("addDaysKey crosses a month boundary", core.addDaysKey("2026-01-31", 1), "2026-02-01");
  eq("addDaysKey handles leap day", core.addDaysKey("2024-02-28", 1), "2024-02-29");
  eq("addDaysKey goes backwards", core.addDaysKey("2026-03-01", -1), "2026-02-28");
  eq("dayOffset counts whole days",
    core.dayOffset("2026-01-01", "2026-01-31"), 30);
  eq("dayOffset is calendar-based (not local ms)",
    core.dayOffset("2026-03-08", "2026-03-09"), 1);
  eq("timeToMinutes reads HH:MM", core.timeToMinutes("09:30"), 570);
  eq("timeToMinutes treats an empty time as midnight", core.timeToMinutes(""), 0);
}

/* ------------------------------------------------------------- recurrence */
{
  const start = core.parseDateKey("2026-11-02");
  const weekly = { frequency: "weekly", interval: 1 };
  check("a weekly rule matches the day after it starts",
    core.isRecurringOnDate(start, core.parseDateKey("2026-11-09"), weekly));
  check("a weekly rule skips the week between",
    !core.isRecurringOnDate(start, core.parseDateKey("2026-11-08"), weekly));
  check("a rule never matches on its own start date",
    !core.isRecurringOnDate(start, start, weekly));
  check("a daily rule matches the next day",
    core.isRecurringOnDate(start, core.parseDateKey("2026-11-03"),
      { frequency: "daily", interval: 1 }));

  const jan31 = core.parseDateKey("2026-01-31");
  check("monthly from Jan 31 lands on Feb 28",
    core.isRecurringOnDate(jan31, core.parseDateKey("2026-02-28"),
      { frequency: "monthly", interval: 1 }));
  check("monthly from Jan 31 lands on Mar 31",
    core.isRecurringOnDate(jan31, core.parseDateKey("2026-03-31"),
      { frequency: "monthly", interval: 1 }));
  check("yearly matches the anniversary",
    core.isRecurringOnDate(core.parseDateKey("2024-02-29"),
      core.parseDateKey("2028-02-29"), { frequency: "yearly", interval: 1 }));

  eq("nextRecurringKey jumps a week ahead",
    core.nextRecurringKey("2026-01-06", weekly, "2026-01-20"), "2026-01-20");
  eq("nextRecurringKey keeps a future start",
    core.nextRecurringKey("2026-12-01", weekly, "2026-01-01"), "2026-12-01");
}

/* ------------------------------------------------------- spanning events */
{
  const state = {
    events: {
      "2026-11-02": [{
        id: "trip",
        title: "Trip",
        time: "09:00",
        endDate: "2026-11-06",
        color: "#6cb5e6",
      }],
    },
  };
  const mid = core.getSpanningEventsForKey(state, "2026-11-04");
  check("spanning event appears on a middle day",
    mid.length === 1 && mid[0].id === "trip");
  check("spanning event is absent after endDate",
    core.getSpanningEventsForKey(state, "2026-11-07").length === 0);
}

/* ------------------------------------------------------------ import guard */
{
  const validate = core.validateCalendarImport;
  eq("import validation counts event days",
    validate({ events: { "2026-01-01": [{ title: "New Year" }] } }).eventDays, 1);

  let msg = "";
  try { validate({ events: null }); } catch (e) { msg = e.message; }
  check("import rejects a missing events object", /Invalid calendar file/.test(msg), msg);

  msg = "";
  try { validate({ events: [] }); } catch (e) { msg = e.message; }
  check("import rejects an events array", /Invalid calendar file/.test(msg), msg);

  msg = "";
  try { validate({ events: { "2026-01-01": Array(10001).fill({}) } }); }
  catch (e) { msg = e.message; }
  check("import rejects oversized event collections", /Too many events/.test(msg), msg);

  const state = core.createInitialState();
  state.countdowns = [{ id: "keep-me", name: "Trip", date: "2026-12-01", yearly: false }];
  state.lang = "fr";
  state.selectedCountries = ["us"];
  core.applyCalendarImport(state, { events: {} }, { merge: false });
  eq("replace with events-only clears countdowns", state.countdowns, []);
  eq("replace with events-only resets language", state.lang, "en");
  eq("replace with events-only resets countries", state.selectedCountries, core.DEFAULT_COUNTRIES);

  const mergeState = core.createInitialState();
  mergeState.countdowns = [{ id: "old", name: "Old", date: "2026-06-01", yearly: false }];
  core.applyCalendarImport(mergeState, {
    events: { "2026-01-01": [{ id: "e1", title: "Hi", time: "10:00" }] },
  }, { merge: true });
  eq("merge keeps existing countdowns when omitted", mergeState.countdowns.length, 1);
  check("merge adds events", (mergeState.events["2026-01-01"] || []).length === 1);
}

/* -------------------------------------------------------------- sanitising */
{
  const ev = core.sanitizeEvent({ title: "Dentist", time: "08:05" });
  eq("sanitizeEvent keeps a valid time", ev.time, "08:05");
  eq("sanitizeEvent drops a malformed time",
    core.sanitizeEvent({ title: "x", time: "8:05" }).time, null);
  check("sanitizeEvent refuses a non-object", core.sanitizeEvent(null) === null);
  eq("sanitizeEvent caps a huge title",
    core.sanitizeEvent({ title: "x".repeat(400) }).title.length, 300);
  eq("sanitizeEvent drops same-day end before start",
    core.sanitizeEvent({ title: "x", time: "10:00", endTime: "09:00" }).endTime, null);
  eq("sanitizeEvent keeps endTime on a multi-day span",
    core.sanitizeEvent({ title: "x", time: "10:00", endTime: "09:00", endDate: "2026-11-05" }).endTime, "09:00");
}

/* ----------------------------------------------------------- ICS datetime */
{
  const local = core.parseIcsDateTime("20261102T150000");
  eq("ICS floating time keeps the written day", local.key, "2026-11-02");
  eq("ICS floating time keeps the written clock", local.time, "15:00");

  const utc = core.parseIcsDateTime("20261102T000000Z");
  check("ICS Z instant yields a local key", /^\d{4}-\d{2}-\d{2}$/.test(utc.key), utc.key);
  check("ICS Z instant yields HH:MM", /^\d{2}:\d{2}$/.test(utc.time), utc.time);
  /* Midnight UTC is the previous local calendar day west of UTC. */
  const westish = new Date(Date.UTC(2026, 10, 2, 0, 0, 0));
  eq("ICS Z midnight UTC matches Date local conversion",
    [utc.key, utc.time],
    [
      core.dateKey(westish.getFullYear(), westish.getMonth(), westish.getDate()),
      `${String(westish.getHours()).padStart(2, "0")}:${String(westish.getMinutes()).padStart(2, "0")}`,
    ]);
}

/* ----------------------------------------------------- holiday year range */
{
  const far = core.precomputeAllHolidays(core.WORLD_HOLIDAYS_DATA, 2030, 2031);
  check("holiday precompute covers a far year when asked",
    !!(far.uk && far.uk["2030-01-01"]), "missing 2030-01-01 for uk");
  const important = core.precomputeImportantDates(core.IMPORTANT_DATES_META, 2030, 2030);
  check("important dates precompute covers a far year when asked",
    !!(important.halloween && important.halloween["2030-10-31"]));
}

/* ------------------------------------------------------------------ report */
if (failures.length) {
  console.error("FAILED " + failures.length + " of " + (passed + failures.length) + " checks:\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log("all " + passed + " checks passed");

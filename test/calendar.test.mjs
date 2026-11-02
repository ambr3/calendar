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
const context = {};
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
}

/* ------------------------------------------------------------------ report */
if (failures.length) {
  console.error("FAILED " + failures.length + " of " + (passed + failures.length) + " checks:\n");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log("all " + passed + " checks passed");

# Interactive Severity Trend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Symptom tracker severity trend interactive: Entries/Days range controls (with localStorage), tap-to-inspect detail panel, day averages with per-log breakdown, and scroll-to-log from the chart.

**Architecture:** Keep a custom SVG chart (no library). Extract pure filter/bucket/framing helpers into `src/lib/tracker/severity-trend.ts` with a Node strip-types script test. Convert `SeverityTrend` to a client component that owns mode/preset/selection UI. Tracker page fetches a larger recent log set, passes full log fields, and adds `id={log-${id}}` anchors on list items.

**Tech Stack:** Next.js App Router, React 19 client components, existing Stasus CSS variables, `localStorage`, existing `localDateString` / timezone helpers where useful.

**Design doc:** `docs/plans/2026-07-29-severity-trend-design.md`

---

### Task 1: Pure helpers + script test

**Files:**
- Create: `src/lib/tracker/severity-trend.ts`
- Create: `scripts/test-severity-trend.mjs`
- Modify: `package.json` (add `test:severity-trend` script)

**Step 1: Write failing test script**

```js
#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  buildTrendPoints,
  DEFAULT_TREND_PREFS,
  parseTrendPrefs,
  framingForPoints,
} from "../src/lib/tracker/severity-trend.ts";

const logs = [
  {
    id: "a",
    severity: 4,
    triggers: ["stress"],
    notes: "n1",
    logged_at: "2026-07-29T18:00:00.000Z",
  },
  {
    id: "b",
    severity: 6,
    triggers: [],
    notes: null,
    logged_at: "2026-07-29T12:00:00.000Z",
  },
  {
    id: "c",
    severity: 5,
    triggers: ["food"],
    notes: "n2",
    logged_at: "2026-07-28T18:00:00.000Z",
  },
];

const entries = buildTrendPoints(logs, {
  mode: "entries",
  preset: 2,
  timeZone: "UTC",
});
assert.equal(entries.length, 2);
assert.equal(entries[0].kind, "entry");
assert.equal(entries[0].log.id, "c");

const days = buildTrendPoints(logs, {
  mode: "days",
  preset: 7,
  timeZone: "UTC",
});
assert.equal(days.length, 2);
const jul29 = days.find((p) => p.kind === "day" && p.date === "2026-07-29");
assert.ok(jul29);
assert.equal(jul29.severity, 5); // (4+6)/2
assert.equal(jul29.logs.length, 2);

assert.deepEqual(parseTrendPrefs(null), DEFAULT_TREND_PREFS);
assert.equal(parseTrendPrefs('{"mode":"days","preset":90}').mode, "days");
assert.equal(parseTrendPrefs('{"mode":"days","preset":14}').preset, 30); // invalid for days → middle

console.log("severity-trend: ok");
```

**Step 2: Run test — expect FAIL (module missing)**

Run: `node --experimental-strip-types scripts/test-severity-trend.mjs`

**Step 3: Implement helpers**

Export from `src/lib/tracker/severity-trend.ts`:

- Types: `TrendLog`, `TrendPrefs`, `TrendPoint` (`entry` | `day` variants)
- `ENTRY_PRESETS = [7,14,30]`, `DAY_PRESETS = [7,30,90]`
- `DEFAULT_TREND_PREFS = { mode: "entries", preset: 14 }`
- `STORAGE_KEY = "stasus.severity-trend"`
- `parseTrendPrefs(raw: string | null): TrendPrefs` — validate mode + preset; on mode/preset mismatch use middle preset of that mode (14 entries / 30 days)
- `buildTrendPoints(logs, { mode, preset, timeZone, now? })`:
  - Sort by `logged_at` ascending for output order
  - Entries: take last `preset` logs after sort; each point `{ kind:"entry", severity, logged_at, log }`
  - Days: filter logs with local date ≥ (today − preset + 1) via `localDateString`; group by local date; severity = mean; `{ kind:"day", date, severity, logs[] }` oldest→newest
- `framingForPoints(points)` — reuse current delta copy (first vs last severity)

Use `normalizeTimeZone` / `localDateString` from `@/lib/time/local-calendar`.

**Step 4: Run test — expect PASS**

Run: `node --experimental-strip-types scripts/test-severity-trend.mjs`  
Add `"test:severity-trend": "node --experimental-strip-types scripts/test-severity-trend.mjs"` to `package.json`.

**Step 5: Commit**

```bash
git add src/lib/tracker/severity-trend.ts scripts/test-severity-trend.mjs package.json
git commit -m "Add severity trend filter helpers and tests."
```

---

### Task 2: Tracker page — richer fetch + list anchors

**Files:**
- Modify: `src/app/app/tracker/page.tsx`

**Step 1: Raise fetch + pass full logs**

- Change `.limit(50)` → `.limit(200)` (enough for Days · 90 for typical users).
- Remove `trendPoints` slice mapping.
- Pass `logs={logs}` (and optionally `timeZone` if already available from profile; else omit and let client use `Intl` / UTC fallback — prefer reading `profiles.timezone` in the same page if cheap).

**Step 2: Add list anchors + highlight target**

On each `<li>`, set `id={`log-${log.id}`}` and a class usable for brief highlight (e.g. `scroll-mt-24`). Keep delete form / content unchanged.

**Step 3: Manual check**

Run: `npm run dev` — tracker still lists logs; chart may break until Task 3 (prop rename). Prefer implementing Task 3 in the same sitting so the page compiles.

**Step 4: Commit** (can combine with Task 3 if preferred)

```bash
git commit -m "Pass full logs to severity trend and anchor list items."
```

---

### Task 3: Client `SeverityTrend` UI

**Files:**
- Modify: `src/components/severity-trend.tsx` (rewrite as `"use client"`)

**Step 1: Props**

```ts
type Props = {
  logs: TrendLog[];
  timeZone?: string;
};
```

**Step 2: State**

- `prefs` from `parseTrendPrefs`, hydrate from `localStorage` in `useEffect` (avoid SSR mismatch: start with `DEFAULT_TREND_PREFS`, then read storage).
- Persist prefs on change.
- `selectedKey: string | null` (entry id or day date). Clear when prefs change.
- Derive `points = buildTrendPoints(logs, { ...prefs, timeZone })`.

**Step 3: Controls**

- Mode buttons Entries | Days (`aria-pressed`).
- Preset chips for active mode.
- Switching mode: if current preset invalid for new mode, set middle preset (14 / 30).

**Step 4: Chart**

- Keep SVG line + circles; add Y labels 1/5/10; start/end date text under plot.
- Each point: larger invisible hit circle + visible dot; `button` or `role="button"` with keyboard; selected state thicker stroke / larger radius.
- Tap selected again or click outside (container `onBlur` / document pointer with care) to clear — prefer: clicking empty chart area clears; Escape clears.

**Step 5: Detail panel**

- Only when selected.
- Entry: datetime, severity, triggers, notes (truncate ~160 chars), **View in list** → `document.getElementById(`log-${id}`)?.scrollIntoView({ behavior:"smooth", block:"center" })` + temporary `data-highlight` / class 1.5s.
- Day: date, average (1 decimal if needed), count, list of logs with same fields + per-row View in list.
- `aria-live="polite"` on the panel region.

**Step 6: Empty**

- If `points.length < 2`, existing gentle empty copy (no chart/controls required beyond message, or show controls disabled — prefer show controls + empty message).

**Step 7: Smoke in browser**

- Toggle Entries/Days presets; reload page → prefs persist.
- Tap point → panel; View in list → scrolls.
- Day with 2 logs → average + both rows.

**Step 8: Commit**

```bash
git commit -m "Make severity trend interactive with ranges and detail panel."
```

---

### Task 4: Polish + verify

**Files:**
- Possibly tweak: `src/components/severity-trend.tsx` (spacing, truncated notes, focus rings)

**Step 1: Run helper test**

`npm run test:severity-trend`

**Step 2: Lint touched files**

`npx eslint src/components/severity-trend.tsx src/lib/tracker/severity-trend.ts src/app/app/tracker/page.tsx`

**Step 3: Manual mobile-width check**

Controls wrap cleanly; hit targets ≥ ~44px; panel readable.

**Step 4: Commit if polish landed**

```bash
git commit -m "Polish severity trend interaction and a11y."
```

---

## Done when

- [ ] Entries 7/14/30 and Days 7/30/90 filter the chart
- [ ] Prefs persist in `localStorage`
- [ ] Tap selects / deselects; detail panel matches design
- [ ] Day average + per-log list + View in list works
- [ ] `npm run test:severity-trend` passes

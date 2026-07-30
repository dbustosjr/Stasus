# Interactive severity trend — design

**Date:** 2026-07-29  
**Status:** Approved  
**Approach:** Upgrade existing custom SVG chart (no chart library)

## Goal

Make the Symptom tracker “Recent severity trend” useful: inspect points and compare over time, instead of a static sparkline.

## Interaction & layout

- Keep card title + short framing sentence (informational, not a grade).
- Controls above the chart:
  - **Mode:** Entries | Days
  - **Preset:** Entries → 7 / 14 / 30; Days → 7 / 30 / 90
- Chart: teal line + dots; minimal chrome — severity ticks **1 / 5 / 10**; light start/end date labels.
- Points have large tap hit targets.
- **Selection:** tap point to select; tap same point or outside chart/panel to clear. Desktop may highlight on hover; selection still requires click/tap.
- **Detail panel** under chart when selected:
  - **Entries:** date/time, severity, triggers, notes + **View in list**
  - **Days (average):** date, average severity, log count + compact list of that day’s logs (each with severity / triggers / notes + **View in list**)

## Data & filtering

- Pass full log fields into `SeverityTrend`: `id`, `severity`, `triggers`, `notes`, `logged_at`.
- Raise tracker fetch enough for Days · 90 (e.g. ~200 recent logs or 90-day window). Chart filters client-side; list and chart share the same fetched set when practical.
- **Entries mode:** chronological line; last N logs for preset; one point per log.
- **Days mode:** bucket by user’s **local calendar day**; Y = **mean severity** (one decimal if needed); skip empty days (no zero-fill).
- **Persistence:** `localStorage` key `stasus.severity-trend` → `{ mode, preset }`. Default: Entries · 14. Invalid → default. Switching mode: use middle preset of new mode if prior number invalid (14 → 30 when switching to days).
- **&lt;2 points** in active window: empty copy, no chart. Clear selection when window changes.
- List items use `id={`log-${id}`}`; **View in list** scrolls into view + brief highlight.

## Structure

- `SeverityTrend` → client component (state, localStorage, SVG, detail panel).
- Helpers in component file or `lib/tracker/severity-trend.ts` (filter, day averages, framing).
- Tracker page remains server component; adds stable log anchors.

## Accessibility

- Range controls: real buttons, `aria-pressed`.
- Chart summary + focusable points (or arrow keys / Enter / Escape).
- Detail panel: `aria-live="polite"` on selection change.

## Edge cases

- Long notes truncated in panel; full text on list item.
- Non-integer averages shown with one decimal.
- Corrupt localStorage → Entries · 14.
- Prefer shared fetch so jump targets always exist in the list.

## Out of scope

- Chart libraries, admin analytics, edit-from-chart, hover-only as primary UX.

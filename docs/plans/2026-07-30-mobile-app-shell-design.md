# Mobile app shell & export UX — Design

**Date:** 2026-07-30  
**Status:** Approved  
**Scope:** In-app dashboard chrome only (landing page unchanged)

## Problem

On phone, the in-app shell causes several UX failures:

1. **Export menu clips** off the right edge; CSV vs PDF is hard to see without pinching.
2. **Pinch-zoom** leaves the UI looking zoomed out and “jumps” when reopening Export.
3. **PDF/CSV open in-browser** with no reliable back/share UI (especially iPhone).
4. **Top nav scrolls horizontally** with no affordance — Insights is easy to miss.
5. **Export** sits outside the nav pills and looks unequal in size.
6. **Tap → route** feels ~1s delayed across nav and dashboard controls.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Nav model | **Hybrid:** bottom tabs on phone; top nav on tablet/desktop |
| Breakpoint | Phone only: **&lt;768px** (`md` and up = top nav) |
| Export placement | **Account / More** menu with email + Sign out |
| Download behavior | **Share sheet when available**; else download + confirmation |
| Performance | Reduce nav/tap lag across in-app dashboard (not a full perf audit) |
| Landing | Out of scope (already good) |

## Design

### Phone shell (&lt;768px)

- **Top:** existing `SiteHeader` logo + **Account** button (right).
- **Bottom tab bar** (fixed, safe-area aware): Home, Exercises, Tracker, Calm, Insights.
  - Icon + short label; active state uses existing aqua/teal pill language.
  - Main content gets bottom padding so tabs never cover CTAs.
- No horizontal-scrolling primary nav.

### Tablet / desktop (≥768px)

- Keep the current **top nav** with all five destinations (wrap as needed; no horizontal scroll required).
- Remove standalone Export beside nav.
- Same **Account** control on the right (email, Export actions, Sign out).

### Account menu

- Anchored so the panel stays fully on-screen (prefer `right-0` / viewport-aware positioning).
- Contents: email (read-only) → Download CSV → Download PDF → Sign out.
- Escape / outside tap closes; focus returns to Account button.

### Export download flow

1. Client `fetch`es `/api/export/csv` or `/api/export/pdf` (auth cookies).
2. Build a `File` / `Blob` from the response.
3. If `navigator.canShare?.({ files })` → `navigator.share({ files, title })`.
4. Else create an object URL, programmatic `<a download>`, revoke URL; show brief confirmation.
5. Errors stay in the menu; never navigate the current tab into a stuck viewer.

API routes already send `Content-Disposition: attachment`; iOS often ignores that for PDF — the client share/download path is the real fix.

### Tap / nav responsiveness

- Optimistic active highlight on press for tabs/links.
- Prefetch the five main app routes.
- Clear `active:` press feedback on primary buttons/cards touched in this pass.
- Light audit of obvious client blockers on dashboard screens we already open for this work.

## Non-goals

- Custom domain / PWA install prompt changes.
- Redesigning landing, auth, or exercise session UIs.
- Full performance profiling of every screen.
- Changing export data contents or formats.

## Success criteria

- On a phone: all five destinations reachable without horizontal scroll; Export menu fully readable.
- Download PDF/CSV never traps the user in a browser PDF tab with no exit.
- Tablet/desktop retain a clear top nav; Account menu works without clipping.
- Nav taps feel immediate (active state + warmer navigations).

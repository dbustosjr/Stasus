# Mobile App Shell & Export UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give the in-app dashboard a phone-native bottom tab bar, a viewport-safe Account menu for Export/Sign out, share-or-download export files, and snappier nav taps — without changing the landing page.

**Architecture:** Split chrome in `AppShell`: mobile bottom `AppTabBar` (under `md`) + desktop top nav (`md+`). Replace standalone `ExportMenu` with `AccountMenu` that fetches export blobs and uses Web Share API with download fallback. Prefetch main routes and apply optimistic active styling.

**Tech Stack:** Next.js App Router, React client components, Tailwind (`md` = 768px), existing `/api/export/*` routes, Web Share API + programmatic download.

**Design:** `docs/plans/2026-07-30-mobile-app-shell-design.md`

---

### Task 1: Export client helper (share / download)

**Files:**
- Create: `src/lib/export/client-download.ts`
- Create: `scripts/test-export-client-download.mjs` (pure helpers only)
- Modify: `package.json` (add `test:export-client` script)

**Step 1: Write failing tests for pure helpers**

Test `pickExportFilename(contentDisposition, fallback)`.

```js
// scripts/test-export-client-download.mjs
import assert from "node:assert/strict";
import { pickExportFilename } from "../src/lib/export/client-download.ts";

assert.equal(
  pickExportFilename('attachment; filename="stasus-export-2026-07-30.pdf"', "x.pdf"),
  "stasus-export-2026-07-30.pdf",
);
assert.equal(pickExportFilename(null, "fallback.csv"), "fallback.csv");
console.log("export-client-download: ok");
```

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types scripts/test-export-client-download.mjs`  
Expected: FAIL module not found

**Step 3: Implement helper**

In `src/lib/export/client-download.ts`:

- `pickExportFilename(header, fallback)` — parse `filename=` from Content-Disposition via `String.prototype.match`, not RegExp.prototype methods that confuse tooling.
- `canShareFiles(file)` — true when `navigator.share` exists and `navigator.canShare({ files: [file] })` allows it (or `canShare` is missing).
- `downloadExport(path, fallbackName)`:
  1. `fetch(path, { credentials: "same-origin" })`
  2. On failure, throw with response text
  3. Build `File` from blob + filename
  4. If shareable → `navigator.share({ files, title })` → return `"shared"`
  5. Else object-URL + temporary `<a download>` click → return `"downloaded"`

Use relative `.ts` imports if the node strip-types test needs them (same pattern as `src/lib/export/csv.ts`).

**Step 4: Run test to verify it passes**

Run: `npm run test:export-client`  
Expected: `export-client-download: ok`

**Step 5: Commit**

```bash
git add src/lib/export/client-download.ts scripts/test-export-client-download.mjs package.json
git commit -m "feat(export): add client share-or-download helper"
```

---

### Task 2: AccountMenu (replace ExportMenu)

**Files:**
- Create: `src/components/account-menu.tsx`
- Later remove: `src/components/export-menu.tsx` once unused

**Step 1: Implement `AccountMenu`**

Client component props: `{ email?: string | null }`.

UI:
- Trigger: rounded-full button labeled **Account** (same `min-h-11` / text-sm as nav pills).
- Panel: `absolute right-0 z-30 mt-2 w-[min(18rem,calc(100vw-2rem))]` so it never clips.
- Sections: email (muted) → Download CSV → Download PDF → Sign out form (`signOut` from `@/app/actions/auth`).
- Loading/disabled while export fetch runs; status/error line under actions.
- Escape + outside pointerdown close; restore focus to trigger.

Wire downloads through `downloadExport("/api/export/pdf", "stasus-export.pdf")` (and csv). Status copy: “Opening share sheet…” / “Download started.”

**Step 2: Manual sanity**

Run: `npm run dev` → `/app/tracker` → Account → panel fully visible at iPhone width.

**Step 3: Commit**

```bash
git add src/components/account-menu.tsx
git commit -m "feat(app): add Account menu with share-or-download export"
```

---

### Task 3: Bottom tab bar component

**Files:**
- Create: `src/components/app-tab-bar.tsx`

**Step 1: Implement tab bar**

Client component accepting `active: "home" | "exercises" | "tracker" | "calm" | "insights"`.

- Fixed bottom, `z-40`, border-top, `bg-[var(--stasus-bg)]`, `pb-[env(safe-area-inset-bottom)]`.
- Five `Link`s with prefetch.
- Compact icon (inline SVG) + label; active pill styling matching current nav tokens.
- Optimistic active: local state synced from `active` prop; update on pointer down before navigation completes.
- Parent wraps with `md:hidden`.

**Step 2: Commit**

```bash
git add src/components/app-tab-bar.tsx
git commit -m "feat(app): add mobile bottom tab bar"
```

---

### Task 4: Restructure AppShell

**Files:**
- Modify: `src/components/app-shell.tsx`
- Delete: `src/components/export-menu.tsx` if unused

**Step 1: Layout changes**

Phone:
- Under header: `AccountMenu` right-aligned only (no separate Export / always-visible Sign out strip).
- Render `<AppTabBar active={active} />`.
- Main padding: `pb-24 md:pb-0` so content clears tabs.

Desktop (`md+`):
- Top nav links Home…Insights with prefetch.
- Optional truncated email + `AccountMenu` (Export + Sign out inside).
- Hide tab bar.

Extract a small client `AppNav` if optimistic active needs client state while shell stays mostly server.

**Step 2: Visual check**

- Under 768px: bottom tabs, no horizontal nav, Account top-right.
- 768px+: top nav, no bottom tabs, Export only inside Account.

**Step 3: Commit**

```bash
git add src/components/app-shell.tsx src/components/export-menu.tsx
git commit -m "feat(app): hybrid phone bottom tabs and desktop top nav"
```

---

### Task 5: Touch feedback + prefetch polish

**Files:**
- Modify: `src/components/app-tab-bar.tsx`, nav pieces in shell
- Modify primary dashboard CTAs where lag is obvious:
  - `src/app/app/tracker/page.tsx`
  - `src/app/app/page.tsx`
- Align press classes with existing Sign out (`active:scale-[0.98]`).

**Step 1:** Confirm five destinations use Next `Link` (prefetch on).  
**Step 2:** Add press feedback on main in-app CTAs above.  
**Step 3: Commit**

```bash
git commit -m "perf(app): snappier nav active state and press feedback"
```

---

### Task 6: Verify

**Step 1: Run**

```bash
npm run test:export-client
npm run test:export-csv
npm run build
```

Expected: tests ok, build succeeds.

**Step 2: Manual phone checklist**

- [ ] Bottom tabs show all five destinations without scrolling
- [ ] Account menu fully on-screen; CSV/PDF distinguishable
- [ ] PDF share sheet or download — user can return to app
- [ ] Desktop top nav intact; Export not a mis-sized sibling tab
- [ ] Nav active state updates immediately on tap

**Step 3:** Commit leftover fixes. Redeploy to InsForge Sites only if the user asks.

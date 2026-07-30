# Data Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Export menu next to Insights that downloads the user’s symptom logs (incl. archived) and practice sessions as CSV or PDF.

**Architecture:** Client `ExportMenu` in `AppShell`. Auth’d route handlers load owner data via InsForge SSR client and return attachment responses. Shared export builders for CSV and PDF.

**Tech Stack:** Next.js App Router route handlers, InsForge SSR auth, `pdf-lib` for PDF.

**Design doc:** `docs/plans/2026-07-30-data-export-design.md`

---

### Task 1: Shared export data + CSV builder

**Files:**
- Create: `src/lib/export/types.ts`
- Create: `src/lib/export/fetch-export-data.ts`
- Create: `src/lib/export/csv.ts`
- Create: `scripts/test-export-csv.mjs`

### Task 2: PDF builder

**Files:**
- Add dep: `pdf-lib`
- Create: `src/lib/export/pdf.ts`

### Task 3: API routes

**Files:**
- Create: `src/app/api/export/csv/route.ts`
- Create: `src/app/api/export/pdf/route.ts`
- Create helper: `src/lib/export/require-export-user.ts` (401 if no session)

### Task 4: ExportMenu + AppShell

**Files:**
- Create: `src/components/export-menu.tsx`
- Modify: `src/components/app-shell.tsx`

### Task 5: Verify

- CSV unit test; typecheck; manual download while signed in

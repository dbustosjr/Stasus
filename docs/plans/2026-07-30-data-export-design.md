# Data export (CSV / PDF) — design

**Date:** 2026-07-30  
**Status:** Approved  
**Approach:** A — Server download routes + Export menu next to Insights

## Goal

Let signed-in users download their symptom logs and practice sessions as CSV or PDF from the app nav.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Scope (user-facing) | Symptom logs + practice sessions |
| Archived logs | Included (with archived flag) |
| AI insights | Out of scope (later Care Team full export) |
| UI | Export control next to Insights → menu: CSV / PDF |
| Generation | Auth’d `GET` routes stream files |

## Placement & interaction

- App shell nav: **Export** after Insights (same pill style, not “active page” fill)
- Menu: Download CSV · Download PDF
- Helper: “Your symptom logs and practice sessions. Includes archived entries.”
- A11y: `aria-expanded` / `aria-haspopup`; Escape closes; focus returns to Export

## File contents

**Symptom logs:** logged_at, severity, duration_minutes, triggers, notes, archived (yes/no)  
**Practice sessions:** completed_at, exercise title, duration_seconds, notes  

**CSV:** one file with two labeled sections  
**PDF:** cover line (Stasus export, date, email) + tables + wellness disclaimer footer  
**Filenames:** `stasus-export-YYYY-MM-DD.csv|.pdf`

## Architecture

- `GET /api/export/csv` · `GET /api/export/pdf`
- InsForge server client; unauthenticated → 401
- Owner RLS load; join sessions → exercise title
- CSV: string builder; PDF: `pdf-lib`
- Soft row caps (~5,000 per table) for safety

## Out of scope

- Insights / activity / Care Team portal export
- Email delivery, date-range picker, zip of multiple files

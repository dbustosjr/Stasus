# DESIGN.md

Durable visual system for Stasus (from PRD §5 + official brand assets).

## Mode

Surfaces default to **Operate** inside the app; marketing/home is **Persuade**, still calm and motion-safe.

## Color

| Token | Light | Dark use |
|-------|-------|----------|
| Deep Teal | `#014152` | headings/buttons → aqua-forward accents on dark |
| Secondary Teal | `#056179` | hover / active |
| Soft Aqua | `#7FB8B1` | calm progress; primary accent on dark |
| Warm Gold | `#E59B35` | milestones only — never warnings |
| Mist / base | `#FFFFFF` / `#F6FAFA` | dark base `#001219` / surface `#062A34` |
| Cool Border | `#DDEBEC` | dark border `#0D3D4A` |

## Typography

**Manrope** — 700 headings, 400–500 body, 600 buttons, 500 labels.

## Motion

Reduced-motion is the design default: no aggressive parallax, no autoplay backgrounds. Honor `prefers-reduced-motion`.

## Brand assets

Use files in `/public/brand/` — light and dark lockups, marks, and wordmarks. Do not invert PNGs with CSS filters.

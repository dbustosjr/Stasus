# DESIGN.md

Durable visual system for Stasus (from PRD §5 + official brand assets).

## Mode

**Dark only.** The product ships a single dark palette — no light theme or theme toggle.

Surfaces default to **Operate** inside the app; marketing/home is **Persuade**, still calm and motion-safe.

## Color

| Token | Value | Use |
|-------|-------|-----|
| Base / mist | `#001219` | Page background |
| Surface | `#062A34` | Panels, inputs |
| Border | `#0D3D4A` | Dividers, outlines |
| Ink | `#E8F4F4` | Primary text |
| Ink muted | `#9EC9C6` | Secondary text |
| Soft Aqua | `#7FB8B1` | Accents, primary buttons, links |
| Warm Gold | `#E59B35` | Milestones only — never warnings |
| Deep teal (hero) | `#014152` / `#012833` | Marketing gradients only |

## Typography

- **Fraunces** — display headlines on marketing and select app titles (warm, human, editorial).
- **Manrope** — UI body, labels, buttons (400–700).

Avoid generic “AI SaaS” centered card stacks on the landing page; prefer confident short headlines, editorial lists, and full-bleed brand atmosphere.

## Motion

Reduced-motion is the design default: no aggressive parallax, no autoplay backgrounds. Honor `prefers-reduced-motion`.

## Brand assets

Use files in `/public/brand/` — prefer dark lockups/marks on the dark UI. Do not invert PNGs with CSS filters.

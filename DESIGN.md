# test1, design direction

## What this is

A one-file habit tracker. One person, one browser, one list of habits to tick once a day. Everything lives in `index.html`: markup, Tailwind utilities in `class`, and an inline script.

## Direction

A paper habit card, shrunk to a single column. The card is the page: white on pale ground, one indigo action, progress read as a bar rather than a scoreboard. The interface should feel like the thing you tick before bed, so nothing is loud except the check that completes the list. This is a utility app, not a product surface, and the layout is deliberately one column at every width.

## Palette

Tailwind defaults loaded from the CDN; there are no CSS custom properties in this repo.

| token | value | use |
|---|---|---|
| ground | `slate-50` `#f8fafc` | page background |
| surface | `white` `#ffffff` | the habit card |
| `fg` | `slate-800` `#1e293b` | the app name, 14.63:1 on white |
| body | `slate-700` `#334155` | habit names, 10.35:1 on white |
| `muted` | `slate-600` `#475569` | stats label, streak, empty state, 7.58:1 on white |
| `accent` | `indigo-600` `#4f46e5` | add button, progress bar, focus rings, 6.29:1 on white |
| `streak` | `orange-600` `#ea580c` | the flame and its day count only, 3.56:1 (icon scale, needs 3:1) |

`slate-400` (`#94a3b8`, 2.56:1 on white) previously carried the empty state, the streak and both row buttons. It is gone; nothing lighter than `slate-600` carries text.

## Type

- Everything: Inter from Google Fonts, `400`/`600`/`700`. It is a plain reading face and the page has no typographic argument to make.
- Scale: `text-2xl` (24px) app name, `text-sm` (14px) stats and streak, `text-xs` (12px) footer action labels. Nothing below 12px.

## Dial

```
ENERGY  1   /* one card, one accent, no ornament */
RHYTHM  1   /* a checkbox list is uniform by nature */
MOTION  1   /* hover, focus and a 500ms progress-bar width transition */
```

## Motion

The progress bar animates its width over 500ms so a tick reads as movement rather than a jump. `canvas-confetti` fires once when the last habit is ticked, and only then. Hover and focus transitions are CSS. No `prefers-reduced-motion` block exists yet: if one is added, it must silence the confetti first and the bar transition second.

## Allowed

- A single `rounded-2xl` card with one soft shadow; it is the one surface, so it earns the elevation.
- Uppercase 14px stats label with wide tracking, as a ledger divider rather than a heading.
- Lucide icons, one per verb (add, tick, flame, edit, delete), each paired with an `aria-label` or visible label.
- The confetti burst, because completing every habit that day is a real event with a real trigger.

## Forbidden

- Prefilled sample habits. The list starts empty and says so.
- Any invented streak, percentage or completion count. Every number is computed from the rows on screen.
- A second view, an account, a sync claim. There is no backend.
- A decorative gradient, orb, grid or glow.
- Text lighter than `slate-600`.
- Row actions that exist only on hover; `max-sm:opacity-100` keeps them reachable on touch.
- Untargeted focus: every control either shows a `focus-visible` ring or has `outline: none` replaced by one.
- Em dash in shipped copy.

## Where it lives

`index.html`, top to bottom: the CDN `<script>` tags and one inline `<style>` block hold the only CSS outside Tailwind utilities; the classes on each element are the entire design system.

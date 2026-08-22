# Design

## Aesthetic lane

**The exhibition catalogue for a large-format landscape survey.** Not a magazine, not a
tourism board, not a booking engine. Photographs printed large on a dark basalt ground, with
a wide grotesque set at horizon width for headings and a text serif reserved for the body —
deliberately inverting the display-serif editorial fingerprint.

## Theme

**Dark-committed, with a meaningful second ground.**

The scene: someone at 11pm in a northern-hemisphere winter, room lit only by the screen,
looking at photographs of a continent that is mostly empty. That forces dark.

Two grounds carry meaning, not decoration:

| Ground | Token scope | Where it is used | Why |
|---|---|---|---|
| **Night** (basalt) | `:root`, `.ground--night` | Hero, regions, experiences, journal, itinerary story | Looking. Photographs sit on black the way prints sit on gallery walls. |
| **Day** (saltpan) | `.ground--day` | Seasons, practicalities, planning, forms, footer nav | Preparing. Information wants daylight and long-form legibility. |

`.ground--day` re-declares the semantic tokens only; no component knows which ground it is on.
`color-scheme: dark` is declared explicitly — this is an identity, not a system preference.

## Color

Strategy: **Committed.** One saturated colour — iron-oxide ochre — carries the brand across
both grounds. Deliberately *not* teal-and-orange: the second hue is a deep night indigo used
once, as a field, never as a UI accent.

### Primitives (OKLCH)

```
--basalt-950  oklch(0.145 0.008 44)   page ground, night
--basalt-900  oklch(0.190 0.010 44)   surface
--basalt-800  oklch(0.245 0.012 44)   raised surface
--basalt-700  oklch(0.320 0.014 44)   hairlines on night
--basalt-500  oklch(0.520 0.014 44)   disabled ink

--saltpan-50  oklch(0.972 0.004 70)   page ground, day
--saltpan-100 oklch(0.940 0.006 70)   surface on day
--saltpan-200 oklch(0.888 0.008 70)   hairlines on day

--ochre-600   oklch(0.560 0.150 42)   ochre on light ground (AA on saltpan)
--ochre-500   oklch(0.655 0.180 44)   brand primary
--ember-400   oklch(0.775 0.150 66)   sunlit rim, hover
--indigo-900  oklch(0.225 0.058 268)  night-sky field (one section only)
```

### Semantic roles

`--ground`, `--surface`, `--raised`, `--line`, `--ink`, `--ink-muted`, `--ink-faint`,
`--brand`, `--brand-ink` (brand colour that is legible as text on the current ground),
`--on-brand`, `--focus`.

Every pair is contrast-verified in `tools/contrast.py`; body text ≥ 4.5:1 on both grounds.

## Typography

Two families on a real contrast axis. Neither is a training-data default.

- **Display — `Archivo` variable, width axis 100–125.** Width *is* the semantic: headings
  stretch toward the horizon. Weights 500–700, letter-spacing floor −0.035em.
- **Body — `Source Serif 4` variable (opsz).** Serif lives in the body only. Line-height
  1.65 on night (light-on-dark needs the extra air), 1.6 on day.
- No monospace. It would read as costume on a landscape brand.

Scale: fluid `clamp()`, ratio ≥ 1.25.

```
--step--1  clamp(0.83rem, 0.80rem + 0.15vw, 0.92rem)
--step-0   clamp(1.02rem, 0.98rem + 0.20vw, 1.13rem)
--step-1   clamp(1.28rem, 1.20rem + 0.40vw, 1.55rem)
--step-2   clamp(1.60rem, 1.44rem + 0.80vw, 2.15rem)
--step-3   clamp(2.00rem, 1.70rem + 1.50vw, 3.05rem)
--step-4   clamp(2.40rem, 1.90rem + 2.55vw, 4.20rem)
--step-5   clamp(2.85rem, 2.00rem + 4.40vw, 5.60rem)   /* ceiling below 6rem */
```

Body copy capped at 68ch. `text-wrap: balance` on h1–h3, `pretty` on prose.

## Layout

- Content rail: `min(100% - 2 * var(--gutter), 1360px)`, plus a `--w-text` 68ch rail and a
  `--w-wide` 1600px rail for full-bleed photography.
- Asymmetric region grid — sizes vary by editorial weight; identical card grids are banned.
- Spacing scale 4 → 160px, applied with deliberate rhythm (tight groupings inside sections,
  generous separations between them).
- z-index is a named scale: `--z-base/sticky/header/overlay/modal/toast`.

## Motion

Materials: `transform`, `opacity`, `clip-path`, `filter: blur`, and scrim opacity. Easing is
`--ease-out-quint` / `--ease-out-expo`. No bounce, no elastic.

- **Everything renders visible without JavaScript.** Reveals are opt-in: `html.js` enables
  the hidden start state, an IntersectionObserver adds `.is-in`, and a 1.2s failsafe reveals
  everything if the observer never fires.
- Hero: scrim and headline lines rise once on load in a short choreographed stagger; the
  photograph is never hidden.
- Section reveals are *varied*, not one uniform fade — the region grid staggers by index,
  pull-quotes wipe with `clip-path`, the horizon rule draws with `scaleX`.
- `prefers-reduced-motion: reduce` → all of it collapses to the final state instantly.

## Imagery

Photography from Wikimedia Commons, every URL HTTP-verified at build time, each with an
accurate credit and licence in a `data-credit` attribute rendered into the figure. Alt text
is written in brand voice and names the actual place.

`aspect-ratio` is declared on every image box so nothing shifts (CLS < 0.1); `loading="lazy"`
and `decoding="async"` everywhere except the hero, which is `fetchpriority="high"`.

## Components

`site-header` (scrim, not glass) · `hero` (scroll cue sits vertically at the right edge,
never centred) · `plate` (asymmetric region grid) · `region` (alternating, with an unequal
secondary pair) · `band` / `panorama` (full-bleed, parallax) · `row` (experience index,
filterable) · `season` (six Bininj/Mungguy seasons) · `stage` (numbered — a real sequence)
· `deflist` (definition list, not cards) · `grid-table` (month × region, sticky row headers,
caption mirrored outside the scroller) · `form` · `site-footer`.

## Bans in force

Side-stripe borders · gradient text · decorative glassmorphism · hero-metric template ·
identical card grids · uppercase tracked eyebrow above every section · 01/02/03 section
scaffolding · emoji as icons · zero-imagery sections · text overflowing its container at any
breakpoint.

# Southern Light — a field guide to Australia

A five-page static website about travel and experience in Australia. No build step, no
dependencies, no framework: open `index.html` and it works.

```
index.html          The continent — hero, eight regions, five experiences, the calendar
destinations.html   Eight regions in depth, with a sticky region index
experiences.html    18 experiences, filterable by how you spend the day
itineraries.html    Four routes written day by day, plus a six-week version
plan.html           Six seasons, month × region table, distances, Country, safety, enquiry

assets/css/site.css Design system + every component (one file, ~1,000 lines)
assets/js/site.js   Progressive enhancement only (~250 lines, no dependencies)
assets/img/         103 optimised WebP files at 3 widths each (~12 MB total on disk)
assets/img-manifest.json   Source dimensions, aspect ratios and per-photo credits

PRODUCT.md          Register, users, brand personality, anti-references, principles
DESIGN.md           Theme, palette, type, layout, motion, component inventory
```

## Run it

```bash
python -m http.server 8577
# then open http://127.0.0.1:8577/
```

A plain `file://` open also works, though the browser will treat each page as a separate
origin. Any static host (Netlify, Pages, S3, nginx) serves it as-is — there is nothing
to compile.

## Design system in one paragraph

Two **grounds** carry meaning rather than decoration: *night* (basalt `oklch(0.145 0.008 44)`)
for looking at photographs, *day* (saltpan `oklch(0.972 0.004 70)`) for planning. Ground is
a scope class — `.ground--day` re-declares the semantic tokens and no component knows which
ground it is on. One committed brand colour, iron-oxide ochre, carries both. Type is
**Archivo** at width axis 118 for headings (width is the semantic — headings stretch toward
the horizon) and **Source Serif 4** in the body only, which inverts the usual display-serif
editorial fingerprint. Every colour pair is contrast-verified; the ratios are noted inline in
`site.css`.

## Accessibility

WCAG 2.2 AA was verified against the rendered pages, not just intended:

- Zero contrast failures on text over solid backgrounds, on both grounds. Text over
  photography always sits on an explicit scrim.
- All 14 first tab stops show a visible focus ring; skip link on every page.
- `prefers-reduced-motion: reduce` collapses every reveal, parallax and animation.
- **Nothing is gated behind a transition.** Without JavaScript every page renders fully;
  with JavaScript an IntersectionObserver drives the reveals and a 1.4 s failsafe reveals
  everything if the observer never fires (hidden tab, prerender, headless).
- The month × region table never uses colour alone — every cell carries its own text label.
- No horizontal page scroll at 375 / 768 / 1024 / 1440; wide content scrolls inside its own
  container with an edge-fade affordance.

## Imagery

All 40 photographs come from Wikimedia Commons under CC BY-SA / CC BY / CC0, downloaded once
and re-encoded locally to WebP at three widths. Author and licence are shown next to each
image, as those licences require. `assets/img-manifest.json` holds the full provenance.

Two things worth knowing if you re-fetch them:

- Commons now rejects arbitrary thumbnail widths with HTTP 400 — only its standard buckets
  (1280 px, 1920 px) render reliably, and bursts get 429-rate-limited. Download once and
  resize locally rather than hotlinking.
- Hotlinking `upload.wikimedia.org` at scale is discouraged by the Wikimedia Foundation,
  which is the other reason the assets are local.

## Wiring the enquiry form

`plan.html` ships a fully validated, accessible form with a front-end only submit handler —
it reports success without transmitting anything, and says so on screen. To make it real,
give the `<form data-enquiry>` element an `action` and `method` pointing at your handler
(Formspree, Netlify Forms, or your own endpoint) and delete the `e.preventDefault()` branch
in the submit listener in `assets/js/site.js`.

## Content accuracy

Distances, park areas, seasons and closure rules are real. The six-season calendar is the one
published by the Bininj and Mungguy Traditional Owners of Kakadu with Parks Australia. Before
publishing commercially, re-check anything operational — park access rules, tour licensing
and road closures change between seasons.

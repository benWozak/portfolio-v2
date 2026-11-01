# 11 — Globe pins: design spec

Date: 2026-11-01. Status: approved by the owner after a visual brainstorm (mockups in `.superpowers/brainstorm/`, gitignored). Implementation plan: `11-globe-pins.md`.

## Problem

The cobe 2 upgrade (chunk 10, Tier 2) changed how the four location markers on the About globe render. cobe 2 raises markers off the surface by default (`markerElevation` defaults to `0.05`) and draws them as domes, so the former small dots now look like large spheres. The owner wants the markers replaced with map pins that show the city name on hover.

## Goal

Four pins on the About globe, one per city, each with a hover label:

| id | label | location |
|---|---|---|
| `yvr` | Vancouver, BC | 49.2827, -123.1207 |
| `yyc` | Calgary, AB | 51.0447, -114.0719 |
| `den` | Denver, CO | 39.7392, -104.9903 |
| `san` | San Diego, CA | 32.715736, -117.161087 |

## Chosen look (mockup "Focus pins with Callout labels")

- **Pin.** Solid teardrop in the existing marker orange (`#fb6415`) with a white core, 14 px tall, tip on the city. At rest it is at 75% opacity.
- **Hover.** The hovered pin goes to 100% and scales to 1.25 from its tip; the other three dim to 30%. A 1 px elbow line (up-and-right diagonal, then horizontal, 64 × 36 box) draws itself out from the pin head over 0.35 s. The label appears at the end of the horizontal run: 11 px, uppercase, letter-spacing 0.14em, foreground colour.
- **Behind the globe.** Pins fade and blur out as their city rotates away, driven by cobe's visibility variable, and come back the same way.
- **Touch screens** (`@media (hover: none)`): every line and label is always visible; no dimming or scaling.
- **Reduced motion**: no draw or scale transitions; states switch instantly.
- **Themes.** Label uses `hsl(var(--foreground))`, line uses `hsl(var(--primary))`, pin stays `#fb6415`. In dark mode only the canvas is inverted, never the pins.

## Mechanism

cobe 2 "bindable markers": a marker with an `id` gets a 1 × 1 px absolutely positioned anchor element inside cobe's wrapper div, named `--cobe-<id>`, plus a `:root` custom property `--cobe-visible-<id>` that is 1 while the point faces the viewer and 0 otherwise. Pins use CSS anchor positioning (`position-anchor`, `left: anchor(center)`, `top: anchor(center)`) and multiply their opacity by the visibility variable. No per-frame JavaScript beyond the existing `update({ phi })` loop.

Rejected alternative: projecting lat/long to screen in JavaScript each frame. It would work in older browsers but duplicates cobe's projection and is easy to misalign.

**Fallback.** Browsers without anchor positioning (`@supports not (anchor-name: --x)`) hide the pin layer entirely. cobe's own small dots (size 0.02, elevation 0) remain visible, so nothing is broken there.

## Changes

- `src/components/magicui/globe.tsx`
  - `GLOBE_PINS: { id, label, location }[]` holds the table above. `GLOBE_CONFIG.markers` is derived from it with `size: 0.02`, and `GLOBE_CONFIG.markerElevation` is `0` (this alone fixes the spheres).
  - After the canvas, render `<ul className="globe-pins" aria-label="Places I have worked">` with one `<li className="globe-pin">` per pin. Each `li` carries inline `style={{ positionAnchor: "--cobe-<id>", "--v": "var(--cobe-visible-<id>, 0)" }}` and contains: the pin SVG (`.globe-pin-icon`), the elbow-line SVG (`.globe-pin-lead`, path `M8 36 L20 12 H60`), and `<span className="globe-pin-label">`.
  - The canvas gets `dark:invert`; About.tsx drops it from the Globe wrapper.
  - The pin list must be a later sibling of cobe's wrapper inside the Globe's relative container, and must not itself be positioned, so the anchors are inside the pins' containing block (a requirement of anchor positioning). The existing unwrap-on-unmount cleanup is unchanged.
- `src/app/globals.css`: a `.globe-pin*` block inside `@layer components` implementing the look above, with the `hover: none`, `prefers-reduced-motion` and `@supports not` branches.
- `src/components/content/About.tsx`: remove `dark:invert` from `<Globe className=…>`.
- `src/__tests__/components/magicui/Globe.test.tsx`: assert markers carry the four ids and `markerElevation: 0`; four `li.globe-pin` render with the labels; each has `position-anchor: --cobe-<id>`; the list is a sibling after cobe's wrapper. Existing tests stay green.
- `planning/10-dependency-upgrades.md` Tier 5: note that the `.globe-pin*` block moves out of `@layer components` with the `.prose` block when Tailwind 4 lands.
- `CLAUDE.md` Conventions: one line on how the globe pins are bound.

## As built (2026-11-01)

Differences from the sections above, found during implementation and review:

- **cobe's visibility variable is not 1/0.** cobe 2.0.1 sets `--cobe-visible-<id>` to the literal token `N` while the point faces the viewer and deletes it otherwise. `globals.css` registers `--pin-visible` with `@property { syntax: "<number>"; inherits: false; initial-value: 1 }`, so the token normalises to 1 and the absent case (inline fallback) to 0.
- **Pins rest at full opacity and siblings do not dim on hover.** Because of the point above, the mockups never rendered the "75% at rest, dim to 30%" CSS; what the owner approved on screen was full-opacity pins with the lift, line and label, so that is what shipped. The 75%/dim variant is a three-line change recorded in the plan's hand-off.
- **Inline properties** are `--pin-anchor` and `--pin-visible` (React writes custom properties through `setProperty`, which jsdom records); the CSS reads `position-anchor: var(--pin-anchor)`.
- **The CSS block is unlayered** at the end of `globals.css` (`@property`, `@container` and `@supports` blocks are not utilities Tailwind 3 can layer).
- **Only the icon is a hit target** (`pointer-events` off on the pin, on for the icon, off again for hidden pins via `@container style(--pin-visible: 0)`), and the canvas captures the pointer on pointerdown so a drag that crosses a pin continues.
- **Vancouver's label sits on the left** (`side: "left"` → `data-side`), because it is 2° from Calgary and the always-on touch labels overlapped.
- **The leader line has `max-width: none`**: `src/styles/normalization.css` sets `svg { max-width: 100% }`, which had collapsed the 64px lead to the 14px width of the pin.
- **No-anchor fallback keeps the list for screen readers** (visually hidden), rather than `display: none`.
- **Known limitation:** About's wrapper is `overflow-hidden` and only 320px wide, so a label is clipped when its pin is within ~120px of the right edge (Vancouver: left edge), roughly the outer third of each city's visible arc. Owner decision pending; options in the plan's hand-off.

## Out of scope

Tap-to-toggle labels, keyboard focus on pins, arcs between cities, changing the globe's size, rotation speed or colours.

## Acceptance

- `npm run test:run`, `npx tsc --noEmit`, `npm run lint`, `npm run build` green.
- On `/` in Chrome and Safari, both themes: four small pins, hover shows the elbow line and label, others dim, pins fade behind the globe, drag still works.
- At a phone width in device emulation (touch, no hover): all four labels visible.

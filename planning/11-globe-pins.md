# 11 — Globe pins: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (fresh implementer per task, spec review, then code-quality review). Steps use checkbox (`- [ ]`) syntax for tracking. **Nobody but the orchestrator runs `git add`, `git commit` or `git push`; implementers and reviewers never do.** Read `CLAUDE.md` and `planning/11-globe-pins-spec.md` first.

**Goal:** Replace the four cobe markers on the About globe with DOM map pins that show the city name on hover (always on touch), bound to the globe through cobe 2's bindable markers and CSS anchor positioning.

**Architecture:** `globe.tsx` derives cobe markers (with ids) from a `GLOBE_PINS` list and renders a `<ul>` of pins after the canvas. cobe keeps a 1 px anchor element named `--cobe-<id>` per marker and publishes `--cobe-visible-<id>` on `:root`; each pin receives both as inline custom properties, and a plain CSS block in `globals.css` does the positioning, hover, touch, reduced-motion and no-anchor-support behaviour. No per-frame JavaScript is added.

**Tech Stack:** Next 16, React 19, cobe 2.0.1, Tailwind 3.4, Vitest 5 + Testing Library, jsdom 29.

**Branch and commits:** on `deps-upgrades`, orchestrator commits after each task passes both reviews, nothing pushed (same mode as chunk 10).

## Gate (run after every task)

```bash
rm -rf .next && npx tsc --noEmit && npm run lint && npm run test:run 2>&1 | tail -4 && npm run build 2>&1 | tail -12
```

Expected: tsc silent, lint clean, `Test Files  30 passed`, build prints the same route table as before.

## File structure

| Path | Task | Change |
|---|---|---|
| `src/components/magicui/globe.tsx` | 1 | `GLOBE_PINS`, markers derived with ids, `markerElevation: 0`, `pins` prop, pin `<ul>` after the canvas, `dark:invert` on the canvas |
| `src/__tests__/components/magicui/Globe.test.tsx` | 1 | Config assertions, structure assertions updated for the list, new `Pins` block |
| `src/app/globals.css` | 2 | Unlayered `.globe-pin*` block at the end of the file |
| `src/components/content/About.tsx` | 2 | Drop `dark:invert` from the Globe wrapper |
| `CLAUDE.md`, `planning/10-dependency-upgrades.md`, `planning/README.md`, `planning/11-globe-pins-spec.md`, this file | 3 | Convention line, Tier 5 note, status, hand-off |

---

## Task 1: Pins in the component

**Files:**
- Modify: `src/components/magicui/globe.tsx`
- Test: `src/__tests__/components/magicui/Globe.test.tsx`

Why inline custom properties rather than `position-anchor` inline: React writes `--x` properties through `style.setProperty`, which jsdom records and tests can read back; it would write `positionAnchor` as a plain JS property that jsdom ignores. The CSS in Task 2 reads them with `position-anchor: var(--pin-anchor)`.

- [x] **Step 1: Update the existing structure assertions.** In `Globe.test.tsx`:

In `'creates globe with expected configuration structure'`, add inside the `expect.objectContaining({ … })` after `glowColor: [1, 1, 1],`:

```ts
          // cobe 2 raises markers into domes by default; keep them flat and
          // tiny, they only remain as the no-anchor-support fallback.
          markerElevation: 0,
          markers: [
            expect.objectContaining({ id: 'yvr', size: 0.02 }),
            expect.objectContaining({ id: 'yyc', size: 0.02 }),
            expect.objectContaining({ id: 'den', size: 0.02 }),
            expect.objectContaining({ id: 'san', size: 0.02 }),
          ],
```

In `"unwraps the canvas from cobe's wrapper div on unmount"`, replace

```ts
      expect(canvas.parentElement).toBe(host)
      expect(host!.children).toHaveLength(1)
```

with

```ts
      expect(canvas.parentElement).toBe(host)
      // canvas, then the pin list
      expect(host!.children).toHaveLength(2)
      expect(host!.children[0]).toBe(canvas)
```

In `'has proper canvas structure'`, replace

```ts
      // One child: cobe's wrapper div, which holds the canvas
      expect(host?.children).toHaveLength(1)
      expect(canvas?.parentElement?.parentElement).toBe(host)
```

with

```ts
      // Two children: cobe's wrapper div (holding the canvas), then the pin list
      expect(host?.children).toHaveLength(2)
      expect(canvas?.parentElement?.parentElement).toBe(host)
      expect(host?.children[1].tagName).toBe('UL')
```

- [x] **Step 2: Add the pin tests.** Add a new `describe` block before `describe('Accessibility and Structure'`:

```ts
  describe('Pins', () => {
    it('renders one pin per city, in order, with its label', () => {
      const { container } = render(<Globe />)

      const pins = container.querySelectorAll('li.globe-pin')
      expect(pins).toHaveLength(4)
      expect([...pins].map((p) => p.querySelector('.globe-pin-label')!.textContent)).toEqual([
        'Vancouver, BC',
        'Calgary, AB',
        'Denver, CO',
        'San Diego, CA',
      ])
      expect(container.querySelector('ul.globe-pins')).toHaveAttribute('aria-label', 'Places I have worked')
    })

    it("binds each pin to cobe's anchor and visibility variable for its id", () => {
      const { container } = render(<Globe />)

      const pin = container.querySelector('li.globe-pin') as HTMLElement
      expect(pin.style.getPropertyValue('--pin-anchor')).toBe('--cobe-yvr')
      expect(pin.style.getPropertyValue('--pin-visible')).toBe('var(--cobe-visible-yvr, 0)')
    })

    it("places the list after cobe's wrapper, unpositioned, so the anchors share the pins' containing block", () => {
      const { container } = render(<Globe />)

      const host = container.firstElementChild!
      const list = container.querySelector('ul.globe-pins')!
      const wrapper = document.querySelector('canvas')!.parentElement
      expect(list.parentElement).toBe(host)
      expect(list.previousElementSibling).toBe(wrapper)
      expect(list.className).toBe('globe-pins')
    })

    it('contains the pin icon, the leader line and the label in each pin', () => {
      const { container } = render(<Globe />)

      const pin = container.querySelector('li.globe-pin')!
      expect(pin.querySelector('svg.globe-pin-icon')).toHaveAttribute('aria-hidden', 'true')
      expect(pin.querySelector('svg.globe-pin-lead path')).toHaveAttribute('d', 'M8 36 L20 12 H60')
      expect(pin.querySelector('span.globe-pin-label')).toBeInTheDocument()
    })

    it('inverts only the canvas in dark mode, never the pins', () => {
      const { container } = render(<Globe />)

      expect(document.querySelector('canvas')).toHaveClass('dark:invert')
      expect(container.querySelector('ul.globe-pins')).not.toHaveClass('dark:invert')
    })

    it('accepts a custom pin list', () => {
      const { container } = render(
        <Globe pins={[{ id: 'nyc', label: 'New York, NY', location: [40.7128, -74.006] }]} />,
      )

      const pins = container.querySelectorAll('li.globe-pin')
      expect(pins).toHaveLength(1)
      expect(pins[0].textContent).toBe('New York, NY')
      expect((pins[0] as HTMLElement).style.getPropertyValue('--pin-anchor')).toBe('--cobe-nyc')
    })
  })
```

- [x] **Step 3: Run the file to see the new tests fail**

```bash
npx vitest run src/__tests__/components/magicui/Globe.test.tsx 2>&1 | tail -15
```

Expected: the config test fails on `markerElevation`/`markers`, both structure tests fail on child count, and the six `Pins` tests fail (no `li.globe-pin`; `pins` prop is a type error, which Vitest reports as a failure or tsc does in Step 5).

- [x] **Step 4: Implement in `globe.tsx`.**

Replace the `GLOBE_CONFIG` block (lines 11–30, from `const GLOBE_CONFIG: COBEOptions = {` to `};`) with:

```tsx
export type GlobePin = {
  /** Used for the cobe anchor name `--cobe-<id>`; letters, digits and dashes only. */
  id: string;
  label: string;
  /** [latitude, longitude] */
  location: [number, number];
};

export const GLOBE_PINS: GlobePin[] = [
  { id: "yvr", label: "Vancouver, BC", location: [49.2827, -123.1207] },
  { id: "yyc", label: "Calgary, AB", location: [51.0447, -114.0719] },
  { id: "den", label: "Denver, CO", location: [39.7392, -104.9903] },
  { id: "san", label: "San Diego, CA", location: [32.715736, -117.161087] },
];

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  // cobe 2 raises markers into domes by default. Keep them flat and tiny: the
  // DOM pins below sit on top of them, and the dots are all that shows in a
  // browser without CSS anchor positioning.
  markerElevation: 0,
  markers: GLOBE_PINS.map(({ id, location }) => ({ id, location, size: 0.02 })),
};
```

Change the component signature to accept `pins`:

```tsx
export function Globe({
  className,
  config = GLOBE_CONFIG,
  pins = GLOBE_PINS,
}: {
  className?: string;
  config?: COBEOptions;
  pins?: GlobePin[];
}) {
```

Replace the returned JSX (from `return (` to the end of the function) with:

```tsx
  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        aria-hidden="true"
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size] dark:invert",
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      {/*
        cobe 2 keeps a 1px anchor named --cobe-<id> for every marker with an id
        and sets --cobe-visible-<id> on :root (1 facing the viewer, 0 behind).
        Each pin gets both as custom properties; src/app/globals.css positions
        it with CSS anchor positioning. The list must stay an unpositioned
        sibling after cobe's wrapper so the anchors are inside the pins'
        containing block.
      */}
      <ul className="globe-pins" aria-label="Places I have worked">
        {pins.map(({ id, label }) => (
          <li
            key={id}
            className="globe-pin"
            style={
              {
                "--pin-anchor": `--cobe-${id}`,
                "--pin-visible": `var(--cobe-visible-${id}, 0)`,
              } as CSSProperties
            }
          >
            <svg className="globe-pin-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#fb6415"
                d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"
              />
              <circle cx="12" cy="10" r="3" fill="#fff" />
            </svg>
            <svg className="globe-pin-lead" viewBox="0 0 64 36" aria-hidden="true">
              <path d="M8 36 L20 12 H60" />
            </svg>
            <span className="globe-pin-label">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Change the React import at the top to `import { useEffect, useRef, type CSSProperties } from "react";` (the file does not import the `React` namespace, so the cast above uses the named type).

- [x] **Step 5: Run the file, then tsc and lint**

```bash
npx vitest run src/__tests__/components/magicui/Globe.test.tsx 2>&1 | tail -6
rm -rf .next && npx tsc --noEmit && npm run lint
```

Expected: 18 tests pass; tsc silent; lint clean (no `react/no-unknown-property` or a11y complaints: `aria-hidden` on SVG is valid).

- [x] **Step 6: Gate.**

Commit: `feat(globe): city pins bound to cobe 2 anchors, flat small markers`

---

## Task 2: Styles and the theme fix

**Files:**
- Modify: `src/app/globals.css` (append at the end, after `@layer utilities { … }`)
- Modify: `src/components/content/About.tsx:17`

- [x] **Step 1: Append the pin styles to `globals.css`.** Unlayered on purpose: Tailwind 3 drops rules inside `@layer components` whose selectors it cannot match to class names in the content files, and nothing here needs to be overridable by a utility.

Two facts found in review that shape this CSS:
- cobe 2.0.1 sets `--cobe-visible-<id>` to the literal token `N` while the point faces the viewer and deletes it otherwise (its README says 1/0; the bundle says `N`). `@property` registers `--pin-visible` as a `<number>` with initial value 1, so the token normalises to 1 and the absent case to the inline fallback 0. Without that, any `calc()` on it silently resolves to the property's initial value.
- Because of the above, the brainstorm mockups never rendered the "75% at rest, dim siblings on hover" part; what the owner approved was full-opacity pins with the lift, line and label. Build that. (The 75%/dim variant is a two-line change recorded in the hand-off.)

```css

/* About globe pins (src/components/magicui/globe.tsx). cobe 2 keeps a 1px
   anchor named --cobe-<id> per marker and sets --cobe-visible-<id> on :root
   (1 while the point faces the viewer, 0 behind). Each pin receives both as
   inline custom properties (--pin-anchor, --pin-visible). Unlayered: Tailwind
   3 would drop layered rules it cannot match to a class in the content files. */
.globe-pins {
  pointer-events: none;
}

/* cobe writes a non-numeric token while visible and nothing while hidden;
   registering the property turns that into 1 / 0 (the inline fallback). */
@property --pin-visible {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

.globe-pin {
  position: absolute;
  position-anchor: var(--pin-anchor);
  left: anchor(center);
  top: anchor(center);
  translate: -50% -100%; /* tip of the pin on the city */
  pointer-events: auto;
  opacity: var(--pin-visible);
  filter: blur(calc((1 - var(--pin-visible)) * 6px));
  transition:
    opacity 0.25s,
    filter 0.25s;
}

.globe-pin-icon {
  display: block;
  width: 14px;
  height: 14px;
  transform-origin: 50% 100%;
  transition: transform 0.2s;
}

/* Elbow leader line: from the pin head up-and-right, then flat to the label. */
.globe-pin-lead {
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 64px;
  height: 36px;
  translate: -8px 0;
  overflow: visible;
}

.globe-pin-lead path {
  fill: none;
  stroke: hsl(var(--primary));
  stroke-width: 1;
  stroke-dasharray: 90;
  stroke-dashoffset: 90;
  transition: stroke-dashoffset 0.35s ease-out;
}

.globe-pin-label {
  position: absolute;
  left: calc(50% + 12px);
  bottom: calc(100% + 31px);
  white-space: nowrap;
  color: hsl(var(--foreground));
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s 0.2s;
}

@media (hover: hover) {
  .globe-pin:hover {
    z-index: 1;
  }
  .globe-pin:hover .globe-pin-icon {
    transform: scale(1.25);
  }
  .globe-pin:hover .globe-pin-lead path {
    stroke-dashoffset: 0;
  }
  .globe-pin:hover .globe-pin-label {
    opacity: 1;
  }
}

/* No hover on touch screens: lines and labels stay on. */
@media (hover: none) {
  .globe-pin-lead path {
    stroke-dashoffset: 0;
  }
  .globe-pin-label {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .globe-pin,
  .globe-pin-icon,
  .globe-pin-lead path,
  .globe-pin-label {
    transition: none;
  }
}

/* Without CSS anchor positioning the pins cannot be placed; cobe's own small
   dots remain. Keep the list for screen readers (visually hidden, not
   display: none). */
@supports not (anchor-name: --x) {
  .globe-pins {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
```

- [x] **Step 2: Stop inverting the pins.** In `About.tsx` change

```tsx
            <Globe className='top-0 md:top-4 dark:invert' />
```

to

```tsx
            <Globe className='top-0 md:top-4' />
```

(The canvas now carries `dark:invert` itself, from Task 1.)

```bash
grep -rn "dark:invert" src   # expect: only globe.tsx (and its test)
```

- [x] **Step 3: Build and confirm the CSS survived Tailwind and the production minifier**

```bash
rm -rf .next && npm run build 2>&1 | tail -6
grep -o "position-anchor:var(--pin-anchor)" .next/static/css/*.css | head -1
grep -o "anchor(center)" .next/static/css/*.css | head -1
grep -o "@property --pin-visible{[^}]*}" .next/static/css/*.css | head -1
grep -c "globe-pin" .next/static/css/*.css
```

Expected: build green; the three greps print a match (the `@property` rule must survive minification with its `syntax`, `inherits` and `initial-value`); the count is at least 10.

- [x] **Step 4: Look at it.** `npm run dev` (background, note the PID), open `/` in Chrome and in Safari, scroll to About.
  - Four small orange pins sit on Vancouver, Calgary, Denver and San Diego, tips on the cities, full opacity, in both themes (toggle the theme switch; pins and labels must not invert).
  - Hover a pin: it lifts, the elbow line draws, the uppercase label appears to the upper right. Leave: everything reverts.
  - Drag the globe: it still spins with the spring; the pins follow and fade/blur out as their city goes behind.
  - DevTools → toggle device emulation (touch): all four lines and labels visible.
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: hover switches states without animation.
  - Console: no warnings.
  Stop the dev server (`kill $PID`). Record what you saw in the hand-off log of this file.

- [x] **Step 5: Gate.**

Commit: `feat(globe): pin styles with leader-line labels; invert only the canvas`

---

## Task 3: Docs and hand-off

**Files:**
- Modify: `CLAUDE.md` (Conventions), `planning/10-dependency-upgrades.md` (Tier 5 Step 4 text), `planning/README.md` (status line), this file (hand-off log)

- [x] **Step 1: CLAUDE.md.** After the Motion convention line, add:

```
- Globe pins (`src/components/magicui/globe.tsx`): cobe 2 markers with an `id` get a CSS anchor `--cobe-<id>` and a `:root` variable `--cobe-visible-<id>`; the `.globe-pin*` rules at the end of `globals.css` (unlayered on purpose) position the DOM pins with CSS anchor positioning. The pin list must stay an unpositioned sibling after the canvas.
```

- [x] **Step 2: Tier 5 note.** In `planning/10-dependency-upgrades.md`, in Tier 5 Task 13 Step 4, after the sentence beginning "The `.prose` block is the existing one from `globals.css` moved out of `@layer components`", add: "The `.globe-pin*` block from chunk 11 is already unlayered at the end of the file; leave it where it is."

- [x] **Step 3: Status.** In `planning/README.md` change the chunk 11 line to `- [x] 11 — Globe pins (…) — done on `deps-upgrades`, unpushed`.

- [x] **Step 4: Spec reconciliation.** Update `planning/11-globe-pins-spec.md` to the as-built facts: pins rest at full opacity and siblings do not dim (what the mockup actually showed and the owner approved; cobe's visibility token made the 75%/dim CSS inert); the inline properties are `--pin-anchor` / `--pin-visible` and `@property` normalises the latter; the CSS block is unlayered at the end of `globals.css`; the no-anchor fallback keeps the list for screen readers. Add a short "As built" section rather than rewriting history.

- [x] **Step 5: Hand-off log** in this file: date, commits, what the visual pass showed, the optional 75%/dim variant (`.globe-pin { opacity: calc(var(--pin-visible) * 0.75) }` plus `.globe-pins:has(.globe-pin:hover) .globe-pin:not(:hover) { opacity: calc(var(--pin-visible) * 0.3) }` and `.globe-pin:hover { opacity: var(--pin-visible) }` inside the hover block), and the OWNER CHECKS: on the Vercel preview, in Chrome, Safari and one phone, confirm the four pins, the hover label, the touch labels, and that dark mode does not invert the pins.

- [x] **Step 6: Gate.**

Commit: `docs: globe pins convention and chunk 11 hand-off`

---

## Done when

- [x] Three commits on `deps-upgrades` after `cb042db`, unpushed.
- [x] Gate green: tsc, `eslint .`, `test:run` (30 files, 439 tests), `build`.
- [x] Visual pass recorded below.
- [x] `planning/README.md` ticks chunk 11; `CLAUDE.md` has the convention line.

## Hand-off log

### 2026-11-01 — chunk 11 done on `deps-upgrades`, unpushed

Commits after the chunk 10 work: `cb042db` spec, `01215a9` plan, `0e5259e` Task 1 (component), `b8331a3` plan revision, `02f23f6` Task 2 (styles), plus the Task 3 docs commit. Gate at the tip: tsc silent, `eslint .` clean, 30 files / 442 tests, build route table unchanged.

**What the reviews changed**

- Task 1 quality review: cobe 2.0.1 writes the token `N` for `--cobe-visible-<id>` (README says 1/0; bundle says `N`), so the planned `calc()` maths was inert and the mockups never showed the 75%/dim states. `@property --pin-visible` normalises it. `pins` now feeds the markers in the effect (`config.markers ??`), so a custom pin list binds correctly. Tests pin id ↔ label ↔ location for all four cities.
- Task 2 quality review measured the production build in headless Chrome and found: the global `svg { max-width: 100% }` in `src/styles/normalization.css` collapsed the 64px leader to 14px (fixed with `max-width: none`); transparent lead boxes stole hover between the clustered pins and a drag crossing a pin ended it (fixed: icon-only hit target, hidden pins inert via `@container style(--pin-visible: 0)`, pointer capture on the canvas); Vancouver's and Calgary's always-on touch labels overlapped by 86px (fixed: Vancouver `side: "left"`, mirrored lead). Re-measured after the fixes: lead 64px on every pin with the path start on the pin head; each icon hovers only its own pin; a pressed drag across Calgary keeps `grabbing` and keeps turning; touch labels at Vancouver x 50–157, Calgary 196–282, Denver 211–291, San Diego 186–284 with no overlaps; a far-side pin is not hit-testable; `@property` flips 1 → 0 with real opacity/filter transitions.

**Visual pass.** Not done by a human in this session (subagents cannot look). The measurements above cover geometry, hover, drag, touch and the fallback cascade in Chrome 156; Safari and a real phone are OWNER CHECKS.

**Optional variant: 75% rest opacity with sibling dimming** (the spec's original wording; the owner approved the full-opacity look on screen). In `globals.css`: `.globe-pin { opacity: calc(var(--pin-visible) * 0.75); }`, and inside `@media (hover: hover)`: `.globe-pin:hover { opacity: var(--pin-visible); }` and `.globe-pins:has(.globe-pin:hover) .globe-pin:not(:hover) { opacity: calc(var(--pin-visible) * 0.3); }`.

**Owner decision: label clipping near the globe's edge.** About's wrapper (`About.tsx:16`) is `overflow-hidden` and sized by its padding to 320px, 32px wider than the globe on each side, while a label extends up to ~120px from its pin. A label is cut once its pin is within that distance of the edge (roughly the outer third of each city's visible arc; the pin itself is already fading there). Options: (a) leave it; (b) centre labels above the pin (shorter lateral extent, loses the elbow look); (c) make the wrapper `overflow-visible` and give the section `overflow-x: clip` so labels can cross into the gap next to the text on desktop (they would still be cut by the viewport on phones); (d) later, anchor the label itself and use `position-try-fallbacks` to flip sides automatically, which needs the line to be drawn by the same element.

**OWNER CHECKS on the Vercel preview**, in Chrome, Safari and one phone: four small pins on Vancouver, Calgary, Denver and San Diego; hovering a pin lifts it and draws the elbow line to the uppercase label (Vancouver's to the left); labels always on with touch; pins fade and blur as they pass behind; dark mode inverts the globe but not the pins or labels; dragging still works, including across a pin.

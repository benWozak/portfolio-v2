# Tests

Vitest + Testing Library (jsdom). Files mirror `src/` by path.

```bash
npm test               # watch
npm run test:run       # all, once; must be green
npm run content:check  # src/__tests__/lib only: content/projects integrity (also runs as prebuild)
npm run test:coverage
```

## Layout

- `setup.ts` mocks `next/navigation`, `next/link`, `next/image` and `motion/react`. Its motion/react mock renders any `motion.<tag>` as the plain tag.
- `../test-utils.tsx` wraps `render` with `ThemeProvider`.
- `lib/` holds the content integrity tests: schema, index, featured-per-type, adjacency, image files on disk. They declare `@vitest-environment node` (no DOM needed, and Node builtins do not resolve under jsdom when `NODE_ENV=production`).
- `scripts/` tests the content tooling in `scripts/content/`.
- `utils/` tests the hooks in `src/utils/`.
- `components/` holds component tests, grouped as the source is.

## Conventions

- Query by role or label, not test id, unless there is no accessible handle.
- Test behaviour visible to a user, not class names, unless the class is the behaviour (e.g. `sr-only`, `hidden md:block`).
- One `describe` per component; one `it` per behaviour.

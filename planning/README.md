# Portfolio overhaul — planning index

This folder holds one executable plan per chunk of the overhaul that takes the site from
Payload CMS + Turso + Vercel Blob to a fully static Next.js site whose content lives in
`content/projects/*.json` and `public/projects/`. The blog and resume sections are deleted.
The projects section is redesigned.

Each doc is self-contained and meant to be executed in its own session. Read
`00-overview-and-preflight.md` first in every session: it holds the decisions, conventions,
and the verification commands every chunk uses.

## Order and dependencies

```
00 overview + pre-flight
 └─ 01 export content            (owner runs the dump; convert is offline)
     └─ 02 JSON data layer       (site now reads JSON; Payload still installed)
         ├─ 03 remove resume     (independent of 04)
         └─ 04 remove blog       (independent of 03)
             └─ 05 remove Payload        (needs 02 + 03 + 04 merged)
                 └─ 06 projects index redesign   (hard prerequisite: 05)
                     └─ 07 projects detail redesign
                         └─ 08 cleanup + hardening
                             └─ 09 decommission services (owner-run, irreversible)
                                 └─ 10 dependency upgrades (one branch, four tiers; after 08, independent of 09)
```

03 and 04 can be done in the same session on two branches. Everything else is strictly
sequential. The site must build and deploy cleanly after every chunk.

## Status

Tick a box when the chunk's PR is merged to `main`.

Pre-flight merge path: **(a)**, since both `slug` and `content` are present (2026-10-30). Merge `audit-improvements → main` first; every chunk then targets `main`.

- [x] 00 — Overview and pre-flight (`00-overview-and-preflight.md`)
- [x] 01 — Export content (`01-export-content.md`)
- [x] 02 — JSON data layer (`02-json-data-layer.md`)
- [x] 03 — Remove resume (`03-remove-resume.md`)
- [x] 04 — Remove blog (`04-remove-blog.md`)
- [x] 05 — Remove Payload (`05-remove-payload.md`)
- [x] 06 — Projects index redesign (`06-projects-index-redesign.md`)
- [x] 07 — Projects detail redesign (`07-projects-detail-redesign.md`)
- [x] 08 — Cleanup and hardening (`08-cleanup-and-hardening.md`)
- [ ] 09 — Decommission services (`09-decommission-services.md`)
- [ ] 10 — Dependency upgrades (`10-dependency-upgrades.md`) — tiers done on `deps-upgrades`: ☑1 ☑2 ☑3 ☑4 ☐5 (5 deferred)
- [ ] 11 — Globe pins (`11-globe-pins-spec.md`, plan in `11-globe-pins.md`) — on `deps-upgrades`; follows the cobe 2 upgrade in 10

## Starting a chunk session

Paste this as the first message of a new session, replacing `NN`:

> Read `planning/README.md` and `planning/00-overview-and-preflight.md`, then execute
> `planning/NN-….md` with the `superpowers:executing-plans` skill. Confirm the prerequisites
> section is satisfied before creating the branch. Stop at every step marked **OWNER RUNS**.

When a chunk is merged, tick its box above and add a one-line note under "Hand-off log" in
the chunk's doc if anything deviated from the plan.

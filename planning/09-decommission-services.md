# 09 — Decommission services (owner-run, irreversible)

> **For agentic workers:** This chunk is a checklist the owner walks through in the Vercel and Turso dashboards. There is nothing to code. An agent's job here is to prepare the verification commands, confirm the preconditions, and stop at every **OWNER RUNS** line.

**Goal:** Remove the Payload-era secrets from Vercel, delete the Blob store and the Turso database, and confirm the site keeps working with none of them.

**Architecture:** Each deletion has a "verify before" line and happens after a full deploy has proven the site no longer needs the service. Order: secrets first (reversible, proves nothing reads them), Blob second (backup verified), Turso last (backup verified).

---

## Prerequisites

- Chunk 08 merged; the production deploy from `main` has been live for at least a week with no errors in Vercel's logs.
- The off-repo backup from chunk 01 exists. Locate it and keep the path handy.

## Task 1: Verify the backup is complete — **OWNER RUNS**

- [ ] **Step 1: Counts match the manifest**

```bash
BK=~/Backups/portfolio-payload-<stamp>     # the copy made in chunk 01 Task 4
node -e 'const m=require(process.argv[1]+"/manifest.json");console.log(m.tableCounts, "blobs:", m.blobCount)' "$BK"
ls "$BK/tables" | wc -l
ls "$BK/blobs" | wc -l
```

Expected: the blob directory count equals `blobCount`; the tables directory has one file per table in `tableCounts`.

- [ ] **Step 2: Spot-check content**

```bash
node -e 'const p=require(process.argv[1]+"/tables/projects.json");console.log(p.map(x=>x.name))' "$BK"
```

Expected: the four project names.

## Task 2: Remove environment variables on Vercel — **OWNER RUNS**

- [ ] **Step 1: Verify before:** `grep -rn "DATABASE_URI\|PAYLOAD_SECRET\|BLOB_READ_WRITE_TOKEN\|YAKPDF\|REVALIDATION_SECRET\|NEXT_PUBLIC_SITE_URL" src scripts next.config.ts` prints nothing on `main`.

- [ ] **Step 2:** In Vercel → Project → Settings → Environment Variables, delete for every environment: `DATABASE_URI`, `DATABASE_AUTH_TOKEN`, `PAYLOAD_SECRET`, `PAYLOAD_DB_PUSH`, `BLOB_READ_WRITE_TOKEN`, `REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `YAKPDF_API_KEY`, `YAKPDF_HOST`.

  Keep: `NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

- [ ] **Step 3:** Trigger a redeploy of `main` (Deployments → Redeploy, without build cache).

- [ ] **Step 4: Smoke test production**

```bash
for p in / /projects /contact /sitemap.xml /robots.txt; do printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://www.benwozak.dev$p"; done
curl -s https://www.benwozak.dev/sitemap.xml | grep -o "/projects/[a-z0-9-]*" | sort -u
```

Expected: all 200; four project URLs. Open one project page and submit a test message through the contact form.

## Task 3: Delete the Blob store — **OWNER RUNS**

- [ ] **Verify before:** Task 1 counts matched, and the production site has been serving images from `/projects/...` (check any project page's image URL in devtools: it must start with `/_next/image?url=%2Fprojects%2F`).
- [ ] In Vercel → Storage → the Blob store (`ua4mmiw8i4jbla3y`) → Settings → Delete.
- [ ] Reload a project page on production; images still load.

## Task 4: Delete the Turso database — **OWNER RUNS**

- [ ] **Verify before:** `$BK/tables/` holds every table and you have opened `projects.json` (Task 1).
- [ ] Turso dashboard (or `turso db destroy <name>`): delete the database that `DATABASE_URI` pointed to. Also revoke its auth token if it is listed separately.
- [ ] Reload production once more.

## Task 5: Local tidy-up

- [ ] `.env` no longer contains any of the deleted keys (chunk 05 did this; confirm).
- [ ] Delete `.env.payload-legacy`. Chunk 05 parked the Payload-era keys there instead of deleting them; nothing needs them once Tasks 2–4 are done.
- [ ] Optional: `rm -rf scripts/backups` locally. The off-repo copy is the backup; keep it.
- [ ] Write the date and what was deleted in the hand-off log below, and tick 09 in `planning/README.md`.

---

## Done when

- Production serves every route with no Payload-era env vars.
- The Blob store and the Turso database no longer exist.
- The off-repo backup is intact.

## Hand-off log

_(append dated notes here)_

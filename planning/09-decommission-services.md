# 09 — Decommission services (owner-run, irreversible)

> **For agentic workers:** This chunk is a checklist the owner walks through in the Vercel and Turso dashboards. There is nothing to code. An agent's job here is to prepare the verification commands, confirm the preconditions, and stop at every **OWNER RUNS** line.

**Goal:** Remove the Payload-era secrets from Vercel, delete the Blob store and the Turso database, and confirm the site keeps working with none of them.

**Architecture:** Each deletion has a "verify before" line and happens after a full deploy has proven the site no longer needs the service. Order: secrets first (reversible, proves nothing reads them), Blob second (backup verified), Turso last (backup verified).

---

## Prerequisites

- Chunk 08 merged; the production deploy from `main` has been live for at least a week with no errors in Vercel's logs.
  - Status 2026-11-01: chunk 08 merged as `b79f879` the same day. The one-week soak has **not** elapsed; the owner chose to start anyway. Check the Vercel runtime logs for errors before Task 2.
- The off-repo backup from chunk 01 exists. Locate it and keep the path handy.
  - Found: `~/Backups/portfolio-payload-2026-10-31T05-08-25-054Z` (contains `manifest.json`, `schema.json`, `blobs.json`, `tables/`, `blobs/`). The in-repo copy `scripts/backups/2026-10-31T05-08-25-054Z` is gitignored.

## Task 1: Verify the backup is complete — **OWNER RUNS**

- [ ] **Step 1: Counts match the manifest**

```bash
BK=~/Backups/portfolio-payload-2026-10-31T05-08-25-054Z     # the copy made in chunk 01 Task 4
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

- [x] **Step 1: Verify before:** `grep -rn --exclude-dir=backups "DATABASE_URI\|PAYLOAD_SECRET\|BLOB_READ_WRITE_TOKEN\|YAKPDF\|REVALIDATION_SECRET\|NEXT_PUBLIC_SITE_URL" src scripts next.config.ts` prints nothing on `main`. (`--exclude-dir=backups` keeps the grep out of the gitignored dump.)

  Done 2026-11-01 on `b79f879`: nothing printed. A wider `git grep` over every tracked file except `planning/` for the nine key names plus `turso`, `vercel/blob` and the Blob store id also printed nothing.

- [ ] **Step 2:** In Vercel → Project → Settings → Environment Variables, delete for every environment: `DATABASE_URI`, `DATABASE_AUTH_TOKEN`, `PAYLOAD_SECRET`, `PAYLOAD_DB_PUSH`, `BLOB_READ_WRITE_TOKEN`, `REVALIDATION_SECRET`, `NEXT_PUBLIC_SITE_URL`, `YAKPDF_API_KEY`, `YAKPDF_HOST`.

  Keep: `NEXT_PUBLIC_KEY`, `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

- [ ] **Step 3:** Trigger a redeploy of `main` (Deployments → Redeploy, without build cache).

- [ ] **Step 4: Smoke test production**

```bash
for p in / /projects /contact /sitemap.xml /robots.txt; do printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://www.benwozak.dev$p"; done
curl -s https://www.benwozak.dev/sitemap.xml | grep -o "/projects/[a-z0-9-]*" | sort -u
```

Expected: all 200 except `/projects`, which is 308 to `/projects/professional` (redirect added in chunk 06). The sitemap lists the four project slugs plus `/projects/professional` and `/projects/personal`. Open one project page and submit a test message through the contact form.

  Baseline 2026-11-01, before any deletion: `/` 200, `/projects` 308, `/contact` 200, `/sitemap.xml` 200, `/robots.txt` 200; sitemap listed the six URLs above.

## Task 3: Delete the Blob store — **OWNER RUNS**

- [ ] **Verify before:** Task 1 counts matched, and the production site has been serving images from `/projects/...` (check any project page's image URL in devtools: it must start with `/_next/image?url=%2Fprojects%2F`).

  Image check done 2026-11-01: the server HTML of `/projects/calgary-folk-fest` has `src="/_next/image?url=%2Fprojects%2Fcalgary-folk-fest%2Fcfmf-1.webp&w=2048&q=75"`, and neither `/` nor that page mentions `blob.vercel-storage.com`. Only the Task 1 counts remain to be checked.
- [ ] In Vercel → Storage → the Blob store (`ua4mmiw8i4jbla3y`) → Settings → Delete.
- [ ] Reload a project page on production; images still load.

## Task 4: Delete the Turso database — **OWNER RUNS**

- [ ] **Verify before:** `$BK/tables/` holds every table and you have opened `projects.json` (Task 1).
- [ ] Identify the database. `.env.payload-legacy` still holds `DATABASE_URI`; this prints only the host part of its value (the Turso database name is the first label):

```bash
grep '^DATABASE_URI=' .env.payload-legacy | sed -E 's#^[^=]*=["'"'"']?[a-z]+://([^/?"'"'"']+).*#\1#'
```

- [ ] Turso dashboard (or `turso db destroy <name>`): delete the database that `DATABASE_URI` pointed to. Also revoke its auth token if it is listed separately.
- [ ] Reload production once more.

## Task 5: Local tidy-up

- [x] `.env` no longer contains any of the deleted keys (chunk 05 did this; confirm). Confirmed 2026-11-01: `.env` holds exactly the five keys in `.env.example`; `.env.payload-legacy` holds exactly the nine keys Task 2 deletes.
- [ ] Delete `.env.payload-legacy` (`rm .env.payload-legacy`). Chunk 05 parked the Payload-era keys there instead of deleting them; nothing needs them once Tasks 2–4 are done. Do this only after Task 4, since Task 4 reads it to find the database name.
- [ ] Optional: `rm -rf scripts/backups` locally. The off-repo copy is the backup; keep it.
- [ ] Write the date and what was deleted in the hand-off log below, and tick 09 in `planning/README.md`.

---

## Done when

- Production serves every route with no Payload-era env vars.
- The Blob store and the Turso database no longer exist.
- The off-repo backup is intact.

## Hand-off log

- 2026-11-01 (agent, preparation only; no service touched): chunk 08 merged as `b79f879` the same day, so the one-week soak in Prerequisites was waived by the owner. Located the off-repo backup and filled its path into Task 1. Task 2 Step 1 grep is clean on `main`. Recorded the pre-deletion production baseline under Task 2 Step 4 and corrected its expectations for the chunk 06 `/projects` redirect and the two group pages in the sitemap. Confirmed production project images come from `/_next/image?url=%2Fprojects%2F…` with no Blob host in the HTML (Task 3). Added a command to Task 4 that prints only the database host from `.env.payload-legacy`. Confirmed `.env` key names (Task 5). Still to do, all owner-run: Task 1 counts, Tasks 2–4 in the Vercel and Turso dashboards, then delete `.env.payload-legacy`, tick 09 in `planning/README.md`, and append the deletion date here.

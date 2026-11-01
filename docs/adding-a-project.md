# Adding or editing a project

Content lives in `content/projects/<slug>.json`; images in `public/projects/<slug>/`.
There is no CMS. Edit the JSON, commit, push; Vercel rebuilds the site. `npm run build`
runs `content:check` first, so a broken file fails the deploy rather than shipping.

## New project

1. `npm run content:new -- --slug my-app --image ~/Desktop/my-app.png`
   The image path is relative to where you run the command. The file name is lower-cased; each run of characters other than a–z, 0–9 and `.` becomes one hyphen, and hyphens at the ends or before the extension are dropped.
2. Paste the two printed lines into `content/projects/index.ts`: the `import` at the top, the entry inside `projectFiles`.
3. Fill in the empty fields in `content/projects/my-app.json` (schema below). The skeleton
   has one empty takeaway on purpose: `content:check` refuses empty strings, so it cannot be
   forgotten. Also check the defaults the script picks: `type: "personal"`, `status: "Prototype"`, `featured: false`, `order: 99`, `githubUrl: null` (which shows the rights note).
4. `npm run content:check` must pass.
5. `npm run dev` and open `/projects/my-app`.

## Schema

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Must equal the file name. Lowercase kebab-case. Becomes the URL. `professional`, `personal`, `web` and `native` are reserved. |
| `name` | string | |
| `type` | `"professional"` \| `"personal"` | Drives the two group pages and the prev/next links, which stay within a type. |
| `status` | `"In Progress"` \| `"Prototype"` \| `"Live"` \| `"Archived"` | Shown on cards, home rows and the detail page. |
| `featured` | boolean | At most one `true` per `type` (`content:check` enforces it); that project is the group's row on the home page. With none, the lowest `order` is used. |
| `order` | integer | Lower first, within the type. |
| `description` | string | One or two plain sentences; cards and the meta description. No Markdown. |
| `techStack.frontend/backend/other` | string[] | Chips. The detail page merges the three lists and de-duplicates. |
| `liveUrl`, `githubUrl` | string \| null | Absolute http(s) URLs. `githubUrl: null` shows the "I do not own the rights" note. |
| `image` | object | Written by the script. `alt` is required and also feeds `og:image:alt`; describe the screenshot. |
| `overview`, `challenge`, `solution` | string (Markdown) | Paragraphs separated by blank lines. Links, bold, code, lists and tables allowed. |
| `keyTakeaways` | string[] (inline Markdown) | At least one. One idea per item. Rendered inside a list item, so no paragraphs or headings. |
| `sections` | `[{ heading, body }]` (optional) | Extra Markdown sections after Key Takeaways. Use distinct headings. |
| `seo.title` | string (optional) | **Full** `<title>` override. Without it the title is `<name> \| Ben Wozak`. |
| `seo.description` | string (optional) | Overrides the meta description. |
| `updatedAt` | ISO date (optional) | Sitemap `lastModified`; without it the sitemap uses the build time. The script stamps it; update it when you edit. |

## Markdown rules

- Rendered by `react-markdown` with GitHub-flavoured Markdown. Raw HTML is shown as text, not rendered.
- Links: absolute `http(s)://` URLs (open in a new tab), site paths such as `/projects/other-slug` or `#anchor` (client-side navigation), and `mailto:`. Other schemes such as `tel:` are stripped, leaving a dead link.
- Keep each block (`overview`, `challenge`, `solution`, a section body) under roughly two
  phone screens of text. Sections fade in when 30% of them is visible, so a block taller than about
  three viewports would never appear.

## Replacing an image

Run `content:new` into a scratch slug to get the new `image` block. Copy the block into the real project, change `/projects/<scratch>/` in `src` to `/projects/<slug>/` and put back the real `alt` (the scratch one is empty). Move the file into `public/projects/<slug>/`, bump `updatedAt`, then delete `content/projects/<scratch>.json`, `public/projects/<scratch>/` and the old image. `content:check` fails until all of that is done.

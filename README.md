# benwozak.dev

Personal portfolio. Static Next.js 16 site deployed on Vercel.

## Develop

```bash
npm install
cp .env.example .env   # fill in EmailJS + Turnstile keys for the contact form
npm run dev
```

## Content

Projects are JSON files in `content/projects/` with images in `public/projects/`.
See [docs/adding-a-project.md](docs/adding-a-project.md).

## Checks

```bash
rm -rf .next && npm run lint && npx tsc --noEmit && npm run test:run && npm run build
```

`npm run build` runs the content integrity tests first.

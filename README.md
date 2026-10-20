# todd-utterback-astro

Personal site: notes, essays, and small tools, painted in dots after Georges Seurat.

## Structure

```text
/                          Home: harbor painting, intro, recent thoughts
/about
/thoughts                  All essays, as painted cards
/thoughts/[post]           An essay, with its painting as a banner
/projects                  Projects, as painted cards
/projects/moon-wifi        Is my WiFi faster than the Moon's? (speed test)
/projects/octathlon        Fitness Octathlon scorer
/pushup-counter            Pushup Counter (passcode, or try the demo)
/api/health                Cloudflare Pages Function
/api/pushups               Cloudflare Pages Function: logs pushup sets
```

Posts live in `src/content/thoughts/*.md`. Unknown paths redirect home via `404.astro`.

The dot paintings are drawn on `<canvas>` by a small engine in `src/lib/pointillism.ts`. Each
painting is a function in `src/lib/paintings/` (`thoughts.ts` holds one per essay, keyed by slug).

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Deploying

The site is hosted on Cloudflare Pages, which watches this GitHub repo. Every push to `main`
builds and deploys automatically; there's no deploy script to run. Check a deploy in the
Cloudflare dashboard under the Pages project's Deployments tab.

The Pages Functions in `functions/api/` deploy with the site. The pushup counter needs
`PUSHUP_WEBHOOK_URL` and `PUSHUP_PASSCODE` set as Cloudflare Pages environment variables
(see `.env.example`).

## Claude Code skills

Project skills live in `.claude/skills/`:

- **`/paint-thought [slug]`**: paints a dot picture for an essay. Run it after adding a post to
  `src/content/thoughts/`. With no slug, it paints every post that doesn't have a picture yet. Until
  then, a post shows a generic seaside painting.

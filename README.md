# toddutterback.com

My personal site: essays ("thoughts"), an about page, and a few small tools. Every picture on it is painted in dots, after Georges Seurat.

## At a glance

| | |
|---|---|
| **Live at** | https://toddutterback.com |
| **Runs on** | Cloudflare Pages (static site plus two small Functions) |
| **Code** | github.com/toddutterback/todd-utterback-astro (public) |
| **Built with** | Astro 5, TypeScript, `<canvas>` for the paintings |
| **Data** | None stored here. Pushup sets go to a Google Sheet through an Apps Script webhook. |
| **Deploys** | Automatically on every push to `main` |
| **Status** | Live; I add essays now and then |

## What's on it

| Page | What's there |
|---|---|
| `/` | Harbor painting, short intro, recent thoughts |
| `/about` | About me |
| `/thoughts` | All essays as painted cards; each essay has its painting as a banner |
| `/projects` | Projects as painted cards |
| `/projects/moon-wifi` | "Is my WiFi faster than the Moon's?" speed test |
| `/projects/octathlon` | Fitness Octathlon scorer |
| `/pushup-counter` | Pushup counter (passcode, or try the demo) |
| `/api/health`, `/api/pushups` | Cloudflare Pages Functions |

Unknown paths redirect home.

## Making a change

**Add an essay:** create `src/content/thoughts/<slug>.md` with `title`, `description`, `publishedAt` and `draft: false` in the front matter. Then run `/paint-thought <slug>` in Claude Code to paint its picture. Until then it shows a generic seaside painting.

**Anything else:**

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # check it builds before pushing
git push           # Cloudflare deploys main in a minute or two
```

Check a deploy in the Cloudflare dashboard: Pages project → Deployments.

**Pushup counter settings** are Cloudflare Pages environment variables: `PUSHUP_WEBHOOK_URL` and `PUSHUP_PASSCODE`. For local dev, copy `.env.example` to `.env`.

## Where things live

| Thing | Location |
|---|---|
| Essays | `src/content/thoughts/*.md` |
| Painting engine | `src/lib/pointillism.ts` |
| One painting per essay, keyed by slug | `src/lib/paintings/thoughts.ts` |
| Home page and theme paintings | `src/lib/paintings/heroes.ts` |
| Artist themes | `src/lib/themes.ts` |
| Pages Functions | `functions/api/` |
| Claude Code skill | `.claude/skills/paint-thought/` |

## Decisions

- **Astro, deployed as a static site.** Fast, cheap, nothing to keep running. The two Functions are the only server code.
- **Paintings are drawn in code, not image files.** Each one is a small function that places dots on a canvas, so every essay gets its own picture without stock art.
- **Seurat only, for now.** Themes after Signac, Pissarro, Monet and Childe Hassam are built but switched off. To turn one on, add its id to `ENABLED` in `src/lib/themes.ts`. With more than one enabled, a "Painted after" picker appears in the footer.
- **Pushups go to a Google Sheet.** The Function forwards each set to an Apps Script webhook, so the passcode and URL never reach the browser.
- **The repo is public.** No secrets are committed; `.env` is ignored.

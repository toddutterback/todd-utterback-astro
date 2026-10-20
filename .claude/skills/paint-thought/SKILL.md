---
name: paint-thought
description: Paint a pointillist (Seurat-style) card picture for an essay on the /thoughts page. Use when a new post is added under src/content/thoughts, when a post is still showing the generic seaside fallback, or when asked to paint, illustrate, or redo the picture for a thought/essay/post. Takes an optional post slug; with none, paints every post that doesn't have a picture yet.
---

# Paint a thought

Every essay gets one painting that shows up in three places: its card on `/thoughts`, its card in
"Recent thoughts" on the home page, and as a 200px-tall banner at the top of the essay itself. Paintings are
code: a `Painter` function that returns a color for each dot position. Posts without one fall back to
a seeded seaside, so nothing breaks, but each post deserves its own picture.

## 1. Find what needs painting

- If given a slug, paint that one (`src/content/thoughts/<slug>.md`).
- Otherwise, list the slugs in `src/content/thoughts/` (skip `draft: true`) and compare them with the
  keys of `THOUGHTS` in `src/lib/paintings/thoughts.ts`. Paint every slug that's missing.

## 2. Read the post and pick one subject

Read the whole post. Pick **one concrete, drawable thing** from it: an object, a person doing
something, or a small scene. Not an abstract idea.

- Good: the boat from the story, a locomotive for "industrial efficiency", a tightrope walker for
  "balance between extremes", a medal for an award.
- Lean whimsical. The house figure is an 1880s strongman with a handlebar mustache in a navy-and-cream
  striped bathing suit (see `pushup` and `runner` in `src/lib/paintings/projects.ts`). Top hats,
  parasols, circus, seaside and park scenes all fit Seurat.
- Don't reuse a subject another card already has. Check the existing painters first.

Say in one line what you're painting and why it fits the post before writing code.

## 3. Write the painter

Add a `const <name>: Painter = (x, y, b) => { ... }` to `src/lib/paintings/thoughts.ts`, with a
one-line comment naming the post and the subject. Then register it in `THOUGHTS` under the post's slug.

How painters work:
- `(x, y)` is a dot's position in CSS px. `b` holds `w` (card width, roughly 300–390), `h`, `P` (the
  palette) and `fleck`.
- Return a color. Check shapes **front to back**: the first shape that contains the point wins, and
  the background comes last.
- `fleck(main, comp, odds)` picks from `main` and occasionally from `comp`. Always speckle like this.
  Seurat's flecks of a complementary color are what make it read as pointillism, so avoid flat colors
  except for thin lines (masts, ropes, rails).
- Lay out x as a fraction of `w` (`w * 0.5`) and y as a fraction of `STAGE` (176 px).
- **Keep the subject in the top ~155 px.** Below that the text placard covers the painting on cards.
  The banner shows the full 200 px, so the area below the subject should still look intentional.
  Give every region a fallthrough down to `y = h`.
- The banner composes the painting 380 px wide in the middle of a wider canvas, so the painter is
  also called with `x < 0` and `x > w`. Backgrounds should carry on naturally out there; guard any
  shape that shouldn't repeat (see the `onStage` check in `tightrope`).
- Make subjects big. At 4 px dot spacing anything under ~12 px wide turns to mush. Figures should be
  60–100 px tall, limbs 3–5 px in radius, torsos 8–11 px.

Helpers:
- `nearSegment`, `inPolygon` from `../pointillism`
- From `./figures`: `limb(x, y, points, r)` for capsule limbs and poles, `headAt` (head with hair and a
  mustache), `skin`, `tights`, `striped` (bathing-suit torso), `topHat`
- The local `local(x, y, cx, cy, tilt)` in `thoughts.ts` rotates a point into a tilted frame (see
  `suhaili`)

## 4. Palette rules

The site follows Seurat's seascapes: **sea greens and very pale sky blue dominate.**
- Backgrounds: `sky`, `mist`, `cream`, `foam`, `sea`, with `sand` and `lavender` flecks.
- Figures and silhouettes: `ink`, `blueDeep`, `lavenderDeep`, `seaDeep`, so they stand out from the
  pale ground.
- `coral` is the one accent. Use it for a single small thing per painting (a patch, a ribbon, a hat
  band, a flame), never for large areas.
- `sand` stands in for gold and wood. `white` is for sails, smoke and highlights.

## 5. Check it in the browser

1. Start the dev server with `preview_start` using the `astro-dev` config. If cards look half-styled
   after editing a component, restart it; Astro's hot reload sometimes keeps stale CSS.
2. Open `/thoughts`, scroll the card into view, and `zoom` into it. Then open the essay and check
   the banner. Check:
   - Does the subject read at a glance? If it's a smudge, make it bigger or darker before anything else.
   - Is it fully above the placard?
   - Is the color balance mostly green and pale blue, with at most one coral note?
3. Check a phone width too (`resize_window` mobile), then reset it.
4. Run `npx astro build` to make sure it compiles.

Report back with what you painted for each post, and a screenshot.

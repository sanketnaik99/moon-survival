# Moon Survival

A team-building web app based on the NASA Moon Survival exercise. People rank 15 survival items alone, then agree on a ranking as a team, then see both rankings scored against NASA's expert answers.

The product name is **"Moon Survival"** (not "NASA Moon Survival"). "NASA" only appears where it refers to the expert answer key ("NASA's ranking", "compare with NASA").

## Stack

- TanStack Start + TanStack Router, React 19, Tailwind v4, shadcn (new-york, zinc), `motion` (for the sortable list), deployed to Cloudflare with wrangler.
- File routes live in `src/routes`. `routeTree.gen.ts` is generated, so don't edit it.
- Package manager: **npm** (there's a `package-lock.json`).

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run check    # prettier --check
npm run build
npm run deploy   # build + wrangler deploy
```

- Import alias: `#/*` → `src/*` (for example `#/lib/utils`, `#/components/ui/button`). Never use `@/`.
- Code style (Prettier): no semicolons, single quotes, trailing commas, 2-space indent. Run `npx prettier --write src` after editing.

## Design rules

- **Light mode only.** `color-scheme: light`, no `.dark` styles. Use the tokens in `src/styles.css` (`bg-card`, `text-muted-foreground`, `bg-primary`, `bg-band-*`).
- **Keep the UI subtle.** Warm off-white background, one muted navy accent, flat solid buttons, plain bordered cards. No gradients, no gradient text, no glow shadows, no rainbow accents. An earlier colourful version was rejected as looking "very AI".
- **Colour is for meaning only.** The score-band dots and the "off by" delta pills (green for exact, then lime, amber, orange and red the further off) are the only colour-coded elements.
- **Mobile first, and it must work at 320–1280px.** Tap targets ≥ 44px (`h-11`), inputs ≥ 16px font, no horizontal scroll, sticky bottom bars use `env(safe-area-inset-bottom)`, and pages leave `pb-28` for the bar.
- **Ranking sections are one centered column**, capped at `max-w-lg` (the same width as the confirm dialog). The beui list has its own `max-w-md`, so `RankingList` passes `className="max-w-none"` to override it.
- **Images, not icon glyphs, for the 15 items.** They're pixel-art illustrations cut from a single AI-generated sprite sheet (3 columns × 5 rows, in handout order) into transparent 256px PNGs at `public/items/<item id>.png`, and rendered by `ItemImage`. To change one, replace the PNG with the same name. The landing page hero is `public/hero.jpg`.

## Components and libraries

- Add shadcn components with `npx shadcn@latest add <name>`. The generator writes `from "cn"` imports and `.tsx` import extensions, so change them to `#/lib/utils` and drop the extension.
- Drag-and-drop ranking uses the beui sortable list (`src/components/motion/sortable-list.tsx`, installed via `npx shadcn@latest add @beui/sortable-stack`). **Wrap it, don't edit it.** `lint` reports a few errors in this file and in `ui/button.tsx`, because they're generated code.
- Irreversible actions ask for confirmation first, through `ConfirmLockDialog` (an `AlertDialog`; a bottom sheet on mobile, centered on desktop, with Keep editing focused by default):
  - Individual lock-in: a simple confirm.
  - Team lock-in: also requires the "Everyone agreed (no voting or averaging)" checkbox.
  - Start over: a confirm with a Cancel button.

## Layout

- `src/lib/nasa.ts`: the single source of truth for the exercise. It has the 15 items with NASA ranks and reasoning, `scoreRanking`, `getBand` and `SCORE_BANDS` (each band has a `survival` message), the scenario text, the debrief questions and the takeaway.
- `src/hooks/use-challenge.ts`: state saved in `localStorage` (key `nasa-survival:v1`) and shared by both pages. It reads storage after mount, never during SSR, and exposes `hydrated`.
- `src/components/challenge/`: `ranking-list`, `item-image`, `scenario`, `results-section`, `round-nav`, `action-bar`, `confirm-lock-dialog`.
- Routes:
  - `/`: landing page with the hero image, a description of the challenge and a "How it works" list.
  - `/individual`: scenario, your name and the solo ranking.
  - `/team`: team name, the team ranking and, after lock-in, the results.

## Flow rules

- **Your name** (individual page) and **the team name** (team page) are both required before you can lock in. The lock button is disabled and says what's missing.
- `/team` is guarded until the individual ranking is locked. The individual ranking can be edited until the team ranking is locked.
- The team ranking starts from the person's own order.
- NASA's answers, scores and survival messages only appear after the team ranking is locked. The results show both scores, a score band with a survival message, color-coded deltas per item, a score-band legend and the debrief questions.
- Score bands: 0–25 Excellent, 26–32 Good, 33–45 Average, 46–55 Fair, 56–70 Poor (Earth-bound logic), 71–112 Very poor (casualties of the space program). The maximum possible score is 112. Lower is better.

## Verifying changes

- Always run `npx tsc --noEmit` and `npx eslint src/routes src/components/challenge`.
- Scoring check: NASA's exact order must score 0 (Excellent), and the reversed order must score 112 (Very poor).
- Check layouts at 375, 768 and 1280px, and that the dialogs, the sticky bar and dragging work on a touch device.
- Scope for now: one device per person, no backend. Live team sync is a possible later part.

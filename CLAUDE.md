# Moon Survival

A team-building web app based on the NASA Moon Survival exercise. A facilitator creates a **session** (with its teams) from a password-protected admin dashboard and shares the link. Each person joins, picks a team, ranks 15 survival items alone, then the team agrees on a ranking, and both are scored against NASA's expert answers. The admin sees final scores update live and keeps past sessions as history.

The product name is **"Moon Survival"** (not "NASA Moon Survival"). "NASA" only appears where it refers to the expert answer key ("NASA's ranking", "compare with NASA").

## Stack

- TanStack Start + TanStack Router, React 19, Tailwind v4, shadcn (new-york, zinc), `motion` (for the sortable list), deployed to Cloudflare with wrangler.
- Backend: Cloudflare **D1** (source of truth) + one **Durable Object** (`SessionRoom`) per session for WebSocket fan-out. Server functions use `createServerFn` and read bindings via `import { env } from 'cloudflare:workers'`.
- File routes live in `src/routes`. `routeTree.gen.ts` is generated, so don't edit it.
- Package manager: **npm** (there's a `package-lock.json`).

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run check    # prettier --check
npm run build
npm run deploy   # build + wrangler deploy
npm run db:migrate         # apply migrations/ to the local D1
npm run db:migrate:remote  # apply migrations/ to the production D1
npm run cf-typegen         # regenerate worker-configuration.d.ts after editing wrangler.jsonc
```

- Local admin password lives in `.dev.vars` (`ADMIN_PASSWORD`, gitignored; see `.dev.vars.example`). Production: `npx wrangler secret put ADMIN_PASSWORD`.
- First-time production setup: `npx wrangler d1 create moon-survival`, paste the `database_id` into `wrangler.jsonc`, then `npm run db:migrate:remote`.

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
  - Individual lock-in: a confirm that says it can't be changed afterward.
  - Team lock-in: also requires the "Everyone agreed (no voting or averaging)" checkbox.
  - There is no "Start over" any more: results are final and stored on the server.

## Layout

- `src/lib/nasa.ts`: the single source of truth for the exercise. It has the 15 items with NASA ranks and reasoning, `scoreRanking`, `isValidOrder`, `getBand` and `SCORE_BANDS` (each band has a `survival` message), the scenario text, the debrief questions and the takeaway.
- `src/lib/session-types.ts`: DTO types shared by server functions and the UI.
- `src/server.ts`: worker entry. Re-exports `SessionRoom`, authenticates `GET /api/sessions/:id/ws`, and passes everything else to TanStack Start.
- `src/server/`: `session-room.ts` (the Durable Object), `db.ts` (D1 helpers + `notify`), `auth.ts` / `guard.ts` / `auth-core.ts` (admin password + cookie), `admin.ts` and `participant.ts` (server functions).
- `migrations/`: D1 schema (`sessions`, `teams`, `participants`).
- `src/hooks/use-session-challenge.ts`: participant state. Server state is the truth; only unlocked drafts live in `localStorage`. It reads storage after mount, never during SSR, and exposes `hydrated`.
- `src/hooks/use-session-socket.ts`: WebSocket with backoff reconnect; calls back on every message and after reconnect.
- `src/components/challenge/`: `ranking-list`, `item-image`, `scenario`, `results-section`, `round-nav`, `action-bar`, `confirm-lock-dialog`, `band-dot`.
- Routes:
  - `/`: landing page with the hero image, a "Have a session code?" input and a "How it works" list.
  - `/s/$code`: join page (name + team picker). `/s/$code/individual` and `/s/$code/team` are the two rounds.
  - `/admin/login`, `/admin` (create a session + history list), `/admin/sessions/$sessionId` (live dashboard). Everything under `/admin/_authed` requires the admin cookie.

## Flow rules

- The exercise is only reachable through a session link. Teams are defined by the admin; people pick one when they join.
- **Scores are computed on the server only** (`lockIndividual` / `lockTeam`). Clients send orders, never scores.
- The first teammate to lock the team ranking submits for the whole team (atomic `UPDATE ... WHERE locked_at IS NULL`). Teammates' pages switch to the results on their own. A person whose team locked before they did can still lock their own ranking.
- `/s/$code/team` is guarded until the individual ranking is locked. **The individual lock is final** (no edit or unlock): it's the pre-discussion baseline, and `lockIndividual` only writes when `my_locked_at IS NULL`.
- The team ranking starts from the original (handout) order, `INITIAL_ORDER`, not from anyone's individual ranking.
- NASA's answers, scores and survival messages only appear after the team ranking is locked.
- **The admin dashboard shows final scores only**: a person appears once they and their team are both locked.
- Realtime: write to D1, then `notify()` the session's Durable Object. Clients refetch on every event rather than merging partial state.
- Closing a session blocks new joins and new locks; existing participants can still see their results.
- Score bands: 0–25 Excellent, 26–32 Good, 33–45 Average, 46–55 Fair, 56–70 Poor (Earth-bound logic), 71–112 Very poor (casualties of the space program). The maximum possible score is 112. Lower is better.

## Server code gotchas

- Anything that imports `@tanstack/react-start/server` or `cloudflare:workers` must only be used inside `createServerFn` handlers, or the client build fails import protection. Shared server helpers (like `requireAdmin`) live in their own module (`guard.ts`) for that reason.
- Dates formatted with `toLocaleString()` need `suppressHydrationWarning`; anything reading `window` renders after mount.

## Verifying changes

- Always run `npx tsc --noEmit` and `npx eslint src/routes src/components/challenge src/server src/hooks`.
- Scoring check: NASA's exact order must score 0 (Excellent), and the reversed order must score 112 (Very poor).
- Check layouts at 375, 768 and 1280px, and that the dialogs, the sticky bar and dragging work on a touch device.
- Live check: log in at `/admin/login`, create a session, join from two separate browser profiles, lock in, and confirm the dashboard and the teammate's page update without a reload.

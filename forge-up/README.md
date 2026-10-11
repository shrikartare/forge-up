# ForgeUp

Local-first smoking cessation tracker PWA. Tagline: **Every smoke-free day moves you forward.**

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Zod · Recharts · Vitest · Playwright · localStorage

No backend, no API keys, no cloud sync.

## Quick start

```bash
cd forge-up
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | Static export to `out/` |
| `npm run start` | Serve production export (after build) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (needs built app / webServer) |

## Architecture

- **Profile** in `localStorage` key `forgeup.profile` (`src/lib/profile.ts`)
- **Progress** is runtime-dynamic via `computeProgress(profile, now)` (`src/lib/calc.ts`)
- Screens: onboarding, home (edit quit date), health, savings, journal, reinforce, settings
- Reinforce script + Easyway-inspired paraphrases in `src/lib/mindset.ts` (not book quotes)

### Calculation assumptions

- Elapsed day = milliseconds / 86,400,000
- Daily cost = `cigarettesPerDay × pricePerCigarette`
- Money / cigarettes / time saved are estimates from elapsed time × baseline
- Future quit dates show a countdown (no negative savings)

## Privacy

- Data stays in the browser
- Clearing site data can wipe the profile — use Settings → Export JSON
- No analytics or ads

## PWA

- `public/manifest.webmanifest` + icons
- Simple service worker caches the app shell only (not profile data)
- Installability depends on the browser

## GitHub Pages

Static export is enabled (`output: 'export'`).

From the `ai-portfolio` repo root, workflow [`.github/workflows/deploy-smoke-free.yml`](../../.github/workflows/deploy-smoke-free.yml) builds with `BASE_PATH=/ai-portfolio` and deploys `projects/forge-up/out`.

1. Enable Pages → GitHub Actions in repo settings
2. Push to `main` (or run workflow manually)
3. Site URL will be `https://<user>.github.io/ai-portfolio/` (adjust `BASE_PATH` if your repo name differs)

Local production build without base path:

```bash
npm run build
npx serve out
```

# ForgeUp

Local-first smoking cessation tracker PWA. Tagline: **Every smoke-free day moves you forward.**

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Zod · Recharts · Vitest · Playwright · localStorage

No backend, no API keys, no cloud sync.

## Quick start

```bash
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

Static export is enabled (`output: 'export'`). Deploy is handled by [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) on every push to `main`.

### One-time repo setup

1. **Settings → Actions → General** — allow GitHub Actions (at least GitHub-owned actions).
2. **Settings → Pages** — set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. Confirm the URL under **Settings → Pages**: `https://shrikartare.github.io/forge-up/`

The workflow sets `BASE_PATH` / `NEXT_PUBLIC_BASE_PATH` from the repository name automatically.

Local production build for Pages:

```bash
BASE_PATH=/forge-up NEXT_PUBLIC_BASE_PATH=/forge-up npm run build
npx serve out
```

Local production build without base path:

```bash
npm run build
npx serve out
```

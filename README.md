# 10 Pin Bowling Scorer

A family scorekeeping app for 10-pin bowling, rewritten from the 6-pin version for standard scoring. Built with React + Vite, hosted free on GitHub Pages, no sign-in or backend. Each person's game history lives in their own browser.

**Live app:** `https://YOUR-GITHUB-USERNAME.github.io/10pinbowling/`

## Rules this app scores

- 10 frames, 2 throws per frame, 10 pins per rack.
- **Strike**: all 10 pins on throw 1; frame ends, bonus = next 2 throws.
- **Spare**: all 10 pins across throws 1 + 2; bonus = next 1 throw.
- **10th frame**: an extra (3rd) throw is awarded for a strike on throw 1 or a spare on throws 1-2.
- **Perfect game**: 12 strikes in a row, scoring 300.

## Features

- Multiple players per game, entered fresh each time (no accounts).
- Tap-to-enter pin counts, capped at pins still standing.
- Click any recorded throw to edit it; skip bowler; undo last throw.
- Live scoresheet with running totals.
- Game history: last 4 games saved per browser, with rolling averages.

## Project layout

- `src/lib/scoring.js` - the scoring engine. A game is 10 arrays of raw pin counts; frame state, bonuses, running totals and scoresheet marks are all derived from it.
- `src/lib/gameState.js` - reducer for a live game (rolls, turn order, undo, skip, edits).
- `src/lib/storage.js` - localStorage history and averages.
- `src/components/` - setup, game, scoresheet, pin entry, edit dialog, history.

## Running locally

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

1. Create a repo named `10pinbowling` and push this code to `main`.
2. In the repo, go to **Settings -> Pages -> Build and deployment -> Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.

If you rename the repo, update `base` in `vite.config.js` to match.

## Data storage

History is stored in `localStorage` under the key `tenpin-bowling-history-v1`. GitHub Pages sites under the same username share one browser origin, so this key is deliberately different from the 6-pin app's key; the two apps' histories never mix.

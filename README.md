# Arena Survival

A top-down arena survival shooter built with [Phaser 3](https://phaser.io) and [Vite](https://vitejs.dev).

Survive waves of enemies, pick an upgrade after each wave, chase a high score.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Controls

| Action | Input |
|---|---|
| Move | WASD or arrow keys |
| Aim | Mouse |
| Fire | Hold left mouse button (auto-fire) |
| Start / restart | Click or Space |
| Pick upgrade | Click a card or press 1 / 2 / 3 |
| Mute | M |
| Back to menu | ESC |

## How it plays

- Enemies spawn at the arena edges and chase you. Grunts are the baseline, runners are fast and fragile (from wave 2), brutes are slow and tough (from wave 4).
- Clear a wave and choose one of three upgrades: faster fire, heavier rounds, extra bullets, speed, bullet velocity, more max HP, or a medkit.
- Kills score more on later waves. Your high score is kept in the browser's local storage.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests for the pure game logic in `src/logic/` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Tuning

Every gameplay number (speeds, HP, cooldowns, wave pacing, colors) lives in `src/config.js`. Wave composition is the `waveComposition` function in `src/logic/waves.js`, and the upgrade table is in `src/logic/upgrades.js`.

## Project layout

```
src/
  main.js        Phaser game config and scene list
  config.js      all tunable numbers
  logic/         pure game rules (no Phaser), covered by tests/
  scenes/        Boot, Menu, Game, HUD, Upgrade, GameOver
  entities/      Player, Enemy, Bullet (Arcade physics sprites)
  audio/sfx.js   synthesised sound effects
tests/           Vitest unit tests for src/logic
```

## Deploying

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`. Enable Pages in the repository settings with "GitHub Actions" as the source. `.github/workflows/ci.yml` runs the tests and build on pull requests and other branches.

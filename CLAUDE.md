# Arena Survival – project notes for Claude Code

## Stack
- Phaser 3.90.0 (Arcade physics), bundled with Vite 8. ES modules, no TypeScript.
- Vitest for unit tests. Tests live in `tests/` and only cover `src/logic/`.
- No asset files: textures are generated in `BootScene` with `Graphics.generateTexture()`.

## Commands
- `npm run dev` – dev server. `npm run build` – production build to `dist/`.
- `npm test` – run Vitest once.

## Layout
- `src/config.js` – the only place for tunable numbers. Never hard-code speeds/HP/timings in scenes.
- `src/logic/` – pure functions, **must not import Phaser**. Anything with rules or math goes here so it can be tested.
- `src/scenes/` – one class per Phaser scene (`Boot`, `Menu`, `Game`, `HUD`, `Upgrade`, `GameOver`).
- `src/entities/` – Arcade sprite subclasses (`Player`, `Enemy`, `Bullet`).
- `src/audio/sfx.js` – Web Audio beeps, no audio files.

## Scene flow
Boot (generate textures) → Menu → Game + HUD (parallel) → Upgrade (Game paused) → Game … → GameOver → Game or Menu.
Game emits: `wave-started`, `wave-cleared`, `enemy-killed`, `hp-changed`, `score-changed`, `stats-changed`, `upgrade-chosen`, `player-died`, `mute-changed`. HUD and Upgrade only listen/emit on `this.scene.get('Game').events`.

## Debug hook
`window.__game` is the Phaser.Game; while Game runs, `window.__debug` exposes `player()`, `bullets()`, `enemies()`, `kills()`, `score()`, `stats()`, `wave()` for headless checks (Playwright + the preview server).

## Conventions
- Scenes talk to each other through `this.events` / `this.scene.get('Game').events`, not direct property pokes.
- Randomness goes through `src/logic/rng.js` so tests can seed it.
- Keep each change a playable vertical slice; run `npm test` and `npm run build` before committing.

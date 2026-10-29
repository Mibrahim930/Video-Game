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

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests for the pure game logic in `src/logic/` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Tuning

Every gameplay number (speeds, HP, cooldowns, wave pacing, colors) lives in `src/config.js`.

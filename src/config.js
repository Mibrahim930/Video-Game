// Every tunable number lives here. Change feel without touching scenes.

export const GAME = {
  width: 960,
  height: 540,
  backgroundColor: 0x0b0e14,
};

export const ARENA = {
  // Inset from the canvas edge that the player cannot cross.
  padding: 16,
  gridSize: 48,
  gridColor: 0x1a2030,
  borderColor: 0x2d3a52,
};

export const PLAYER = {
  radius: 14,
  color: 0x6ee7ff,
  speed: 260,
  maxHp: 100,
  fireCooldownMs: 220,
  bulletSpeed: 620,
  bulletDamage: 10,
  bulletCount: 1,
  // Degrees between bullets when bulletCount > 1.
  spreadDeg: 10,
  // Milliseconds of invulnerability after taking contact damage.
  hitInvulnMs: 500,
};

export const BULLET = {
  radius: 4,
  color: 0xfff4a3,
  lifetimeMs: 1200,
  poolSize: 200,
};

export const ENEMIES = {
  grunt: {
    radius: 12,
    color: 0xff6b6b,
    speed: 120,
    hp: 20,
    damage: 10,
    points: 10,
  },
  runner: {
    radius: 9,
    color: 0xffa94d,
    speed: 210,
    hp: 10,
    damage: 6,
    points: 15,
  },
  brute: {
    radius: 20,
    color: 0xc77dff,
    speed: 70,
    hp: 60,
    damage: 20,
    points: 40,
  },
};

export const WAVES = {
  // Pause between wave clear and the upgrade screen / next wave.
  interWaveDelayMs: 1200,
  // Spawns are staggered so a wave trickles in rather than appearing at once.
  spawnIntervalMs: 350,
  // How far outside the arena enemies appear.
  spawnMargin: 40,
};

export const UPGRADE = {
  choices: 3,
};

export const COLORS = {
  text: '#e6edf3',
  muted: '#8b98a9',
  accent: '#6ee7ff',
  danger: '#ff6b6b',
  good: '#7ee787',
};

export const FONT = {
  family: 'monospace',
};

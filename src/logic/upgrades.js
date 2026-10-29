import { shuffle } from './rng.js';
import { heal } from './stats.js';

const MIN_COOLDOWN_MS = 60;
const MAX_BULLETS = 5;

/**
 * Every upgrade the player can be offered. `apply` mutates a stats object
 * (see stats.js); `available` hides upgrades that can no longer help.
 */
export const UPGRADES = [
  {
    id: 'rapid',
    name: 'Rapid Fire',
    description: 'Fire 15% faster',
    apply: (s) => {
      s.fireCooldownMs = Math.max(MIN_COOLDOWN_MS, Math.round(s.fireCooldownMs * 0.85));
    },
    available: (s) => s.fireCooldownMs > MIN_COOLDOWN_MS,
  },
  {
    id: 'damage',
    name: 'Heavy Rounds',
    description: '+5 bullet damage',
    apply: (s) => {
      s.bulletDamage += 5;
    },
    available: () => true,
  },
  {
    id: 'spread',
    name: 'Split Shot',
    description: '+1 bullet per shot',
    apply: (s) => {
      s.bulletCount = Math.min(MAX_BULLETS, s.bulletCount + 1);
    },
    available: (s) => s.bulletCount < MAX_BULLETS,
  },
  {
    id: 'speed',
    name: 'Light Boots',
    description: '+12% move speed',
    apply: (s) => {
      s.speed = Math.round(s.speed * 1.12);
    },
    available: () => true,
  },
  {
    id: 'velocity',
    name: 'Long Barrel',
    description: '+20% bullet speed',
    apply: (s) => {
      s.bulletSpeed = Math.round(s.bulletSpeed * 1.2);
    },
    available: () => true,
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: '+25 max HP and heal 25',
    apply: (s) => {
      s.maxHp += 25;
      heal(s, 25);
    },
    available: () => true,
  },
  {
    id: 'medkit',
    name: 'Medkit',
    description: 'Restore 50 HP',
    apply: (s) => {
      heal(s, 50);
    },
    available: (s) => s.hp < s.maxHp,
  },
];

export function getUpgrade(id) {
  return UPGRADES.find((u) => u.id === id);
}

/** Up to `n` distinct upgrades that currently make sense for `stats`. */
export function pickUpgradeChoices(rng, n, stats) {
  const pool = UPGRADES.filter((u) => u.available(stats));
  return shuffle(rng, pool).slice(0, n);
}

/** Apply by id or by object. Returns the stats for chaining. */
export function applyUpgrade(stats, upgrade) {
  const u = typeof upgrade === 'string' ? getUpgrade(upgrade) : upgrade;
  if (!u) throw new Error(`Unknown upgrade: ${upgrade}`);
  u.apply(stats);
  return stats;
}

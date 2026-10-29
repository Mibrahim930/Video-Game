import { shuffle } from './rng.js';

/**
 * How many of each enemy type wave `n` (1-based) contains.
 * Returns [{ type, count }] with only non-zero counts, in a stable order.
 */
export function waveComposition(n) {
  const wave = Math.max(1, Math.floor(n));
  const counts = {
    grunt: 4 + 2 * (wave - 1),
    runner: wave >= 2 ? 2 * (wave - 1) : 0,
    brute: wave >= 4 ? Math.floor((wave - 2) / 2) : 0,
  };
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type, count }));
}

export function waveTotal(n) {
  return waveComposition(n).reduce((sum, { count }) => sum + count, 0);
}

/** Flat, shuffled list of enemy types to spawn one at a time. */
export function waveSpawnList(n, rng) {
  const flat = [];
  for (const { type, count } of waveComposition(n)) {
    for (let i = 0; i < count; i++) flat.push(type);
  }
  return shuffle(rng, flat);
}

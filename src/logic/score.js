import { ENEMIES } from '../config.js';

const HIGH_SCORE_KEY = 'arena-survival.highScore';

/** Points for a kill of `type` during wave `wave`; later waves pay more. */
export function killPoints(type, wave) {
  const base = ENEMIES[type]?.points ?? 0;
  const multiplier = 1 + 0.25 * Math.max(0, wave - 1);
  return Math.round(base * multiplier);
}

/**
 * Read the stored high score. `storage` is anything with getItem/setItem
 * (localStorage in the browser, a plain stub in tests). Missing or broken
 * storage yields 0.
 */
export function loadHighScore(storage) {
  try {
    const raw = storage?.getItem(HIGH_SCORE_KEY);
    const n = Number.parseInt(raw ?? '', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Persist `score` if it beats the stored high score.
 * Returns { highScore, isNew }.
 */
export function saveHighScore(storage, score) {
  const previous = loadHighScore(storage);
  if (score <= previous) return { highScore: previous, isNew: false };
  try {
    storage?.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    // Storage may be unavailable (private mode); the run still counts.
  }
  return { highScore: score, isNew: true };
}

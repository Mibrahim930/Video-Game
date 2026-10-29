import { describe, it, expect } from 'vitest';
import { killPoints, loadHighScore, saveHighScore } from '../src/logic/score.js';
import { ENEMIES } from '../src/config.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

describe('killPoints', () => {
  it('pays base points on wave 1', () => {
    expect(killPoints('grunt', 1)).toBe(ENEMIES.grunt.points);
  });

  it('scales up with wave number', () => {
    expect(killPoints('grunt', 5)).toBe(ENEMIES.grunt.points * 2);
    expect(killPoints('brute', 3)).toBeGreaterThan(killPoints('brute', 2));
  });

  it('returns 0 for unknown types', () => {
    expect(killPoints('dragon', 1)).toBe(0);
  });
});

describe('high score persistence', () => {
  it('returns 0 for empty or broken storage', () => {
    expect(loadHighScore(memoryStorage())).toBe(0);
    expect(loadHighScore(null)).toBe(0);
    expect(loadHighScore({ getItem: () => { throw new Error('nope'); } })).toBe(0);
    expect(loadHighScore(memoryStorage({ 'arena-survival.highScore': 'junk' }))).toBe(0);
  });

  it('saves only when the score improves', () => {
    const s = memoryStorage();
    expect(saveHighScore(s, 120)).toEqual({ highScore: 120, isNew: true });
    expect(saveHighScore(s, 80)).toEqual({ highScore: 120, isNew: false });
    expect(saveHighScore(s, 200)).toEqual({ highScore: 200, isNew: true });
    expect(loadHighScore(s)).toBe(200);
  });

  it('survives storage that refuses writes', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect(saveHighScore(s, 10)).toEqual({ highScore: 10, isNew: true });
  });
});

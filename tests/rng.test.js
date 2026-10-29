import { describe, it, expect } from 'vitest';
import { mulberry32, randInt, shuffle, pick } from '../src/logic/rng.js';

describe('mulberry32', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('helpers', () => {
  it('randInt covers the inclusive range', () => {
    const rng = mulberry32(1);
    const seen = new Set();
    for (let i = 0; i < 500; i++) seen.add(randInt(rng, 0, 3));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });

  it('shuffle keeps the same elements and does not mutate', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(mulberry32(3), src);
    expect(out).not.toBe(src);
    expect(out.slice().sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5]);
  });

  it('pick returns an element', () => {
    expect(['a', 'b']).toContain(pick(mulberry32(9), ['a', 'b']));
  });
});

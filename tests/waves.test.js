import { describe, it, expect } from 'vitest';
import { waveComposition, waveTotal, waveSpawnList } from '../src/logic/waves.js';
import { mulberry32 } from '../src/logic/rng.js';

describe('waveComposition', () => {
  it('wave 1 is grunts only', () => {
    expect(waveComposition(1)).toEqual([{ type: 'grunt', count: 4 }]);
  });

  it('introduces runners at wave 2 and brutes at wave 4', () => {
    const types = (n) => waveComposition(n).map((e) => e.type);
    expect(types(2)).toEqual(['grunt', 'runner']);
    expect(types(3)).toEqual(['grunt', 'runner']);
    expect(types(4)).toEqual(['grunt', 'runner', 'brute']);
  });

  it('grows monotonically', () => {
    for (let n = 1; n < 20; n++) {
      expect(waveTotal(n + 1)).toBeGreaterThan(waveTotal(n));
    }
  });

  it('treats bad input as wave 1', () => {
    expect(waveComposition(0)).toEqual(waveComposition(1));
    expect(waveComposition(-3)).toEqual(waveComposition(1));
  });
});

describe('waveSpawnList', () => {
  it('has one entry per enemy in the composition', () => {
    const list = waveSpawnList(5, mulberry32(1));
    expect(list).toHaveLength(waveTotal(5));
    const count = (t) => list.filter((x) => x === t).length;
    for (const { type, count: c } of waveComposition(5)) {
      expect(count(type)).toBe(c);
    }
  });
});

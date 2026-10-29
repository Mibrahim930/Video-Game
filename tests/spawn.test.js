import { describe, it, expect } from 'vitest';
import { edgeSpawnPoint, directionTo } from '../src/logic/spawn.js';
import { mulberry32 } from '../src/logic/rng.js';

describe('edgeSpawnPoint', () => {
  it('always lands exactly margin outside one edge', () => {
    const rng = mulberry32(11);
    const W = 960;
    const H = 540;
    const M = 40;
    const sides = new Set();
    for (let i = 0; i < 400; i++) {
      const { x, y } = edgeSpawnPoint(rng, W, H, M);
      const onTop = y === -M && x >= 0 && x <= W;
      const onBottom = y === H + M && x >= 0 && x <= W;
      const onLeft = x === -M && y >= 0 && y <= H;
      const onRight = x === W + M && y >= 0 && y <= H;
      expect([onTop, onBottom, onLeft, onRight].filter(Boolean)).toHaveLength(1);
      sides.add(onTop ? 'top' : onBottom ? 'bottom' : onLeft ? 'left' : 'right');
    }
    expect(sides.size).toBe(4);
  });
});

describe('directionTo', () => {
  it('returns a unit vector toward the target', () => {
    const d = directionTo(0, 0, 3, 4);
    expect(d.x).toBeCloseTo(0.6);
    expect(d.y).toBeCloseTo(0.8);
  });

  it('returns zero when points coincide', () => {
    expect(directionTo(5, 5, 5, 5)).toEqual({ x: 0, y: 0 });
  });
});

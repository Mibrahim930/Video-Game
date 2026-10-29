import { describe, it, expect } from 'vitest';
import { spreadAngles, canFire, velocityFromAngle } from '../src/logic/shooting.js';

describe('spreadAngles', () => {
  it('returns a single centred bullet for count 1', () => {
    expect(spreadAngles(1, 10)).toEqual([0]);
  });

  it('is symmetric around zero', () => {
    const a = spreadAngles(3, 10);
    expect(a).toHaveLength(3);
    expect(a[1]).toBeCloseTo(0);
    expect(a[0]).toBeCloseTo(-a[2]);
    expect(a[2]).toBeCloseTo((10 * Math.PI) / 180);
  });

  it('handles even counts with no centre bullet', () => {
    const a = spreadAngles(2, 10);
    const half = (5 * Math.PI) / 180;
    expect(a[0]).toBeCloseTo(-half);
    expect(a[1]).toBeCloseTo(half);
  });

  it('never returns fewer than one angle', () => {
    expect(spreadAngles(0, 10)).toEqual([0]);
  });
});

describe('canFire', () => {
  it('respects the cooldown', () => {
    expect(canFire(1000, 1100, 220)).toBe(false);
    expect(canFire(1000, 1220, 220)).toBe(true);
  });
});

describe('velocityFromAngle', () => {
  it('points right at angle 0 and down at PI/2', () => {
    expect(velocityFromAngle(0, 100).vx).toBeCloseTo(100);
    expect(velocityFromAngle(0, 100).vy).toBeCloseTo(0);
    expect(velocityFromAngle(Math.PI / 2, 100).vy).toBeCloseTo(100);
  });
});

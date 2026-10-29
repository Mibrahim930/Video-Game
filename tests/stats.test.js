import { describe, it, expect } from 'vitest';
import { createPlayerStats, takeDamage, heal, isDead } from '../src/logic/stats.js';
import { PLAYER } from '../src/config.js';

describe('createPlayerStats', () => {
  it('copies base values and starts at full hp', () => {
    const s = createPlayerStats(PLAYER);
    expect(s.hp).toBe(PLAYER.maxHp);
    expect(s.maxHp).toBe(PLAYER.maxHp);
    expect(s.speed).toBe(PLAYER.speed);
    expect(s.bulletCount).toBe(PLAYER.bulletCount);
  });

  it('does not alias the base config', () => {
    const s = createPlayerStats(PLAYER);
    s.speed = 1;
    expect(PLAYER.speed).not.toBe(1);
  });
});

describe('takeDamage / heal / isDead', () => {
  it('clamps hp at zero and reports death', () => {
    const s = createPlayerStats({ ...PLAYER, maxHp: 30 });
    expect(takeDamage(s, 10)).toBe(20);
    expect(isDead(s)).toBe(false);
    expect(takeDamage(s, 50)).toBe(0);
    expect(isDead(s)).toBe(true);
  });

  it('clamps healing at maxHp', () => {
    const s = createPlayerStats({ ...PLAYER, maxHp: 30 });
    takeDamage(s, 25);
    expect(heal(s, 10)).toBe(15);
    expect(heal(s, 100)).toBe(30);
  });
});

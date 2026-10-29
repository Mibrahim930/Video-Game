import { describe, it, expect } from 'vitest';
import { UPGRADES, pickUpgradeChoices, applyUpgrade, getUpgrade } from '../src/logic/upgrades.js';
import { createPlayerStats, takeDamage } from '../src/logic/stats.js';
import { mulberry32 } from '../src/logic/rng.js';
import { PLAYER } from '../src/config.js';

const fresh = () => createPlayerStats(PLAYER);

describe('UPGRADES table', () => {
  it('has unique ids and every upgrade changes something', () => {
    const ids = new Set(UPGRADES.map((u) => u.id));
    expect(ids.size).toBe(UPGRADES.length);
    for (const u of UPGRADES) {
      const s = fresh();
      takeDamage(s, 30); // so heals are observable
      const before = JSON.stringify(s);
      applyUpgrade(s, u);
      expect(JSON.stringify(s), u.id).not.toBe(before);
    }
  });

  it('never pushes hp above maxHp', () => {
    for (const u of UPGRADES) {
      const s = fresh();
      applyUpgrade(s, u.id);
      expect(s.hp).toBeLessThanOrEqual(s.maxHp);
    }
  });

  it('caps rapid fire at the minimum cooldown', () => {
    const s = fresh();
    for (let i = 0; i < 50; i++) applyUpgrade(s, 'rapid');
    expect(s.fireCooldownMs).toBe(60);
    expect(getUpgrade('rapid').available(s)).toBe(false);
  });

  it('caps split shot and hides it afterwards', () => {
    const s = fresh();
    for (let i = 0; i < 10; i++) applyUpgrade(s, 'spread');
    expect(s.bulletCount).toBe(5);
    expect(getUpgrade('spread').available(s)).toBe(false);
  });

  it('only offers medkit when hurt', () => {
    const s = fresh();
    expect(getUpgrade('medkit').available(s)).toBe(false);
    takeDamage(s, 1);
    expect(getUpgrade('medkit').available(s)).toBe(true);
  });

  it('rejects unknown ids', () => {
    expect(() => applyUpgrade(fresh(), 'nope')).toThrow();
  });
});

describe('pickUpgradeChoices', () => {
  it('returns n distinct available upgrades', () => {
    const s = fresh();
    const picks = pickUpgradeChoices(mulberry32(5), 3, s);
    expect(picks).toHaveLength(3);
    expect(new Set(picks.map((u) => u.id)).size).toBe(3);
    expect(picks.some((u) => u.id === 'medkit')).toBe(false);
  });

  it('is deterministic for a seed', () => {
    const a = pickUpgradeChoices(mulberry32(8), 3, fresh()).map((u) => u.id);
    const b = pickUpgradeChoices(mulberry32(8), 3, fresh()).map((u) => u.id);
    expect(a).toEqual(b);
  });

  it('returns fewer when the pool is small', () => {
    const s = fresh();
    for (let i = 0; i < 10; i++) applyUpgrade(s, 'spread');
    for (let i = 0; i < 50; i++) applyUpgrade(s, 'rapid');
    const picks = pickUpgradeChoices(mulberry32(1), 10, s);
    expect(picks.length).toBe(UPGRADES.length - 3); // no spread, rapid, medkit
  });
});

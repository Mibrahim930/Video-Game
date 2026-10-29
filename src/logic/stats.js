// Player stats are a plain object so upgrades and tests can work on them
// without touching Phaser.

export function createPlayerStats(base) {
  return {
    maxHp: base.maxHp,
    hp: base.maxHp,
    speed: base.speed,
    fireCooldownMs: base.fireCooldownMs,
    bulletSpeed: base.bulletSpeed,
    bulletDamage: base.bulletDamage,
    bulletCount: base.bulletCount,
    spreadDeg: base.spreadDeg,
  };
}

/** Reduce hp by `amount`, never below 0. Returns the new hp. */
export function takeDamage(stats, amount) {
  stats.hp = Math.max(0, stats.hp - amount);
  return stats.hp;
}

/** Increase hp by `amount`, never above maxHp. Returns the new hp. */
export function heal(stats, amount) {
  stats.hp = Math.min(stats.maxHp, stats.hp + amount);
  return stats.hp;
}

export function isDead(stats) {
  return stats.hp <= 0;
}

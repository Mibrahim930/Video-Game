// Pure helpers for firing logic.

/**
 * Angle offsets (radians) for `count` bullets fanned around a centre aim,
 * `spreadDeg` degrees apart. One bullet -> [0]. Two -> [-s/2, +s/2]. Etc.
 */
export function spreadAngles(count, spreadDeg) {
  const n = Math.max(1, Math.floor(count));
  const step = (spreadDeg * Math.PI) / 180;
  const offsets = [];
  const start = -((n - 1) / 2) * step;
  for (let i = 0; i < n; i++) {
    offsets.push(start + i * step);
  }
  return offsets;
}

/** True when enough time has passed since the last shot. */
export function canFire(lastFiredAt, now, cooldownMs) {
  return now - lastFiredAt >= cooldownMs;
}

/** Velocity components for a bullet travelling at `angle` radians. */
export function velocityFromAngle(angle, speed) {
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

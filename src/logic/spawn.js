import { randFloat, randInt } from './rng.js';

/**
 * A point just outside a width x height rectangle, `margin` beyond one of
 * its four edges, uniformly along that edge.
 */
export function edgeSpawnPoint(rng, width, height, margin) {
  const side = randInt(rng, 0, 3); // 0 top, 1 right, 2 bottom, 3 left
  switch (side) {
    case 0:
      return { x: randFloat(rng, 0, width), y: -margin };
    case 1:
      return { x: width + margin, y: randFloat(rng, 0, height) };
    case 2:
      return { x: randFloat(rng, 0, width), y: height + margin };
    default:
      return { x: -margin, y: randFloat(rng, 0, height) };
  }
}

/** Unit direction from (ax, ay) toward (bx, by); zero vector if coincident. */
export function directionTo(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: 0, y: 0 };
  return { x: dx / len, y: dy / len };
}

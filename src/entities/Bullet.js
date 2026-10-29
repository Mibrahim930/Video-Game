import Phaser from 'phaser';
import { BULLET, GAME } from '../config.js';
import { velocityFromAngle } from '../logic/shooting.js';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');
    this.damage = 0;
    this.lifeMs = 0;
  }

  fire(x, y, angle, speed, damage) {
    this.enableBody(true, x, y, true, true);
    this.setCircle(BULLET.radius);
    this.setRotation(angle);
    const { vx, vy } = velocityFromAngle(angle, speed);
    this.setVelocity(vx, vy);
    this.damage = damage;
    this.lifeMs = BULLET.lifetimeMs;
  }

  kill() {
    this.disableBody(true, true);
  }

  update(time, delta) {
    this.lifeMs -= delta;
    const out =
      this.x < -BULLET.radius ||
      this.x > GAME.width + BULLET.radius ||
      this.y < -BULLET.radius ||
      this.y > GAME.height + BULLET.radius;
    if (this.lifeMs <= 0 || out) {
      this.kill();
    }
  }
}

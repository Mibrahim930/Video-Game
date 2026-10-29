import Phaser from 'phaser';
import { ENEMIES } from '../config.js';
import { directionTo } from '../logic/spawn.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy-grunt');
    this.type = 'grunt';
    this.hp = 0;
    this.def = ENEMIES.grunt;
  }

  spawn(type, x, y) {
    this.type = type;
    this.def = ENEMIES[type];
    this.hp = this.def.hp;
    this.setTexture(`enemy-${type}`);
    this.enableBody(true, x, y, true, true);
    this.setCircle(this.def.radius);
    this.clearTint();
    this.setAlpha(1);
  }

  /** Apply damage. Returns true when this hit killed the enemy. */
  hit(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.disableBody(true, true);
      return true;
    }
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });
    return false;
  }

  update() {
    const target = this.scene.player;
    if (!target || !target.active) {
      this.setVelocity(0, 0);
      return;
    }
    const d = directionTo(this.x, this.y, target.x, target.y);
    this.setVelocity(d.x * this.def.speed, d.y * this.def.speed);
  }
}

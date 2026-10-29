import Phaser from 'phaser';
import { PLAYER, ARENA, GAME } from '../config.js';
import { createPlayerStats } from '../logic/stats.js';
import { spreadAngles, canFire } from '../logic/shooting.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bullets) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.stats = createPlayerStats(PLAYER);
    this.bullets = bullets;
    this.lastFiredAt = -Infinity;
    this.invulnUntil = 0;

    this.setCircle(PLAYER.radius);
    this.setCollideWorldBounds(true);
    this.body.setBoundsRectangle(
      new Phaser.Geom.Rectangle(
        ARENA.padding,
        ARENA.padding,
        GAME.width - ARENA.padding * 2,
        GAME.height - ARENA.padding * 2,
      ),
    );

    const kb = scene.input.keyboard;
    this.keys = {
      up: [kb.addKey('W'), kb.addKey('UP')],
      down: [kb.addKey('S'), kb.addKey('DOWN')],
      left: [kb.addKey('A'), kb.addKey('LEFT')],
      right: [kb.addKey('D'), kb.addKey('RIGHT')],
    };
  }

  isPressed(dir) {
    return this.keys[dir].some((k) => k.isDown);
  }

  update(time) {
    this.move();
    this.aim();
    if (this.scene.input.activePointer.isDown) {
      this.tryFire(time);
    }
  }

  move() {
    const dx = (this.isPressed('right') ? 1 : 0) - (this.isPressed('left') ? 1 : 0);
    const dy = (this.isPressed('down') ? 1 : 0) - (this.isPressed('up') ? 1 : 0);
    const v = new Phaser.Math.Vector2(dx, dy);
    if (v.lengthSq() > 0) v.normalize().scale(this.stats.speed);
    this.setVelocity(v.x, v.y);
  }

  aim() {
    const p = this.scene.input.activePointer;
    this.setRotation(Phaser.Math.Angle.Between(this.x, this.y, p.worldX, p.worldY));
  }

  tryFire(time) {
    if (!canFire(this.lastFiredAt, time, this.stats.fireCooldownMs)) return;
    this.lastFiredAt = time;
    const muzzle = PLAYER.radius + 2;
    for (const offset of spreadAngles(this.stats.bulletCount, this.stats.spreadDeg)) {
      const angle = this.rotation + offset;
      const bullet = this.bullets.get();
      if (!bullet) break;
      bullet.fire(
        this.x + Math.cos(angle) * muzzle,
        this.y + Math.sin(angle) * muzzle,
        angle,
        this.stats.bulletSpeed,
        this.stats.bulletDamage,
      );
    }
    this.emit('fired');
  }
}

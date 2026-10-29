import Phaser from 'phaser';
import { PLAYER, BULLET, ENEMIES } from '../config.js';

/**
 * Generates every texture procedurally so the game needs no asset files.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.makePlayerTexture();
    this.makeCircleTexture('bullet', BULLET.radius, BULLET.color);
    for (const [name, def] of Object.entries(ENEMIES)) {
      this.makeEnemyTexture(`enemy-${name}`, def.radius, def.color);
    }
    this.scene.start('Menu');
  }

  makePlayerTexture() {
    const r = PLAYER.radius;
    const size = r * 2;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(PLAYER.color, 1);
    g.fillCircle(r, r, r);
    // Darker "barrel" pointing +x so the sprite's rotation shows the aim.
    g.fillStyle(0x0b0e14, 1);
    g.fillRect(r, r - 3, r - 1, 6);
    g.generateTexture('player', size, size);
    g.destroy();
  }

  makeCircleTexture(key, r, color) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 1);
    g.fillCircle(r, r, r);
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();
  }

  makeEnemyTexture(key, r, color) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 1);
    g.fillCircle(r, r, r);
    // Inner dark ring gives enemies a distinct silhouette from bullets.
    g.lineStyle(2, 0x0b0e14, 0.6);
    g.strokeCircle(r, r, Math.max(2, r - 4));
    g.generateTexture(key, r * 2, r * 2);
    g.destroy();
  }
}

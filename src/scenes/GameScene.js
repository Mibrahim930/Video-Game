import Phaser from 'phaser';
import { GAME, ARENA, BULLET } from '../config.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.drawArena();

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: BULLET.poolSize,
      runChildUpdate: true,
    });

    this.player = new Player(this, GAME.width / 2, GAME.height / 2, this.bullets);

    // Hook for automated checks.
    window.__debug = {
      player: () => ({ x: this.player.x, y: this.player.y, rot: this.player.rotation }),
      bullets: () => this.bullets.countActive(true),
    };
  }

  update(time, delta) {
    this.player.update(time, delta);
  }

  drawArena() {
    const g = this.add.graphics();
    g.lineStyle(1, ARENA.gridColor, 1);
    for (let x = 0; x <= GAME.width; x += ARENA.gridSize) {
      g.lineBetween(x, 0, x, GAME.height);
    }
    for (let y = 0; y <= GAME.height; y += ARENA.gridSize) {
      g.lineBetween(0, y, GAME.width, y);
    }
    g.lineStyle(2, ARENA.borderColor, 1);
    g.strokeRect(
      ARENA.padding,
      ARENA.padding,
      GAME.width - ARENA.padding * 2,
      GAME.height - ARENA.padding * 2,
    );
  }
}

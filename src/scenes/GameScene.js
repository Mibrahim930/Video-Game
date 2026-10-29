import Phaser from 'phaser';
import { GAME, ARENA, COLORS, FONT } from '../config.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.drawArena();

    this.add
      .text(GAME.width / 2, GAME.height / 2, 'ARENA SURVIVAL', {
        fontFamily: FONT.family,
        fontSize: '40px',
        color: COLORS.text,
      })
      .setOrigin(0.5);
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

import Phaser from 'phaser';
import { GAME, COLORS, FONT } from '../config.js';
import { loadHighScore } from '../logic/score.js';
import { sfx } from '../audio/sfx.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = GAME.width / 2;
    const storage = typeof localStorage !== 'undefined' ? localStorage : null;
    const highScore = loadHighScore(storage);

    this.add
      .text(cx, 130, 'ARENA SURVIVAL', { fontFamily: FONT.family, fontSize: '56px', color: COLORS.accent })
      .setOrigin(0.5);
    this.add
      .text(cx, 185, 'Survive the waves. Pick your upgrades. Chase the high score.', {
        fontFamily: FONT.family,
        fontSize: '16px',
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const lines = [
      ['Move', 'WASD / Arrows'],
      ['Aim', 'Mouse'],
      ['Fire', 'Hold left button'],
      ['Mute', 'M'],
    ];
    lines.forEach(([k, v], i) => {
      const y = 260 + i * 28;
      this.add.text(cx - 20, y, k, { fontFamily: FONT.family, fontSize: '18px', color: COLORS.muted }).setOrigin(1, 0.5);
      this.add.text(cx + 20, y, v, { fontFamily: FONT.family, fontSize: '18px', color: COLORS.text }).setOrigin(0, 0.5);
    });

    this.add
      .text(cx, 400, highScore > 0 ? `High score ${highScore}` : 'No high score yet', {
        fontFamily: FONT.family,
        fontSize: '18px',
        color: COLORS.good,
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, 460, 'Click or press Space to start', { fontFamily: FONT.family, fontSize: '20px', color: COLORS.accent })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', this.start, this);
    this.input.keyboard.once('keydown-SPACE', this.start, this);
    this.input.keyboard.on('keydown-M', () => sfx.toggleMute());
  }

  start() {
    sfx.unlock();
    this.scene.start('Game');
  }
}

import Phaser from 'phaser';
import { GAME, COLORS, FONT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create({ score = 0, wave = 0, highScore = 0, isNew = false } = {}) {
    const cx = GAME.width / 2;
    this.add.rectangle(cx, GAME.height / 2, GAME.width, GAME.height, 0x0b0e14, 0.75);

    this.add
      .text(cx, 150, 'GAME OVER', { fontFamily: FONT.family, fontSize: '56px', color: COLORS.danger })
      .setOrigin(0.5);

    this.add
      .text(cx, 240, `You survived to wave ${wave}`, {
        fontFamily: FONT.family,
        fontSize: '22px',
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 285, `Score ${score}`, { fontFamily: FONT.family, fontSize: '30px', color: COLORS.text })
      .setOrigin(0.5);

    this.add
      .text(cx, 330, isNew ? `NEW HIGH SCORE!` : `High score ${highScore}`, {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: isNew ? COLORS.good : COLORS.muted,
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(cx, 420, 'Click or press Space to play again', {
        fontFamily: FONT.family,
        fontSize: '18px',
        color: COLORS.accent,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    // Small delay so a held mouse button from the last moments doesn't skip the screen.
    this.time.delayedCall(400, () => {
      this.input.once('pointerdown', this.restart, this);
      this.input.keyboard.once('keydown-SPACE', this.restart, this);
    });
  }

  restart() {
    this.scene.start('Game');
  }
}

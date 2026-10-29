import Phaser from 'phaser';
import { GAME, COLORS, FONT } from '../config.js';

/**
 * Shown between waves on top of a paused Game scene. Emits
 * 'upgrade-chosen' on the Game scene's event emitter.
 */
export default class UpgradeScene extends Phaser.Scene {
  constructor() {
    super('Upgrade');
  }

  create({ choices = [], wave = 0 } = {}) {
    this.chosen = false;
    const cx = GAME.width / 2;
    this.add.rectangle(cx, GAME.height / 2, GAME.width, GAME.height, 0x0b0e14, 0.7);

    this.add
      .text(cx, 90, `WAVE ${wave} CLEAR`, { fontFamily: FONT.family, fontSize: '36px', color: COLORS.good })
      .setOrigin(0.5);
    this.add
      .text(cx, 135, 'Choose an upgrade', { fontFamily: FONT.family, fontSize: '20px', color: COLORS.muted })
      .setOrigin(0.5);

    const cardW = 240;
    const cardH = 180;
    const gap = 30;
    const totalW = choices.length * cardW + (choices.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    choices.forEach((upgrade, i) => {
      const x = startX + i * (cardW + gap);
      const y = 300;
      this.makeCard(x, y, cardW, cardH, upgrade, i + 1);
      this.input.keyboard.once(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR'][i]}`, () => this.choose(upgrade));
    });
  }

  makeCard(x, y, w, h, upgrade, index) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0x141a26, 1).setStrokeStyle(2, 0x2d3a52);
    const num = this.add
      .text(-w / 2 + 14, -h / 2 + 10, `${index}`, { fontFamily: FONT.family, fontSize: '16px', color: COLORS.muted });
    const name = this.add
      .text(0, -30, upgrade.name, { fontFamily: FONT.family, fontSize: '24px', color: COLORS.accent })
      .setOrigin(0.5);
    const desc = this.add
      .text(0, 20, upgrade.description, {
        fontFamily: FONT.family,
        fontSize: '16px',
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: w - 30 },
      })
      .setOrigin(0.5);
    container.add([bg, num, name, desc]);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setStrokeStyle(2, 0x6ee7ff).setFillStyle(0x1b2436));
    bg.on('pointerout', () => bg.setStrokeStyle(2, 0x2d3a52).setFillStyle(0x141a26));
    bg.on('pointerdown', () => this.choose(upgrade));

    container.setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: container, scale: 1, alpha: 1, duration: 250, delay: index * 80, ease: 'Back.easeOut' });
  }

  choose(upgrade) {
    if (this.chosen) return;
    this.chosen = true;
    const game = this.scene.get('Game');
    game.events.emit('upgrade-chosen', upgrade);
    this.scene.resume('Game');
    this.scene.stop();
  }
}

import Phaser from 'phaser';
import { GAME, COLORS, FONT, PLAYER } from '../config.js';
import { sfx } from '../audio/sfx.js';

/**
 * Overlay scene that runs in parallel with Game and only listens to its events.
 */
export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    const style = { fontFamily: FONT.family, fontSize: '18px', color: COLORS.text };

    this.hp = PLAYER.maxHp;
    this.maxHp = PLAYER.maxHp;
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(32, 28, '', style);

    this.waveText = this.add.text(GAME.width / 2, 28, 'WAVE 0', style).setOrigin(0.5, 0);
    this.scoreText = this.add.text(GAME.width - 32, 28, 'SCORE 0', style).setOrigin(1, 0);

    this.banner = this.add
      .text(GAME.width / 2, GAME.height / 2 - 60, '', {
        fontFamily: FONT.family,
        fontSize: '44px',
        color: COLORS.accent,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.muteText = this.add
      .text(GAME.width - 32, GAME.height - 28, '', { fontFamily: FONT.family, fontSize: '14px', color: COLORS.muted })
      .setOrigin(1, 1);
    this.onMuteChanged(sfx.isMuted());
    this.add
      .text(32, GAME.height - 28, 'ESC menu', { fontFamily: FONT.family, fontSize: '14px', color: COLORS.muted })
      .setOrigin(0, 1);

    const game = this.scene.get('Game');
    this.gameEvents = game.events;
    this.gameEvents.on('hp-changed', this.onHpChanged, this);
    this.gameEvents.on('wave-started', this.onWaveStarted, this);
    this.gameEvents.on('wave-cleared', this.onWaveCleared, this);
    this.gameEvents.on('score-changed', this.onScoreChanged, this);
    this.gameEvents.on('mute-changed', this.onMuteChanged, this);
    this.events.once('shutdown', this.onShutdown, this);

    this.drawHp();
  }

  onShutdown() {
    this.gameEvents.off('hp-changed', this.onHpChanged, this);
    this.gameEvents.off('wave-started', this.onWaveStarted, this);
    this.gameEvents.off('wave-cleared', this.onWaveCleared, this);
    this.gameEvents.off('score-changed', this.onScoreChanged, this);
    this.gameEvents.off('mute-changed', this.onMuteChanged, this);
  }

  onMuteChanged(muted) {
    this.muteText.setText(muted ? 'M unmute (muted)' : 'M mute');
  }

  onHpChanged({ hp, maxHp }) {
    this.hp = hp;
    this.maxHp = maxHp;
    this.drawHp();
  }

  onWaveStarted(n) {
    this.waveText.setText(`WAVE ${n}`);
    this.showBanner(`WAVE ${n}`);
  }

  onWaveCleared() {
    this.showBanner('CLEAR');
  }

  onScoreChanged(score) {
    this.scoreText.setText(`SCORE ${score}`);
  }

  drawHp() {
    const x = 32;
    const y = 52;
    const w = 200;
    const h = 12;
    const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    const color = ratio > 0.5 ? 0x7ee787 : ratio > 0.25 ? 0xffa94d : 0xff6b6b;
    this.hpBar.clear();
    this.hpBar.fillStyle(0x1a2030, 1);
    this.hpBar.fillRect(x, y, w, h);
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, w * ratio, h);
    this.hpBar.lineStyle(1, 0x2d3a52, 1);
    this.hpBar.strokeRect(x, y, w, h);
    this.hpText.setText(`HP ${Math.ceil(this.hp)}/${this.maxHp}`);
  }

  showBanner(text) {
    this.banner.setText(text).setAlpha(1).setScale(1.2);
    this.tweens.killTweensOf(this.banner);
    this.tweens.add({
      targets: this.banner,
      alpha: 0,
      scale: 1,
      duration: 900,
      delay: 300,
      ease: 'Quad.easeOut',
    });
  }
}

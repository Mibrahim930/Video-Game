import Phaser from 'phaser';
import { GAME, ARENA, BULLET, WAVES, PLAYER, UPGRADE, ENEMIES } from '../config.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import Enemy from '../entities/Enemy.js';
import { mulberry32 } from '../logic/rng.js';
import { waveSpawnList } from '../logic/waves.js';
import { edgeSpawnPoint } from '../logic/spawn.js';
import { takeDamage, isDead } from '../logic/stats.js';
import { killPoints, saveHighScore } from '../logic/score.js';
import { pickUpgradeChoices, applyUpgrade } from '../logic/upgrades.js';
import { sfx } from '../audio/sfx.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.rng = mulberry32(Date.now() & 0xffffffff);
    this.wave = 0;
    this.pendingSpawns = [];
    this.spawnTimer = null;
    this.waveState = 'idle'; // idle | spawning | fighting | cleared
    this.kills = 0;
    this.score = 0;
    this.gameOver = false;
    this.events.on('enemy-killed', this.onEnemyKilled, this);
    this.events.on('upgrade-chosen', this.onUpgradeChosen, this);

    this.drawArena();

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: BULLET.poolSize,
      runChildUpdate: true,
    });
    this.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 300,
      runChildUpdate: true,
    });

    this.player = new Player(this, GAME.width / 2, GAME.height / 2, this.bullets);
    this.player.on('fired', () => sfx.shoot());

    this.bursts = {};
    for (const type of Object.keys(ENEMIES)) {
      this.bursts[type] = this.add.particles(0, 0, `enemy-${type}`, {
        speed: { min: 80, max: 220 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 200, max: 380 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 1, end: 0 },
        emitting: false,
      });
    }

    this.input.keyboard.on('keydown-M', this.toggleMute, this);
    this.input.keyboard.on('keydown-ESC', this.toMenu, this);

    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyTouchesPlayer, null, this);
    this.physics.add.collider(this.enemies, this.enemies);

    this.events.once('shutdown', this.onShutdown, this);
    this.scene.launch('HUD');

    // Hook for automated checks.
    window.__debug = {
      player: () => ({ x: this.player.x, y: this.player.y, hp: this.player.stats.hp }),
      bullets: () => this.bullets.countActive(true),
      enemies: () => this.enemies.countActive(true),
      kills: () => this.kills,
      score: () => this.score,
      stats: () => ({ ...this.player.stats }),
      wave: () => ({ n: this.wave, state: this.waveState, pending: this.pendingSpawns.length }),
    };

    this.time.delayedCall(WAVES.interWaveDelayMs, () => this.startWave(1));
  }

  update(time, delta) {
    if (this.gameOver) return;
    this.player.update(time, delta);

    if (
      this.waveState === 'fighting' &&
      this.enemies.countActive(true) === 0
    ) {
      this.onWaveCleared();
    }
  }

  // ---- Waves -------------------------------------------------------------

  startWave(n) {
    this.wave = n;
    this.waveState = 'spawning';
    this.pendingSpawns = waveSpawnList(n, this.rng);
    this.events.emit('wave-started', n);
    sfx.waveStart();

    this.spawnTimer = this.time.addEvent({
      delay: WAVES.spawnIntervalMs,
      repeat: this.pendingSpawns.length - 1,
      callback: this.spawnNext,
      callbackScope: this,
    });
  }

  spawnNext() {
    const type = this.pendingSpawns.shift();
    if (!type) return;
    const { x, y } = edgeSpawnPoint(this.rng, GAME.width, GAME.height, WAVES.spawnMargin);
    const enemy = this.enemies.get(x, y);
    if (enemy) enemy.spawn(type, x, y);
    if (this.pendingSpawns.length === 0) {
      this.waveState = 'fighting';
    }
  }

  onWaveCleared() {
    this.waveState = 'cleared';
    this.events.emit('wave-cleared', this.wave);
    this.time.delayedCall(WAVES.interWaveDelayMs, () => {
      if (this.gameOver) return;
      const choices = pickUpgradeChoices(this.rng, UPGRADE.choices, this.player.stats);
      this.scene.launch('Upgrade', { choices, wave: this.wave });
      this.scene.pause();
    });
  }

  onUpgradeChosen(upgrade) {
    applyUpgrade(this.player.stats, upgrade);
    sfx.upgrade();
    this.events.emit('hp-changed', { hp: this.player.stats.hp, maxHp: this.player.stats.maxHp });
    this.events.emit('stats-changed', { ...this.player.stats });
    this.time.delayedCall(WAVES.interWaveDelayMs / 2, () => this.startWave(this.wave + 1));
  }

  onEnemyKilled({ type, wave, x, y }) {
    this.kills += 1;
    this.score += killPoints(type, wave);
    this.events.emit('score-changed', this.score);
    this.bursts[type]?.emitParticleAt(x, y, 8);
    sfx.kill();
  }

  toggleMute() {
    const muted = sfx.toggleMute();
    this.events.emit('mute-changed', muted);
  }

  toMenu() {
    if (this.gameOver) return;
    this.scene.stop('HUD');
    this.scene.stop('Upgrade');
    this.scene.start('Menu');
  }

  // ---- Collisions --------------------------------------------------------

  onBulletHitsEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    const killed = enemy.hit(bullet.damage);
    bullet.kill();
    if (!killed) sfx.hit();
    if (killed) {
      this.events.emit('enemy-killed', { type: enemy.type, wave: this.wave, x: enemy.x, y: enemy.y });
    }
  }

  onEnemyTouchesPlayer(player, enemy) {
    const now = this.time.now;
    if (!enemy.active || now < player.invulnUntil) return;
    player.invulnUntil = now + PLAYER.hitInvulnMs;
    takeDamage(player.stats, enemy.def.damage);
    this.events.emit('hp-changed', { hp: player.stats.hp, maxHp: player.stats.maxHp });
    player.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (!this.gameOver) player.clearTint();
    });
    this.cameras.main.shake(120, 0.006);
    sfx.hurt();

    if (isDead(player.stats)) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    this.physics.pause();
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.player.setVelocity(0, 0);
    this.player.setTint(0x555555);

    const storage = typeof localStorage !== 'undefined' ? localStorage : null;
    const { highScore, isNew } = saveHighScore(storage, this.score);
    const result = { score: this.score, wave: this.wave, highScore, isNew };
    this.events.emit('player-died', result);
    sfx.gameOver();
    this.cameras.main.shake(300, 0.01);

    this.time.delayedCall(600, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', result);
    });
  }

  onShutdown() {
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.input.keyboard.off('keydown-M', this.toggleMute, this);
    this.input.keyboard.off('keydown-ESC', this.toMenu, this);
    this.events.off('enemy-killed', this.onEnemyKilled, this);
    this.events.off('upgrade-chosen', this.onUpgradeChosen, this);
    window.__debug = null;
  }

  // ---- Drawing -----------------------------------------------------------

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

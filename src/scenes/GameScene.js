import Phaser from 'phaser';
import { GAME, ARENA, BULLET, WAVES, PLAYER } from '../config.js';
import Player from '../entities/Player.js';
import Bullet from '../entities/Bullet.js';
import Enemy from '../entities/Enemy.js';
import { mulberry32 } from '../logic/rng.js';
import { waveSpawnList } from '../logic/waves.js';
import { edgeSpawnPoint } from '../logic/spawn.js';
import { takeDamage, isDead } from '../logic/stats.js';

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
    this.events.on('enemy-killed', () => { this.kills += 1; });

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

    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyTouchesPlayer, null, this);
    this.physics.add.collider(this.enemies, this.enemies);

    this.events.once('shutdown', this.onShutdown, this);

    // Hook for automated checks.
    window.__debug = {
      player: () => ({ x: this.player.x, y: this.player.y, hp: this.player.stats.hp }),
      bullets: () => this.bullets.countActive(true),
      enemies: () => this.enemies.countActive(true),
      kills: () => this.kills,
      wave: () => ({ n: this.wave, state: this.waveState, pending: this.pendingSpawns.length }),
    };

    this.time.delayedCall(WAVES.interWaveDelayMs, () => this.startWave(1));
  }

  update(time, delta) {
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
    this.time.delayedCall(WAVES.interWaveDelayMs, () => this.startWave(this.wave + 1));
  }

  // ---- Collisions --------------------------------------------------------

  onBulletHitsEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    const killed = enemy.hit(bullet.damage);
    bullet.kill();
    if (killed) {
      this.events.emit('enemy-killed', { type: enemy.type, wave: this.wave, x: enemy.x, y: enemy.y });
    }
  }

  onEnemyTouchesPlayer(player, enemy) {
    const now = this.time.now;
    if (!enemy.active || now < player.invulnUntil) return;
    player.invulnUntil = now + PLAYER.hitInvulnMs;
    takeDamage(player.stats, enemy.def.damage);
    this.events.emit('player-hit', player.stats.hp);
    player.setTintFill(0xffffff);
    this.time.delayedCall(80, () => player.clearTint());

    if (isDead(player.stats)) {
      this.events.emit('player-died', { wave: this.wave });
      this.scene.restart();
    }
  }

  onShutdown() {
    if (this.spawnTimer) this.spawnTimer.remove(false);
    this.events.off('enemy-killed');
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

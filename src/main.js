import Phaser from 'phaser';
import { GAME } from './config.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: GAME.backgroundColor,
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

const game = new Phaser.Game(config);

// Exposed for debugging and automated checks.
window.__game = game;

export default game;

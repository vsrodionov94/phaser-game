import * as Phaser from "phaser";
import { StartScene } from "./scenes/StartScene";
import  GameScene  from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "minesweeper",
    width: 800,
    height: 600,
    backgroundColor: "#F0FFFF",
    scene: [StartScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
};

export default new Phaser.Game(config);
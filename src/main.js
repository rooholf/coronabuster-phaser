import CoronaBusterScene from "./scenes/CoronaBusterScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 620,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, //--------> 3. gravitasi 0 agar pesawat tidak jatuh
    },
  },
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    CoronaBusterScene
  ]
};

export default new Phaser.Game(config);

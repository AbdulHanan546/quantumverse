import Phaser from "phaser";

export function loadSimulation(id: string, container: HTMLElement) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: { create() { this.add.text(100, 100, `Sim: ${id}`, { color: "#fff" }); } }
  };
  return new Phaser.Game(config);
}

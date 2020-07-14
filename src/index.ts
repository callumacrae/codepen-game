import * as PIXI from 'pixi.js';

import World from './world';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.load((loader, resources) => {
  if (!resources.dungeonTiles) {
    throw new Error('Failed to load required resources');
  }

  const world = new World();

  const worldContainer = world.draw();
  worldContainer.position.set(80, 98);
  app.stage.addChild(worldContainer);
});

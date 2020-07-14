import * as PIXI from 'pixi.js';

import * as world from './world';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.load((loader, resources) => {
  const sheet = resources.dungeonTiles;

  if (!sheet || !sheet.textures) {
    throw new Error('Failed to load required resources');
  }

  const { width, height, collisionMap } = world.generateCollisionMap();
  const { tileMap } = world.generateTileMap(width, height, collisionMap);
  const { background } = world.drawWorld(width, height, tileMap);
  app.stage.addChild(background);
});

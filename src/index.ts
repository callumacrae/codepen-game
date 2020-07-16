import * as PIXI from 'pixi.js';

import World from './world';
import Level from './level';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.add('characters', 'assets/characters.json');
app.loader.load(() => {
  const world = new World();

  const worldContainer = world.draw();
  worldContainer.position.set(80, 92);
  app.stage.addChild(worldContainer);

  const level = new Level('intro');
  world.play(level);

  app.ticker.add((delta) => {
    world.update(delta, app.ticker.elapsedMS);
  });
});

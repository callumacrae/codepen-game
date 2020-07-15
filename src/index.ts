import * as PIXI from 'pixi.js';

import World from './world';
import Character from './character';

import randomMovement from './algorithms/01-random-movement';
import betterFind from './algorithms/03-better-find';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.add('characters', 'assets/characters.json');
app.loader.load((loader, resources) => {
  if (!resources.dungeonTiles || !resources.characters) {
    throw new Error('Failed to load required resources');
  }

  const world = new World();

  const worldContainer = world.draw();
  worldContainer.position.set(80, 92);
  app.stage.addChild(worldContainer);

  const characters: Character[] = [];

  const player = new Character('robot', false);
  world.add(player);
  player.setPosition([7, 3]);
  player.setInstructions((data, libs) => {
    // console.log(data);
    return randomMovement(data, libs);
  });
  characters.push(player);

  const zombie = new Character('zombie');
  world.add(zombie);
  zombie.setPosition([10, 8]);
  zombie.setInstructions(betterFind);
  characters.push(zombie);

  // const skeleton = new Character('skeleton');
  // world.add(skeleton);
  // skeleton.setPosition([1, 5]);
  // skeleton.setInstructions(randomMovement);
  // characters.push(skeleton);

  const instructionEvery = 1000;

  const isColliding = (a: Character, b: Character) => {
    const aPosition = a.getRealPosition();
    const bPosition = b.getRealPosition();

    if (!aPosition || !bPosition) {
      return false;
    }

    return (
      Math.abs(aPosition[0] - bPosition[0]) < 1 &&
      Math.abs(aPosition[1] - bPosition[1]) < 1
    );
  };

  let timeSinceLastInstruction = 0;
  app.ticker.add((delta) => {
    characters.forEach((character) =>
      character.update(delta, timeSinceLastInstruction)
    );

    if (isColliding(player, zombie)) {
      console.log('colliding');
    }

    timeSinceLastInstruction += app.ticker.elapsedMS;

    if (timeSinceLastInstruction > instructionEvery) {
      timeSinceLastInstruction = 0;
      characters.forEach((character) =>
        character.runInstruction(instructionEvery)
      );
    }
  });
});

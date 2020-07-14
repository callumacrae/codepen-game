import * as PIXI from 'pixi.js';

import World from './world';
import Character, { Command, InstructionFnType } from './character';

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
  worldContainer.position.set(80, 98);
  app.stage.addChild(worldContainer);

  const randomMovement: InstructionFnType = (
    { previousCommands, availableCommands },
    { random }
  ) => {
    const previousCommand = previousCommands[previousCommands.length - 1];
    const oppositeCommand = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }[previousCommand] as Command;

    if (oppositeCommand && availableCommands.length > 1) {
      availableCommands.splice(availableCommands.indexOf(oppositeCommand), 1);
    }

    return random.pick(availableCommands);
  };

  const characters: Character[] = [];

  const player = new Character('robot');
  world.add(player);
  player.setPosition([7, 3]);
  player.setInstructions((data, libs) => {
    // console.log(data);
    return randomMovement(data, libs);
  });
  characters.push(player);

  const zombie = new Character('zombie');
  world.add(zombie);
  zombie.setPosition([11, 8]);
  zombie.setInstructions(randomMovement);
  characters.push(zombie);

  const skeleton = new Character('skeleton');
  world.add(skeleton);
  skeleton.setPosition([1, 5]);
  skeleton.setInstructions(randomMovement);
  characters.push(skeleton);

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

    if (isColliding(player, zombie) || isColliding(player, skeleton)) {
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

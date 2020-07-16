import * as PIXI from 'pixi.js';

import World from './world';
import Level from './level';
import { InstructionFnType } from './character';

import introText from './utils/intro-text';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

interface GameSetupObj {
  play: () => void;
  showHelp: () => void;
}

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.add('characters', 'assets/characters.json');
app.loader.add('goodNeighborsFont', 'assets/good_neighbors_starling.xml');
app.loader.load(() => {
  const world = new World();

  const worldContainer = world.draw();
  worldContainer.position.set(80, 92);
  app.stage.addChild(worldContainer);

  function showIntro() {
    let currentIndex = 0;
    world.setOverlay(introText[0]);

    app.view.addEventListener('click', () => {
      if (currentIndex >= introText.length - 1) {
        return;
      }
      currentIndex++;
      world.setOverlay(introText[currentIndex]);
    });
  }

  let isPlaying = false;
  let showHelp = false;
  const gameSetupObj: GameSetupObj = {
    play() {
      isPlaying = true;
      const level = new Level('one');
      world.play(level);
    },
    showHelp() {
      showHelp = true;
    },
  };

  if (window.run && window.run.setup) {
    window.run.setup(gameSetupObj);
  }

  if (!isPlaying) {
    const intro = new Level('intro');
    world.play(intro);
    showIntro();
  } else if (showHelp) {
    world.showHelp();
  }

  app.ticker.add((delta) => {
    world.update(delta, app.ticker.elapsedMS);
  });
});

declare global {
  interface Window {
    run: {
      setup: (game: GameSetupObj) => void;
      instruction: InstructionFnType;
    };
  }
}

window.run = {
  /**
   * The setup function is ran once per page load and controls
   * how the game should run.
   */
  setup(
    game
  ) {
    // prettier-ignore
    /* Uncomment this to begin! */
    // game.play()

    /* For help, uncomment this next line. */
    // game.showHelp();

    /* To set a fixed seed and make the randomness less random,
       uncomment out the following line. */
    // game.setSeed('test')
  },
  /**
   * The instruction function is called repeatedly, once per
   * move, and is used to control the robot.
   *
   * Moves get progressively quicker as the levels go on to
   * really put your code to the test.
   *
   * To execute a command, return it from this function.
   */
  instruction(data, { random }) {
    // To see a full explanation of everything in the data
    // object, check out the source on github:

    // You can use the isGround function to test whether a
    // given position is ground or not:
    // const canRun = isGround(10, 5)

    // Right now we're just running in a random available
    // direction, which might beat the first level, but
    // won't get you much further.
    return random.pick(data.availableCommands);
  },
};

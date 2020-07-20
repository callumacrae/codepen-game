import * as PIXI from 'pixi.js';
import Cookies from 'js-cookie';
import * as random from '@callumacrae/utils/random';

import World from './world';
import Level from './level';
import { LevelId } from './data/levels';
import { InstructionFnType } from './character';

import {
  introText,
  deathText,
  winText,
  loadErrorText,
  gameResetText,
  creditsText,
  errorText,
} from './data/overlay-text';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

interface GameSetupObj {
  play: () => void;
  showHelp: () => void;
  showCredits: () => void;
  reset: () => void;
  setSeed: (seed: string) => void;
}

app.loader.add(
  'dungeonTiles',
  'https://codepen-game.vercel.app/assets/dungeon_tiles_4.json'
);
app.loader.add(
  'characters',
  'https://codepen-game.vercel.app/assets/characters.json'
);
app.loader.add(
  'goodNeighborsFont',
  'https://codepen-game.vercel.app/assets/good_neighbors_starling.xml'
);
app.loader.load(() => {
  let world: World;
  const createWorld = () => {
    const world = new World();

    const worldContainer = world.draw();
    worldContainer.position.set(80, 92);
    app.stage.addChild(worldContainer);

    return world;
  };

  let isPlaying = false;
  let isResetting = false;
  let showHelp = false;
  let showCredits = false;
  const gameSetupObj: GameSetupObj = {
    play() {
      isPlaying = true;
    },
    showHelp() {
      showHelp = true;
    },
    showCredits() {
      showCredits = true;
    },
    reset() {
      isResetting = true;
    },
    setSeed(seed: string) {
      random.setSeed(seed);
    },
  };

  if (window.run && window.run.setup) {
    try {
      window.run.setup(gameSetupObj);
    } catch (err) {
      world = createWorld();
      world.setOverlay(errorText.replace('{{place}}', 'setup'));
      throw err;
    }

    world = createWorld();

    if (!isPlaying || isResetting || showCredits) {
      const intro = new Level('intro');
      world.play(intro);

      if (isResetting) {
        Cookies.remove('current-level');
        world.setOverlay(gameResetText);
      } else if (showCredits) {
        world.setOverlay(creditsText, true);
      } else {
        // Show intro text
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
    } else {
      function startGame() {
        let levelId = Cookies.get('current-level');
        if (!levelId || !Level.isLevel(levelId)) {
          levelId = 'one';
        }
        const level = new Level(levelId as LevelId);
        level.on('death', () => {
          world.setOverlay(deathText);
        });
        level.on('win', () => {
          world.setOverlay(winText);
          Cookies.set('current-level', level.getNextLevel());

          app.view.addEventListener('click', () => {
            world.endLevel();
            world.hideOverlay();
            startGame();
          });
        });
        world.play(level);
      }

      startGame();

      if (showHelp) {
        world.showHelp();
      }
    }
  } else {
    world = createWorld();
    const intro = new Level('intro');
    world.play(intro);
    world.setOverlay(loadErrorText);

    app.view.addEventListener('click', () => {
      window.location.href =
        'https://codepen.io/callumacrae/pen/bf04524ba5f094774e5de81fb2c8f229?editors=0010';
    });
  }

  let isError = false;
  app.ticker.add((delta) => {
    if (isError) {
      return;
    }

    try {
      world.update(delta, app.ticker.elapsedMS);
    } catch (err) {
      // We can't throw the error or pixi doesn't show the overlay
      isError = true;
      console.error(err);
    }
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

if (process.env.NODE_ENV === 'development') {
  window.run = {
    /**
     * The setup function is ran once per page load and controls
     * how the game should run.
     */
    setup(game) {
      /* Uncomment this to begin! */
      game.play();

      // game.showHelp(); // Show help text for current level
      // game.setSeed('your seed'); // Sets a fixed seed to reduce unpredictability
      // game.reset(); // Resets the game to level one
      // game.showCredits(); // Shows the game credits
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
}

import EventEmitter from '@callumacrae/utils/events';

import Character, { CharacterType, InstructionFnType } from './character';
import World from './world';

import isColliding from './utils/is-colliding';

import randomMovement from './algorithms/01-random-movement';
import shittyFind from './algorithms/02-shitty-find';
import betterFind from './algorithms/03-better-find';
import shortestPath from './algorithms/04-shortest-path';

const algorithms: { [algorithm in Algorithm]: InstructionFnType } = {
  player: (data, libraries) => {
    return window.run.instruction(data, libraries);
  },
  'random-movement': randomMovement,
  'shitty-find': shittyFind,
  'better-find': betterFind,
  'shortest-path': shortestPath,
};

type LevelStatus = 'waiting' | 'playing' | 'dead' | 'completed';

export type LevelId =
  | 'intro'
  | 'one'
  | 'two'
  | 'three'
  | 'four'
  | 'five'
  | 'six'
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten';

type Algorithm =
  | 'player'
  | 'random-movement'
  | 'shitty-find'
  | 'better-find'
  | 'shortest-path';

interface CharacterData {
  character: CharacterType;
  algorithm: Algorithm;
}
interface LevelData {
  player: CharacterData;
  enemies: CharacterData[];
  onCollision: 'teleport' | 'die';
  stages: { duration: number | 'forever'; instructionEvery: number }[];
  helpText: string;
  nextLevel: LevelId;
}

const levelData: { [levelId in LevelId]: LevelData } = {
  intro: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'better-find' },
      { character: 'skeleton', algorithm: 'shortest-path' },
    ],
    onCollision: 'teleport',
    stages: [{ duration: 'forever', instructionEvery: 500 }],
    helpText: '',
    nextLevel: 'one',
  },

  one: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [{ character: 'zombie', algorithm: 'random-movement' }],
    onCollision: 'die',
    stages: [
      { duration: 5e3, instructionEvery: 1000 },
      { duration: 5e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'in this level, there is a single enemy',
      'that moves around randomly.',
      '',
      'you can probably avoid it by chance, but',
      'i would recommend exploring the functions',
      'available in the instruction() function',
      'to actually run away from it.',
    ].join('\n'),
    nextLevel: 'two',
  },

  two: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [{ character: 'zombie', algorithm: 'shitty-find' }],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'in this level, the enemy is using a',
      'find algorithm - but it is a bit of',
      'a rubbish one.',
      '',
      'the algorithm walks in your general',
      'direction, but has no logic for going',
      'around obstacles.',
    ].join('\n'),
    nextLevel: 'three',
  },

  three: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [{ character: 'zombie', algorithm: 'better-find' }],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'in this level, the enemy is using a',
      'slightly better find algorithm.',
      '',
      'it again walks in your general direction,',
      'but is a bit better at dealing with',
      'obstacles.',
    ].join('\n'),
    nextLevel: 'four',
  },

  four: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [{ character: 'zombie', algorithm: 'shortest-path' }],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'uh oh, the enemy has got smarter!',
      '',
      "it's now using breadth-first search",
      'to find the shortest path between',
      "you and it - you can't rely on luck",
      'to beat this one!',
    ].join('\n'),
    nextLevel: 'five',
  },

  five: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'random-movement' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'there are now two enemies.',
      '',
      'the zombie is using the same shortest',
      'path algorithm as last time, while the',
      'new enemy, the skeleton, is moving',
      'randomly.',
    ].join('\n'),
    nextLevel: 'six',
  },

  six: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'shitty-find' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'the skeleton is getting smarter, sort of.',
      '',
      'the zombie is using the shortest path',
      'algorithm again, and the skeleton is using',
      'the rubbish find algorithm you saw before.',
    ].join('\n'),
    nextLevel: 'seven',
  },

  seven: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'better-find' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'the zombie is using the shortest path',
      'algorithm again.',
      '',
      'the skeleton is using the slightly',
      "better find algorithm (it's improving",
      'in the same way the zombie did before).',
    ].join('\n'),
    nextLevel: 'eight',
  },

  eight: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'shortest-path' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'both enemies are now using the',
      'shortest path algorithm.',
      '',
      'good luck. you will need it.',
    ].join('\n'),
    nextLevel: 'nine',
  },

  nine: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'shortest-path' },
      { character: 'zombie', algorithm: 'shortest-path' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: [
      'there are now three enemies, all',
      'using the shortest path algorithm.',
      '',
      "i'm not sure you'll beat this.",
    ].join('\n'),
    nextLevel: 'ten',
  },

  ten: {
    player: {
      character: 'robot',
      algorithm: 'player',
    },
    enemies: [
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'shortest-path' },
      { character: 'zombie', algorithm: 'shortest-path' },
      { character: 'skeleton', algorithm: 'shortest-path' },
      { character: 'zombie', algorithm: 'shortest-path' },
    ],
    onCollision: 'die',
    stages: [
      { duration: 10e3, instructionEvery: 500 },
      { duration: 10e3, instructionEvery: 100 },
    ],
    helpText: 'lol',
    nextLevel: 'ten', // like anyone is gonna complete this anyway
  },
};

export default class Level extends EventEmitter {
  private status: LevelStatus;
  private levelData: LevelData;
  private timeSinceStageStart: number;
  private timeSinceLastInstruction: number;
  private stage: number;
  private world?: World;

  constructor(levelId: LevelId) {
    super();

    this.status = 'waiting';
    this.levelData = levelData[levelId];
    this.timeSinceStageStart = 0;
    // Start immediately
    this.timeSinceLastInstruction = 1e6;
    this.stage = 0;
  }

  begin(world: World) {
    this.status = 'playing';
    this.world = world;

    const { player: playerData, enemies } = this.levelData;

    const player = new Character(playerData.character, false);
    world.add(player);
    player.teleport();
    const playerPosition = player.getPosition();
    player.setInstructions(algorithms[playerData.algorithm]);

    enemies.forEach((enemyData) => {
      const enemy = new Character(enemyData.character);
      world.add(enemy);
      enemy.teleport((suggestedPosition) => {
        const distX = Math.abs(suggestedPosition[0] - playerPosition[0]);
        const distY = Math.abs(suggestedPosition[1] - playerPosition[1]);

        return distX + distY > 7;
      });
      enemy.setInstructions(algorithms[enemyData.algorithm]);
    });
  }

  update(delta: number, elapsedMS: number) {
    if (!this.world) {
      throw new Error("Trying to update level that isn't attached to world.");
    }

    if (this.status !== 'playing') {
      return;
    }

    const characters = this.world.getCharacters();

    // @TODO is this right?!
    this.timeSinceStageStart += elapsedMS;
    this.timeSinceLastInstruction += elapsedMS;

    let currentStage = this.levelData.stages[this.stage];
    if (
      currentStage.duration !== 'forever' &&
      this.timeSinceStageStart > currentStage.duration
    ) {
      this.stage++;

      if (this.stage >= this.levelData.stages.length) {
        this.status = 'completed';
        this.emit('win');
        return;
      }

      currentStage = this.levelData.stages[this.stage];
      this.timeSinceStageStart = 0;
    }

    const instructionEvery = currentStage.instructionEvery;

    characters.forEach((character) =>
      character.update(delta, this.timeSinceLastInstruction)
    );

    const [player, ...enemies] = characters;
    if (enemies.some((enemy) => isColliding(player, enemy))) {
      const { onCollision } = this.levelData;
      if (onCollision === 'teleport') {
        // This is actually horrifically buggy, but I LOVE IT
        player.teleport();
      } else if (onCollision === 'die') {
        this.status = 'dead';
        this.emit('death');
        return;
      } else {
        throw new Error(`onCollision type "${onCollision}" not yet supported.`);
      }
    }

    if (this.timeSinceLastInstruction > instructionEvery) {
      this.timeSinceLastInstruction = 0;
      characters.forEach((character) =>
        character.runInstruction(instructionEvery)
      );
    }
  }

  end() {
    if (!this.world) {
      throw new Error("Trying to end level that isn't attached to world.");
    }

    this.world.clear();
  }

  getHelpText() {
    return this.levelData.helpText;
  }

  getNextLevel() {
    return this.levelData.nextLevel;
  }

  static isLevel(id: string) {
    return id in levelData;
  }
}

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

type LevelId = 'intro' | 'one';
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
  },
};

export default class Level {
  private levelData: LevelData;
  private timeSinceStageStart: number;
  private timeSinceLastInstruction: number;
  private stage: number;
  private world?: World;

  constructor(levelId: LevelId) {
    this.levelData = levelData[levelId];
    this.timeSinceStageStart = 0;
    // Start immediately
    this.timeSinceLastInstruction = 1e6;
    this.stage = 0;
  }

  begin(world: World) {
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

    const characters = this.world.getCharacters();

    this.timeSinceStageStart += elapsedMS;
    this.timeSinceLastInstruction += elapsedMS;

    let currentStage = this.levelData.stages[this.stage];
    if (
      currentStage.duration !== 'forever' &&
      this.timeSinceStageStart > currentStage.duration
    ) {
      this.stage++;

      if (this.stage >= this.levelData.stages.length) {
        throw new Error('TODO');
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
}

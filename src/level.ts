import Character, { CharacterType, InstructionFnType } from './character';
import World from './world';

import isColliding from './utils/is-colliding';

import randomMovement from './algorithms/01-random-movement';
import shittyFind from './algorithms/02-shitty-find';
import betterFind from './algorithms/03-better-find';
import shortestPath from './algorithms/04-shortest-path';

const algorithms: { [algo in Algorithm]: InstructionFnType } = {
  'random-movement': randomMovement,
  'shitty-find': shittyFind,
  'better-find': betterFind,
  'shortest-path': shortestPath,
};

type LevelId = 'intro';
type Algorithm =
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
}

const levelData: { [levelId in LevelId]: LevelData } = {
  intro: {
    player: {
      character: 'robot',
      algorithm: 'random-movement',
    },
    enemies: [{ character: 'zombie', algorithm: 'shortest-path' }],
    onCollision: 'teleport',
    stages: [{ duration: 'forever', instructionEvery: 500 }],
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
    this.timeSinceLastInstruction = 0;
    this.stage = 0;
  }

  begin(world: World) {
    this.world = world;

    const { player: playerData, enemies } = this.levelData;

    const player = new Character(playerData.character, false);
    world.add(player);
    player.setPosition([7, 3]);
    player.setInstructions(algorithms[playerData.algorithm]);

    enemies.forEach((enemyData) => {
      const enemy = new Character(enemyData.character);
      world.add(enemy);
      enemy.setPosition([10, 8]);
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

    const [player, zombie] = characters;
    if (isColliding(player, zombie)) {
      if (this.levelData.onCollision === 'teleport') {
        // This is actually horrifically buggy, but I LOVE IT
        player.teleport();
      } else {
        throw new Error('onCollision type not yet supported');
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

    const characters = this.world.getCharacters();
    characters.forEach((character) => {
      // this.world.remove(character);
    });
  }
}

import EventEmitter from '@callumacrae/utils/events';

import Character, { InstructionFnType } from './character';
import { CharacterType } from './data/characters';
import World from './world';

import levelData, { LevelId } from './data/levels';

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
export interface LevelData {
  player: CharacterData;
  enemies: CharacterData[];
  onCollision: 'teleport' | 'die';
  stages: { duration: number | 'forever'; instructionEvery: number }[];
  helpText: string;
  nextLevel: LevelId;
}

export default class Level extends EventEmitter {
  private status: LevelStatus;
  private levelName: LevelId;
  private levelData: LevelData;
  private timeSinceStageStart: number;
  private timeSinceLastInstruction: number;
  private stage: number;
  private world?: World;

  constructor(levelId: LevelId) {
    super();

    this.status = 'waiting';
    this.levelName = levelId;
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

    // You can't win if the help text is showing
    if (!this.world.isShowingOverlay()) {
      this.timeSinceStageStart += elapsedMS;
    }
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
      if (onCollision === 'teleport' || this.world.isShowingOverlay()) {
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

  getName() {
    return this.levelName;
  }

  getNextLevel() {
    return this.levelData.nextLevel;
  }

  static isLevel(id: string) {
    return id in levelData;
  }
}

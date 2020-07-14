import * as PIXI from 'pixi.js';

import World from './world';

type CharacterType = 'robot';
type CharacterState = 'stationary' | 'down' | 'up' | 'left' | 'right';

export type Command = 'left' | 'right' | 'up' | 'down';
export interface InstructionData {
  availableCommands: Command[];
  position: [number, number],
  previousCommands: Command[]
}
type InstructionFnType = (data: InstructionData) => Command;

interface BaseStateObject {
  scale?: [number, number];
  anchor?: [number, number];
  animationSpeed?: number;
}
interface StateObject extends BaseStateObject {
  images: string[];
}

interface TypeObject {
  base: BaseStateObject;
  states: {
    [state in CharacterState]: StateObject;
  };
}

const characterTypes: { [type in CharacterType]: TypeObject } = {
  robot: {
    base: {
      scale: [1.6, 1.6],
      anchor: [0.5, 1],
      animationSpeed: (1 / 60) * 4,
    },
    states: {
      stationary: {
        images: ['Turret Bot-4.png'],
      },
      down: {
        images: [4, 5, 6, 7].map((i) => `Turret Bot-${i}.png`),
      },
      up: {
        // @TODO these are the wrong way round or something
        images: [0, 1, 2, 3].map((i) => `Turret Bot-${i}.png`),
      },
      left: {
        images: [8, 9, 10, 11].map((i) => `Turret Bot-${i}.png`),
      },
      right: {
        scale: [-1.6, 1.6],
        images: [8, 9, 10, 11].map((i) => `Turret Bot-${i}.png`),
      },
    },
  },
};

// @TODO cache his
const getTexturesForState = (type: CharacterType, state: CharacterState) => {
  return characterTypes[type].states[state].images.map((image) =>
    PIXI.Texture.from(image)
  );
};

export default class Character extends PIXI.AnimatedSprite {
  private type: CharacterType;
  private world?: World;
  private currentPosition?: [number, number];
  private instructionFn?: InstructionFnType;
  private tweenDuration?: (duration: number) => void;
  private previousCommands: Command[];

  constructor(type: CharacterType) {
    const initialState = 'stationary';
    const textureArray = getTexturesForState(type, initialState);

    super(textureArray, false);

    this.type = type;
    this.setState(initialState, false);

    this.previousCommands = [];
  }

  setWorld(world: World) {
    this.world = world;
  }

  setState(state: CharacterState, updateTextures = true) {
    // @TODO check if state has actually changed
    const characterInfo = Object.assign(
      {},
      characterTypes[this.type].base,
      characterTypes[this.type].states[state]
    );

    if (updateTextures) {
      this.textures = getTexturesForState(this.type, state);
    }
    if (characterInfo.scale) {
      this.scale.set(...characterInfo.scale);
    }
    if (characterInfo.animationSpeed) {
      this.animationSpeed = characterInfo.animationSpeed;
    }
    if (characterInfo.anchor) {
      this.anchor.set(...characterInfo.anchor);
    }
  }

  setPosition(position: [number, number], animationDuration = 0) {
    if (!this.world) {
      throw new Error(
        "Can't set position of character that isn't in world yet."
      );
    }

    const oldPosition = this.currentPosition;
    if (oldPosition) {
      if (oldPosition[0] !== position[0]) {
        this.setState(oldPosition[0] < position[0] ? 'right' : 'left');
      } else if (oldPosition[1] !== position[1]) {
        this.setState(oldPosition[1] < position[1] ? 'down' : 'up');
      }
    }

    const { tileWidth, tileHeight } = this.world;
    const goTo = ([x, y]: [number, number]) =>
      this.position.set((x + 0.5) * tileWidth, (y + 1) * tileHeight);

    if (animationDuration && oldPosition) {
      const from = oldPosition;
      const to = position;
      const duration = animationDuration;
      this.tweenDuration = (elapsed) => {
        const factor = elapsed / duration;

        goTo([
          from[0] + (to[0] - from[0]) * factor,
          from[1] + (to[1] - from[1]) * factor,
        ]);
      };
    } else {
      goTo(position);
    }

    this.currentPosition = position;
  }

  // @TODO rename back after moving to component pattern
  update2(delta: number, timeSinceLastInstruction: number) {
    super.update(delta);

    if (this.tweenDuration) {
      this.tweenDuration(timeSinceLastInstruction);
    }
  }

  setInstructions(instructionFn: InstructionFnType) {
    this.instructionFn = instructionFn;
  }

  runInstruction(duration: number) {
    if (!this.instructionFn) {
      throw new Error(
        'Trying to run instruction on character with no instructions!'
      );
    }

    if (!this.world) {
      throw new Error('Trying to run instruction on character with no world!');
    }

    const position = this.currentPosition;

    if (!position) {
      throw new Error('Position somehow undefined');
    }

    const availableCommands: Command[] = [];

    if (this.world.isGround(position[0], position[1] - 1)) {
      availableCommands.push('up');
    }

    if (this.world.isGround(position[0], position[1] + 1)) {
      availableCommands.push('down');
    }

    if (this.world.isGround(position[0] - 1, position[1])) {
      availableCommands.push('left');
    }

    if (this.world.isGround(position[0] + 1, position[1])) {
      availableCommands.push('right');
    }

    // Pass copies of data in so that it can't be tampered with
    const data: InstructionData = {
      availableCommands: availableCommands.slice(),
      position: position.slice() as [number, number],
      previousCommands: this.previousCommands.slice(),
    };

    const command = this.instructionFn(data);

    if (!data.availableCommands.includes(command)) {
      throw new Error('Unavailable command used.');
    }

    this.previousCommands.push(command)

    switch (command) {
      case 'up':
        this.setPosition([position[0], position[1] - 1], duration);
        break;

      case 'down':
        this.setPosition([position[0], position[1] + 1], duration);
        break;

      case 'left':
        this.setPosition([position[0] - 1, position[1]], duration);
        break;

      case 'right':
        this.setPosition([position[0] + 1, position[1]], duration);
        break;
    }
  }
}

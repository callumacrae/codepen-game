import * as PIXI from 'pixi.js';

import World from './world';

type CharacterType = 'robot' | 'zombie' | 'skeleton';
type CharacterState = 'stationary' | 'down' | 'up' | 'left' | 'right';

export type Command = 'left' | 'right' | 'up' | 'down';
export interface InstructionData {
  availableCommands: Command[];
  position: [number, number];
  previousCommands: Command[];
}
export type InstructionFnType = (data: InstructionData) => Command;

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
        images: [3, 2, 1, 0].map((i) => `Turret Bot-${i}.png`),
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

  zombie: {
    base: {
      anchor: [0.5, 1],
      animationSpeed: (1 / 60) * 3,
    },
    states: {
      stationary: {
        images: [`zombie_n_skeleton2-0.png`],
      },
      down: {
        images: [0, 1, 2].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      up: {
        images: [27, 28, 29].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      left: {
        images: [9, 10, 11].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      right: {
        images: [18, 19, 20].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
    },
  },

  skeleton: {
    base: {
      scale: [0.9, 0.9],
      anchor: [0.5, 1],
      animationSpeed: (1 / 60) * 3,
    },
    states: {
      stationary: {
        images: [`zombie_n_skeleton2-3.png`],
      },
      down: {
        images: [3, 4, 5].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      up: {
        images: [30, 31, 32].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      left: {
        images: [12, 13, 14].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
      right: {
        images: [21, 22, 23].map((i) => `zombie_n_skeleton2-${i}.png`),
      },
    }
  }
};

const textureCache = new WeakMap();
const getTexturesForState = (type: CharacterType, state: CharacterState) => {
  const images = characterTypes[type].states[state].images;
  if (textureCache.has(images)) {
    return textureCache.get(images);
  }
  const textures = images.map((image) => PIXI.Texture.from(image));
  textureCache.set(images, textures);
  return textures;
};

export default class Character {
  private sprite: PIXI.AnimatedSprite;
  private type: CharacterType;
  private currentState?: CharacterState;
  private world?: World;
  private currentPosition?: [number, number];
  private instructionFn?: InstructionFnType;
  private tweenDuration?: (duration: number) => void;
  private previousCommands: Command[];

  constructor(type: CharacterType) {
    const initialState = 'stationary';
    const textureArray = getTexturesForState(type, initialState);

    this.sprite = new PIXI.AnimatedSprite(textureArray, false);

    this.type = type;
    this.setState(initialState, false);

    this.previousCommands = [];
  }

  setWorld(world: World) {
    this.world = world;
  }

  private setState(state: CharacterState, updateTextures = true) {
    if (state === this.currentState) {
      return;
    }

    const characterInfo = Object.assign(
      {},
      characterTypes[this.type].base,
      characterTypes[this.type].states[state]
    );

    if (updateTextures) {
      this.sprite.textures = getTexturesForState(this.type, state);
    }
    if (characterInfo.scale) {
      this.sprite.scale.set(...characterInfo.scale);
    }
    if (characterInfo.animationSpeed) {
      this.sprite.animationSpeed = characterInfo.animationSpeed;
    }
    if (characterInfo.anchor) {
      this.sprite.anchor.set(...characterInfo.anchor);
    }

    this.currentState = state;
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
      this.sprite.position.set((x + 0.5) * tileWidth, (y + 1) * tileHeight);

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

  update(delta: number, timeSinceLastInstruction: number) {
    this.sprite.update(delta);

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

    this.previousCommands.push(command);

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

  public getSprite() {
    return this.sprite;
  }
}

import { TypeObject } from '../character';

export type CharacterType = 'robot' | 'zombie' | 'skeleton';

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
      scale: [0.8, 0.8],
      anchor: [0.5, 1],
      animationSpeed: (1 / 60) * 8,
    },
    states: {
      stationary: {
        images: ['skeleton-1.png'],
      },
      down: {
        images: [78, 79, 80, 81, 82, 83, 84, 85, 86].map(
          (i) => `skeleton-${i}.png`
        ),
      },
      up: {
        images: [60, 61, 62, 63, 64, 65, 66, 67, 68].map(
          (i) => `skeleton-${i}.png`
        ),
      },
      left: {
        images: [69, 70, 71, 72, 73, 74, 75, 76, 77].map(
          (i) => `skeleton-${i}.png`
        ),
      },
      right: {
        images: [87, 88, 89, 90, 91, 92, 93, 94, 95].map(
          (i) => `skeleton-${i}.png`
        ),
      },
    },
  },
};

export default characterTypes;

import { LevelData } from '../level';

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

const levelData: { [levelId in LevelId]: LevelData } = {
  intro: {
    player: {
      character: 'robot',
      algorithm: 'random-movement',
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

export default levelData;

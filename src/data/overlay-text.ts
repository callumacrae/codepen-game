export const introText = [
  [
    'hello!',
    '',
    'in this game, you code a robot to',
    'outrun progressively smarter enemies.',
    '',
    "it's playable in codepen: your javascript",
    'tells the robot where to run.',
    '',
    'click to continue.',
  ].join('\n'),
  [
    'as you progress through the game,',
    'the algorithms powering the enemies',
    'get progressively cleverer.',
    '',
    'if you want to beat them, your code will',
    'have to be smarter!',
    '',
    'click to continue.',
  ].join('\n'),
  [
    'take a look at the javascript pane.',
    '',
    'there are two functions: setup controls',
    'the game while instruction controls the',
    'robot.',
    '',
    'currently, the robot is moving at random.',
    '',
    'uncomment out the play() call to begin.',
  ].join('\n'),
];

export const deathText = [
  'you died! :(',
  '',
  'change your code to try again.',
  '',
  'if you need a hint, uncomment the',
  'showHelp() call in the setup function.',
  '',
  'you could also just rerun the game',
  'until you win at random, but that',
  "won't work at later levels.",
].join('\n');

export const winText = [
  'you completed this level!',
  '',
  'nice. well done.',
  '',
  'click here or edit the code to proceed',
  'to the next level.',
].join('\n');

export const loadErrorText = [
  'something has gone wrong.',
  '',
  'the setup function was not found: this',
  "probably means that you're not in",
  'codepen. click on the screen to be taken',
  'there.',
].join('\n');

export const gameResetText =
  'game reset.\n\nre-comment the reset() call to proceed.';

export const creditsText = [
  'game: [callum macrae](https://macr.ae/)',
  '',
  'dungeon tileset: [buch](https://opengameart.org/content/dungeon-tileset)',
  'robot: [corey archer](https://opengameart.org/content/future-robot)',
  'zombie: [artisticdude + reemax](https://opengameart.org/content/zombie-and-skeleton-32x48)',
  'skeleton: [wulax](https://opengameart.org/content/lpc-skeleton)',
  'good neighbors font: [clint bellanger](https://opengameart.org/content/good-neighbors-pixel-font-starlingunity-version-updated)',
].join('\n');

export const errorText = [
  'your {{place}} code threw an error.',
  '',
  'check the console for the error, and',
  'try again.',
].join('\n');

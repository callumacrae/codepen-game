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

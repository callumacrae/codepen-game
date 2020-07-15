import { Command, InstructionFnType } from '../character';

const betterFind: InstructionFnType = (
  { previousCommands, availableCommands, enemyPositions, position },
  { random }
) => {
  const [playerPosition] = enemyPositions;

  const distX = position[0] - playerPosition[0];
  const distY = position[1] - playerPosition[1];

  const previousCommand = previousCommands[previousCommands.length - 1];

  const oppositeCommand = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  }[previousCommand] as Command;

  // Avoid going backwards when possible
  if (oppositeCommand && availableCommands.length > 1) {
    availableCommands.splice(availableCommands.indexOf(oppositeCommand), 1);
  }

  const bestX = distX < 0 ? 'right' : 'left';
  const bestY = distY < 0 ? 'down' : 'up';

  // If both directions are optimal, continue previous direction
  // Helps avoid weird zigzag motion
  if (Math.abs(distX) === Math.abs(distY)) {
    if (
      [bestX, bestY].includes(previousCommand) &&
      availableCommands.includes(previousCommand)
    ) {
      return previousCommand;
    }
  }

  // Travel direction with furthest to go
  if (Math.abs(distX) > Math.abs(distY) || !availableCommands.includes(bestY)) {
    if (availableCommands.includes(bestX)) {
      return bestX;
    }
  }
  if (availableCommands.includes(bestY)) {
    return bestY;
  }

  // Pick a random direction that isn't going backwards if blocked
  return random.pick(availableCommands);
};

export default betterFind;

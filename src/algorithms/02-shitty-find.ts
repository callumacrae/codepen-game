import { Command, InstructionFnType } from '../character';

const shittyFind: InstructionFnType = (
  { availableCommands, enemyPositions, position },
  { random }
) => {
  const [playerPosition] = enemyPositions;

  const distX = position[0] - playerPosition[0];
  const distY = position[1] - playerPosition[1];

  let bestDirections: Command[] = [];
  if (distX !== 0) {
    bestDirections.push(distX < 0 ? 'right' : 'left');
  }
  if (distY !== 0) {
    bestDirections.push(distY < 0 ? 'down' : 'up');
  }

  bestDirections = bestDirections.filter((direction) =>
    availableCommands.includes(direction)
  );

  return random.pick(
    bestDirections.length ? bestDirections : availableCommands
  );
};

export default shittyFind;

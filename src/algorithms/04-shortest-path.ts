import shortestPath from '../utils/shortest-path';
import { InstructionFnType, Position } from '../character';

const shortestPathAlgo: InstructionFnType = (
  { availableCommands, enemyPositions, position },
  { random, isGround }
) => {
  const [playerPosition] = enemyPositions;

  const path = shortestPath(position, playerPosition, isGround, random);
  //
  // This is the next point on the path
  const newPoint = path[path.length - 2];

  // This is very rare but can happen
  if (!newPoint) {
    return random.pick(availableCommands);
  }

  if (newPoint[0] !== position[0]) {
    return newPoint[0] < position[0] ? 'left' : 'right';
  }
  return newPoint[1] < position[1] ? 'up' : 'down';
};

export default shortestPathAlgo;

import { InstructionFnType, Position } from '../character';

const pointsEql = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];

const shortestPath: InstructionFnType = (
  { availableCommands, enemyPositions, position },
  { random, isGround }
) => {
  const [playerPosition] = enemyPositions;

  type Node = { position: Position; previous?: Node };
  const nodes: Node[] = [{ position }];

  const shortestPath: Position[] = [];

  // Breadth first search
  mainLoop: for (let node of nodes) {
    const p = node.position;

    // Shuffle to make it trickier to guess :D
    const potentialPoints: Position[] = random.shuffle([
      [p[0], p[1] + 1],
      [p[0], p[1] - 1],
      [p[0] + 1, p[1]],
      [p[0] - 1, p[1]],
    ]);

    for (const potentialPoint of potentialPoints) {
      if (pointsEql(potentialPoint, playerPosition)) {
        // This logic hasn't been fully tested as most of the points aren't
        // actually used - just the first one on the path
        shortestPath.push(potentialPoint);
        let collapsingPoint: Node | undefined = node;
        do {
          shortestPath.push(collapsingPoint.position);
          collapsingPoint = collapsingPoint.previous;
        } while (collapsingPoint);
        break mainLoop;
      }

      if (!isGround(potentialPoint[0], potentialPoint[1])) {
        continue;
      }

      if (nodes.find((node) => pointsEql(node.position, potentialPoint))) {
        continue;
      }

      nodes.push({
        position: potentialPoint,
        previous: node,
      });
    }
  }

  // This is the next point on the path
  const newPoint = shortestPath[shortestPath.length - 2];

  // This is very rare but can happen
  if (!newPoint) {
    return random.pick(availableCommands);
  }

  if (newPoint[0] !== position[0]) {
    return newPoint[0] < position[0] ? 'left' : 'right';
  }
  return newPoint[1] < position[1] ? 'up' : 'down';
};

export default shortestPath;

import { Position } from '../character';

type Node = { position: Position; previous?: Node };

const pointsEql = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];

export default function shortestPath(
  start: Position,
  end: Position,
  isGround: (a: number, b: number) => boolean,
  // @TODO figure out a way to not pass this in?
  random: any
): Position[] | 'NO_PATH' {
  const nodes: Node[] = [{ position: start }];

  const shortestPath: Position[] = [];

  // Breadth first search
  for (let node of nodes) {
    const p = node.position;

    // Shuffle to make it trickier to predict :D
    const potentialPoints: Position[] = random.shuffle([
      [p[0], p[1] + 1],
      [p[0], p[1] - 1],
      [p[0] + 1, p[1]],
      [p[0] - 1, p[1]],
    ]);

    for (const potentialPoint of potentialPoints) {
      if (pointsEql(potentialPoint, end)) {
        // This logic hasn't been fully tested as most of the points aren't
        // actually used - just the first one on the path
        shortestPath.push(potentialPoint);
        let collapsingPoint: Node | undefined = node;
        do {
          shortestPath.push(collapsingPoint.position);
          collapsingPoint = collapsingPoint.previous;
        } while (collapsingPoint);

        return shortestPath;
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

  return 'NO_PATH';
}

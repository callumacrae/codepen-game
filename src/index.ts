import * as PIXI from 'pixi.js';
import * as random from '@callumacrae/utils/random';

const app = new PIXI.Application({
  backgroundColor: 0x211f27,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

app.loader.add('dungeonTiles', 'assets/dungeon_tiles_4.json');
app.loader.load((loader, resources) => {
  const sheet = resources.dungeonTiles;

  if (!sheet || !sheet.textures) {
    throw new Error('Failed to load required resources');
  }

  const getSprite = (spriteId: number) => {
    // This is literally impossible, dammit typescript
    if (!sheet || !sheet.textures) {
      throw new Error('AAAAa');
    }

    const sprite = new PIXI.Sprite(
      sheet.textures[`dungeon_tiles-${spriteId}.png`]
    );
    sprite.scale.set(2, 2);
    return sprite;
  };

  const tiles = {
    background: {
      topLeft: 0,
      topRight: 4,
      topLeftRight: 75,
      topBottom: 170,
      topBottomLeft: 99,
      topBottomRight: 100,
      bottomLeft: 70,
      bottomRight: 74,
      bottomLeftRight: 89,
      left: [17, 35, 53],
      leftRight: 164,
      top: [1, 2, 3],
      right: [21, 39, 57],
      bottom: [71, 72, 73],
      ground: [18, 19, 20, 36, 37, 38, 54, 55, 56],
    },

    corridor: {
      horizontal: 23,
      vertical: 40,
      topLeft: 22,
      topRight: 24,
      bottomLeft: 58,
      bottomRight: 60,
      deadEndLeft: 99,
      deadEndRight: 100,
      deadEndUp: 75,
      deadEndDown: 89,
    },

    presentational: {
      below: 84,
    },
  };

  // prettier-ignore
  // const tileMap = [
  //    0,  1,  2,  3,  4, -1,  5,  6,  7, -1, -1,
  //   17, 18, 19, 20, 21, -1, 22, 23, 24, -1, -1,
  //   35, 36, 37, 38, 39, -1, 40, 41, 42, -1, -1,
  //   53, 54, 55, 56, 57, -1, 58, 59, 60, -1, -1,
  //   70, 71, 72, 73, 74, -1, -1, -1, -1, -1, 75,
  //   84, 84, 84, 84, 84, -1, 99,100, -1, -1, 89,
  //   -1, -1, -1, -1, -1, -1, 84, 84, -1, -1, 84,
  // ];

  const width = 20;
  const height = 14;

  // prettier-ignore
  const collisionMap = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0,
    0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  const tileMap: number[] = [];

  const getTile = (category: string, tile: string) => {
    // @ts-ignore
    if (!tiles[category] || typeof tiles[category][tile] === 'undefined') {
      throw new Error(`Tile ${category}.${tile} not found`);
    }
    // @ts-ignore
    const id = tiles[category][tile] as number | number[];
    return Array.isArray(id) ? random.pick(id) : id;
  };

  const getId = (x: number, y: number) => y * width + x;
  const isColliding = (x: number, y: number) => {
    if (y < 0 || y >= height || x < 0 || x >= width) {
      return true;
    }
    return !!collisionMap[getId(x, y)];
  };

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height + 1; y++) {
      const id = getId(x, y);
      const colliding = isColliding(x, y);

      if (colliding) {
        if (!isColliding(x, y - 1)) {
          tileMap[id] = getTile('presentational', 'below');
        }
        continue;
      }

      const collisions = [];
      if (isColliding(x, y - 1)) {
        collisions.push('top');
      }
      if (isColliding(x, y + 1)) {
        collisions.push('bottom');
      }
      if (isColliding(x - 1, y)) {
        collisions.push('left');
      }
      if (isColliding(x + 1, y)) {
        collisions.push('right');
      }

      const nameString = collisions.length
        ? collisions
            .map((value, i) =>
              i === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1)
            )
            .join('')
        : 'ground';

      tileMap[id] = getTile('background', nameString);
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height + 1; y++) {
      const tileId = tileMap[x + y * width];

      if (tileId === -1) {
        continue;
      }

      const tile = getSprite(tileId);

      tile.position.set(80 + x * 32, 76 + y * 32);
      app.stage.addChild(tile);
    }
  }
});

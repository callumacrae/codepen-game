import * as PIXI from 'pixi.js';
import * as random from '@callumacrae/utils/random';

import Character from './character';

const tiles = {
  background: {
    topLeft: 0,
    topRight: 4,
    topLeftRight: 75,
    topBottom: 170,
    topBottomLeft: 99,
    topBottomLeftRight: 185,
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

  presentational: {
    below: 84,
  },
};

export default class World {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  collisionMap: number[];
  tileMap: number[];
  private container?: PIXI.Container;

  constructor(width = 20, height = 13) {
    this.width = width;
    this.height = height;

    this.tileWidth = 32;
    this.tileHeight = 32;

    this.collisionMap = this.generateCollisionMap();
    this.tileMap = this.generateTileMap();
  }

  private generateCollisionMap() {
    if (this.width !== 20 || this.height !== 13) {
      throw new Error("Width and height can't be configured yet.");
    }

    // prettier-ignore
    return [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0,
      0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0,
      0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0,
      0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ].map(n => n === 2 ? random.value() < 0.2 ? 1 : 0 : n);
  }

  private getId(x: number, y: number) {
    return y * this.width + x;
  }

  public isGround(x: number, y: number) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
      return false;
    }
    return !this.collisionMap[this.getId(x, y)];
  }

  private generateTileMap() {
    const { width, height } = this;

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

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height + 1; y++) {
        const id = this.getId(x, y);
        const colliding = !this.isGround(x, y);

        if (colliding) {
          if (this.isGround(x, y - 1)) {
            tileMap[id] = getTile('presentational', 'below');
          }
          continue;
        }

        const collisions = [];
        if (!this.isGround(x, y - 1)) {
          collisions.push('top');
        }
        if (!this.isGround(x, y + 1)) {
          collisions.push('bottom');
        }
        if (!this.isGround(x - 1, y)) {
          collisions.push('left');
        }
        if (!this.isGround(x + 1, y)) {
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

    return tileMap;
  }

  public draw() {
    const { width, height, tileMap } = this;

    const textures = PIXI.utils.TextureCache;
    const container = new PIXI.Container();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height + 1; y++) {
        const tileId = tileMap[x + y * width];

        if (tileId === -1) {
          continue;
        }

        const tile = new PIXI.Sprite(textures[`dungeon_tiles-${tileId}.png`]);
        tile.scale.set(2, 2);

        tile.position.set(x * this.tileWidth, y * this.tileHeight);
        container.addChild(tile);
      }
    }

    this.container = container;
    return container;
  }

  public add(character: Character) {
    if (!this.container) {
      throw new Error(
        "Can't add character to a world that hasn't been drawn yet."
      );
    }
    this.container.addChild(character.getSprite());

    character.setWorld(this);
  }
}

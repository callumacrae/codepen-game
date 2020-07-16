import * as PIXI from 'pixi.js';
import * as random from '@callumacrae/utils/random';

import Character from './character';
import Level from './level';

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

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export default class World {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  collisionMap: number[];
  tileMap: [number, Corner[]][];
  private activeLevel?: Level;
  private container?: PIXI.Container;
  private characters: Character[];

  constructor(width = 20, height = 13) {
    this.width = width;
    this.height = height;

    this.tileWidth = 32;
    this.tileHeight = 32;

    this.collisionMap = this.generateCollisionMap();
    this.tileMap = this.generateTileMap();

    this.characters = [];
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

    const tileMap: [number, Corner[]][] = [];

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
            tileMap[id] = [getTile('presentational', 'below'), []];
          } else {
            tileMap[id] = [-1, []];
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

        const corners: Corner[] = [];

        if (
          !collisions.includes('top') &&
          !collisions.includes('left') &&
          !this.isGround(x - 1, y - 1)
        ) {
          corners.push('topLeft');
        }

        if (
          !collisions.includes('top') &&
          !collisions.includes('right') &&
          !this.isGround(x + 1, y - 1)
        ) {
          corners.push('topRight');
        }

        if (
          !collisions.includes('bottom') &&
          !collisions.includes('left') &&
          !this.isGround(x - 1, y + 1)
        ) {
          corners.push('bottomLeft');
        }

        if (
          !collisions.includes('bottom') &&
          !collisions.includes('right') &&
          !this.isGround(x + 1, y + 1)
        ) {
          corners.push('bottomRight');
        }

        tileMap[id] = [getTile('background', nameString), corners];
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
        const tileObj = tileMap[x + y * width];
        const tileId = tileObj[0];

        if (tileId === -1) {
          continue;
        }

        const tile = new PIXI.Sprite(textures[`dungeon_tiles-${tileId}.png`]);
        tile.scale.set(2, 2);

        tile.position.set(x * this.tileWidth, y * this.tileHeight);
        container.addChild(tile);

        const corners = tileObj[1];
        corners.forEach((corner) => {
          const cornerTile = new PIXI.Sprite(textures[`${corner}.png`]);
          cornerTile.scale.set(2, 2);

          const offset = {
            topLeft: [0, 0],
            topRight: [22, 0],
            bottomLeft: [0, 22],
            bottomRight: [22, 22],
          }[corner];

          cornerTile.position.set(
            x * this.tileWidth + offset[0],
            y * this.tileHeight + offset[1]
          );
          container.addChild(cornerTile);
        });
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
    this.characters.push(character);

    character.setWorld(this);
  }

  public remove(character: Character) {
    if (!this.container) {
      throw new Error(
        "Can't remove character from a world that hasn't been drawn yet."
      );
    }
    if (!this.characters) {
      throw new Error(
        "Can't remove character from a world that doesn't have any characters."
      );
    }
    this.container.removeChild(character.getSprite());
    this.characters.splice(this.characters.indexOf(character), 1);
  }

  public clear() {
    if (!this.characters) {
      // World already clear
      return;
    }

    this.characters.forEach((character) => {
      this.remove(character);
    });
  }

  public getCharacters() {
    return this.characters.slice();
  }

  public update(delta: number, elapsedMS: number) {
    if (this.activeLevel) {
      this.activeLevel.update(delta, elapsedMS);
    }
  }

  public play(level: Level) {
    if (this.activeLevel) {
      throw new Error('Can only play one level at once.');
    }

    this.activeLevel = level;

    level.begin(this);
  }
}

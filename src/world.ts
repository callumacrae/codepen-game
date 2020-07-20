import * as PIXI from 'pixi.js';
import * as random from '@callumacrae/utils/random';

import Character from './character';
import Level from './level';
import tiles from './data/dungeon-tiles';

type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export default class World {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  collisionMap: number[];
  tileMap: [number, Corner[]][];
  private activeLevel?: Level;
  private outerContainer?: PIXI.Container;
  private container?: PIXI.Container;
  private characters: Character[];
  private overlay?: {
    text: PIXI.BitmapText;
    container: PIXI.Container;
    links: PIXI.Container[];
  };
  private levelText?: PIXI.Container;

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
    this.outerContainer = new PIXI.Container();
    this.outerContainer.addChild(this.container);
    return this.outerContainer;
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

    this.characters.slice().forEach((character) => {
      this.remove(character);
    });

    if (this.levelText && this.container) {
      this.container.removeChild(this.levelText);
      delete this.levelText;
    }

    this.hideOverlay();
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

    if (!this.container) {
      throw new Error("Can't play level before game is drawn.");
    }

    this.activeLevel = level;

    level.begin(this);

    const widthPx = this.width * this.tileWidth;
    const heightPx = this.height * this.tileHeight;

    const levelName = level.getName();
    if (levelName !== 'intro') {
      const levelText = new PIXI.BitmapText(`level ${levelName}`, {
        fontName: 'GoodNeighbors',
        fontSize: 30,
      });
      levelText.anchor = 1;
      levelText.position.set(widthPx - 10, heightPx + 30);
      this.levelText = levelText;

      this.container.addChild(levelText);
    }
  }

  public endLevel() {
    if (!this.activeLevel) {
      throw new Error("Can't end level when no level in progress.");
    }

    this.activeLevel.end();
    delete this.activeLevel;
  }

  // @TODO make doLinks actually do something
  public setOverlay(string: string, doLinks = false) {
    if (!this.container || !this.outerContainer) {
      throw new Error(
        "Can't show overlay on a world that hasn't been drawn yet."
      );
    }

    if (this.overlay) {
      if (!doLinks && !this.overlay.links.length) {
        this.overlay.text.text = string;
        return;
      } else {
        this.hideOverlay();
      }
    }

    const { outerContainer, container } = this;

    const overlayContainer = new PIXI.Container();

    const widthPx = this.width * this.tileWidth;
    const heightPx = this.height * this.tileHeight;

    const background = new PIXI.Graphics();
    background.beginFill(0x211f27);
    background.drawRect(-32, -32, widthPx + 64, heightPx + 64);
    background.endFill();
    background.alpha = 0.3;
    overlayContainer.addChild(background);

    const textStyle = {
      fontFamily: 'GoodNeighbors',
      fontSize: 35,
    };
    const bitmapTextStyle = {
      ...textStyle,
      fontFamily: undefined,
      fontName: textStyle.fontFamily,
    };

    const linksRegex = /(\[[^\]]+\])\(([^\)]+)\)/g;

    const style = new PIXI.TextStyle(textStyle);
    const stringWithoutLinks = string.replace(
      linksRegex,
      (match, text) => text
    );
    const textMetrics = PIXI.TextMetrics.measureText(stringWithoutLinks, style);
    const stringWidth = textMetrics.width * 0.97;
    const stringHeight = textMetrics.height;
    const lineHeight = 35;

    // This has some caveats:
    // - only works at the end of a line
    // - link text must be unique
    // - links cannot contain brackets
    const linkObjs: { text: string; link: string }[] = [];
    const linkedString = string.replace(linksRegex, (match, text, link) => {
      linkObjs.push({ text, link });
      return '';
    });

    const text = new PIXI.BitmapText(linkedString, bitmapTextStyle);
    text.anchor = new PIXI.Point(0, 0.5);
    text.position.set(widthPx / 2 - stringWidth / 2, heightPx / 2);

    overlayContainer.addChild(text);

    const links: PIXI.BitmapText[] = [];
    const splitString = string.split('\n');
    linkObjs.forEach((linkObj) => {
      const lineNumber = splitString.findIndex((str) =>
        str.includes(linkObj.text)
      );

      const textLink = new PIXI.BitmapText(linkObj.text, {
        ...bitmapTextStyle,
        tint: 0xff0000,
      });
      textLink.anchor = new PIXI.Point(1, 0.5);
      textLink.position.set(
        widthPx / 2 + stringWidth / 2,
        heightPx / 2 - stringHeight / 2 + lineHeight * (lineNumber + 1)
      );

      textLink.interactive = true;
      textLink.buttonMode = true;

      textLink.on('pointerdown', () => {
        window.open(linkObj.link, '_blank');
      });

      links.push(textLink);
      overlayContainer.addChild(textLink);
    });

    container.filters = [new PIXI.filters.BlurFilter(3)];

    outerContainer.addChild(overlayContainer);

    this.overlay = { text, container: overlayContainer, links };
  }

  public hideOverlay() {
    if (!this.container || !this.outerContainer) {
      throw new Error(
        "Can't show overlay on a world that hasn't been drawn yet."
      );
    }

    if (!this.overlay) {
      return;
    }

    const overlayContainer = this.overlay.container;

    this.outerContainer.removeChild(overlayContainer);
    overlayContainer.destroy();
    this.container.filters = [];
    delete this.overlay;
  }

  public isShowingOverlay() {
    return !!this.overlay;
  }

  public showHelp() {
    if (!this.activeLevel) {
      throw new Error('No level to show help for');
    }

    this.setOverlay(this.activeLevel.getHelpText());
  }
}

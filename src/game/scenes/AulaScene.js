import Phaser from 'phaser';
import PlayerStats from '../PlayerStats';
import { textStyles } from '../textStyles';
import BaseScene from './BaseScene';

const TILE = 32;

export default class AulaScene extends BaseScene {
  constructor() {
    super('AulaScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('tileset', '/assets/tilesets/InteriorTilesLITE.png');
    this.load.image('wall1', '/assets/tilesets/Wall_1_32x32.png');
    this.load.image('floor1', '/assets/tilesets/Floor_1_32x32.png');
    this.load.image('others1', '/assets/tilesets/Others_1_32x32.png');
    this.load.image('items1', '/assets/tilesets/Items_1_32x32.png');
    this.load.image('maila', '/assets/spritesheets/maila.png');
    this.load.image('kirves', '/assets/spritesheets/kirves.png');
    this.load.spritesheet('hahmo', '/assets/spritesheets/hahmo.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.audio('punch', '/assets/sfx/punch.mp3');
    this.load.audio('collect', '/assets/sfx/collect.mp3');
    this.load.audio('door', '/assets/sfx/door.mp3');
    this.load.audio('level', '/assets/sfx/level.mp3');
    this.load.tilemapTiledJSON('aula', '/assets/aula.json');
  }

  create() {
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;

    this.areaName = 'aula';
    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');

    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');

    // Suora keydown-kuuntelija pussin poiminnalle (sama tekniikka kuin maila)
    this._onKeyDownE = (ev) => {
      if (ev.code !== 'KeyE' && ev.key !== 'e' && ev.key !== 'E') return;
      this.tryCollectPouch();
      this.tryEnterCity();
    };
    window.addEventListener('keydown', this._onKeyDownE);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this._onKeyDownE);
    });
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Kartta ---
    const map = this.make.tilemap({ key: 'aula' });

    const tsTileset = map.addTilesetImage('InteriorTilesLITE', 'tileset');
    const tsWall = map.addTilesetImage('Wall_1_32x32', 'wall1');
    const tsFloor = map.addTilesetImage('Floor_1_32x32', 'floor1');
    const tsOthers = map.addTilesetImage('Others_1_32x32', 'others1');
    const tsItems = map.addTilesetImage('Items_1_32x32', 'items1');
    const allTilesets = [tsTileset, tsWall, tsFloor, tsOthers, tsItems];

    map.createLayer('Lattia', allTilesets, 0, 0);
    const wallsLayer = map.createLayer('Seinät', allTilesets, 0, 0);
    const furnitureLayer = map.createLayer('Kalusteet', allTilesets, 0, 0);
    const lightsLayer = map.getLayer('Valot')
      ? map.createLayer('Valot', allTilesets, 0, 0)
      : null;

    this.wallsLayer = wallsLayer;
    this.furnitureLayer = furnitureLayer;

    wallsLayer.setDepth(2);
    furnitureLayer.setDepth(3);
    if (lightsLayer) lightsLayer.setDepth(4);

    wallsLayer.setCollisionByExclusion([-1, 0]);
    furnitureLayer.setCollisionByExclusion([-1, 0]);

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050505');

    // --- Aloitus: vasemman yläkulman portaikosta (x10, y3-4) ---
    const startX = 11 * TILE;
    const startY = 3.5 * TILE;

    this.player = this.physics.add.sprite(startX, startY, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'oikea';

    this.createAnimations();
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, furnitureLayer);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.playerShadow = this.add.ellipse(startX, startY + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    // --- Maila kädessä ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Portaikko vasempaan yläaukkoon ---
    this.buildStairs();

    // --- Pimeys + valokeila päällä heti (taskulamppu on jo) ---
    this.flashlightOn = false;
    this.darkGfx = null;
    this.glowGfx = null;
    this.heldFlashlight = null;
    this.enableFlashlightBeam();

    this.emitHint('Rappukäytävän aula. Pilkkopimeää.');
    this.emitStats();

    this.canLeaveAula = false;
    this.leavingAula = false;

    // --- Kimalteleva pussi pöydän vieressä (HP täyteen) ---
    this.pouchTaken = this.isPouchTaken();
    if (!this.pouchTaken) {
      this.createPouch(13 * 32 + 16, 6 * 32 + 16);
    }

    // Kaupunki-ovi (alhaalla keskellä, suljettu — avataan E:llä)
    this.cityDoorX = 15 * 32;
    this.cityDoorY = 19 * 32;
    this.enteringCity = false;
    this.cityHint = this.add.text(this.cityDoorX, this.cityDoorY + 24, 'Ovi kaupunkiin (E)', textStyles.itemHint)
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setVisible(false);

    this.eWasDown = true;
    this.spaceWasDown = true;
  }

  tryEnterCity() {
    if (this.enteringCity) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.cityDoorX, this.cityDoorY
    );
    if (dist < 55) {
      this.enteringCity = true;
      this.playDoorSound();
      this.game.events.emit('game-event', { type: 'aula-to-city' });
    }
  }

  update(time, delta) {
    if (this.isInputBlocked()) {
      this.stopPlayerMovement();
      return;
    }

    const deltaSeconds = delta / 1000;
    const isSprinting = this.keyShift.isDown && this.stats.canSprint();
    const speed = isSprinting ? 240 : 150;

    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.lastDirection = 'vasen';
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.lastDirection = 'oikea';
    }
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      this.lastDirection = 'ylos';
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      this.lastDirection = 'alas';
    }

    const isMoving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
    if (isMoving) {
      this.player.anims.play(`kavele-${this.lastDirection}`, true);
    } else {
      this.player.anims.play(`seiso-${this.lastDirection}`, true);
    }

    this.playerShadow.setPosition(this.player.x, this.player.y + 20);
    this.playerShadow.setScale(isMoving ? 0.92 : 1, isMoving ? 0.85 : 1);

    if (isSprinting && isMoving) {
      this.stats.useSprintEnergy(deltaSeconds, time);
    } else {
      this.stats.regenEnergy(deltaSeconds, time);
    }

    if (this.batCollected) {
      this.updateHeldBat();
    }

    // Valokeila seuraa hahmoa
    if (this.flashlightOn) {
      this.updateFlashlight();
      this.updateLightGlow();
      this.updateHeldFlashlight();
    }

    // Käytävään: kävele portaikon aukosta ulos (x < 10.5, rivit y3-4)
    const auX = this.player.x / 32;
    const auY = this.player.y / 32;
    if (!this.leavingAula && auX < 10.5 && auY > 2.5 && auY < 4.5) {
      this.leavingAula = true;
      this.game.events.emit('game-event', { type: 'aula-to-corridor' });
    }

    // Pussin kimallus + vihje
    if (!this.pouchTaken && this.pouch) {
      this.updatePouchSparkle(time);
      const dPouch = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.pouchX, this.pouchY
      );
      this.pouchHint?.setVisible(dPouch < 50);
    }

    // Kaupunki-oven vihje
    if (this.cityHint) {
      const dCity = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.cityDoorX, this.cityDoorY
      );
      this.cityHint.setVisible(dCity < 55);
    }

    this.eWasDown = this.keyE.isDown;
    this.spaceWasDown = this.keySpace.isDown;
    this.emitStats();
  }
}
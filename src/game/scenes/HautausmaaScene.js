import Phaser from 'phaser';
import BaseScene from './BaseScene';
import PlayerStats from '../PlayerStats';

const TILE = 32;

export default class HautausmaaScene extends BaseScene {
  constructor() {
    super('HautausmaaScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || 'mokki';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    this.load.image('dreckTiles', '/assets/tilesets/dreck auf dreck.png');
    this.load.image('swampBruheTiles', '/assets/tilesets/swamp-brühe animated-v5.png');
    this.load.image('cityTiles', '/assets/tilesets/City Test0.png');
    this.load.image('swampBlubbelnTiles', '/assets/tilesets/swamp blubbeln.png');
    this.load.image('deadSwampTiles', '/assets/tilesets/dead-swamp-v4.png');
    this.load.image('plantsTiles', '/assets/tilesets/Plants.png');
    this.load.image('gyCTiles', '/assets/tilesets/gy_c.png');
    this.load.image('gyDTiles', '/assets/tilesets/gy_d.png');
    this.load.image('deadbushTiles', '/assets/tilesets/deadbush.png');
    this.load.image('dirtpatchTiles', '/assets/tilesets/dirtpatch_sm.png');
    this.load.image('ghostTiles', '/assets/tilesets/ghost4.png');
    this.load.image('pumpkinTiles', '/assets/tilesets/pumpkin_jack.png');
    this.load.image('vinesTiles', '/assets/tilesets/vines_sm1.png');
    this.load.image('batTiles', '/assets/tilesets/bat2.png');
    this.load.image('grassDirtTiles', '/assets/tilesets/1. Grass and dirt.png');

    // Aseet
    this.load.image('maila', '/assets/spritesheets/maila.png');
    this.load.image('kirves', '/assets/spritesheets/kirves.png');

    this.load.spritesheet('hahmo', '/assets/spritesheets/hahmo.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.audio('punch', '/assets/sfx/punch.mp3');

    this.loadEnemyType('cabinZombie');
    this.loadEnemyType('tytto');
    this.loadEnemyType('mohikaani');
    this.loadEnemyType('nainen');
    this.loadEnemyType('mies');
    this.load.tilemapTiledJSON('hautausmaa', '/assets/hautausmaa.json');
  }

  create() {
    this.areaName = 'hautausmaa';
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;

    this.enemies = [];
    this.enemy1Spawned = false;
    this.enemy2Spawned = false;
    this.enemy3Spawned = false;
    this.enemy4Spawned = false;

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');
    this.axeCollected = this.stats.hasItem('kirves');

    const map = this.make.tilemap({ key: 'hautausmaa' });

    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    const dreck = map.addTilesetImage('dreck auf dreck', 'dreckTiles');
    const swampBruhe = map.addTilesetImage('swamp-brühe animated-v5', 'swampBruheTiles');
    const city = map.addTilesetImage('City Test0', 'cityTiles');
    const swampBlubbeln = map.addTilesetImage('swamp blubbeln', 'swampBlubbelnTiles');
    const deadSwamp = map.addTilesetImage('dead-swamp-v4', 'deadSwampTiles');
    const plants = map.addTilesetImage('Plants', 'plantsTiles');
    const gyC = map.addTilesetImage('gy_c', 'gyCTiles');
    const gyD = map.addTilesetImage('gy_d', 'gyDTiles');
    const deadbush = map.addTilesetImage('deadbush', 'deadbushTiles');
    const dirtpatch = map.addTilesetImage('dirtpatch_sm', 'dirtpatchTiles');
    const ghost = map.addTilesetImage('ghost4', 'ghostTiles');
    const pumpkin = map.addTilesetImage('pumpkin_jack', 'pumpkinTiles');
    const vines = map.addTilesetImage('vines_sm1', 'vinesTiles');
    const bat = map.addTilesetImage('bat2', 'batTiles');
    const grassDirt = map.addTilesetImage('1. Grass and dirt', 'grassDirtTiles');

    const allTiles = [
      dreck, swampBruhe, city, swampBlubbeln, deadSwamp, plants,
      gyC, gyD, deadbush, dirtpatch, ghost, pumpkin, vines, bat, grassDirt,
    ];

    // Layerit (samat nimet kuin hautausmaa.json:ssa)
    const tie = map.getLayer('Tie') ? map.createLayer('Tie', allTiles, 0, 0) : null;
    const suo = map.getLayer('Suo') ? map.createLayer('Suo', allTiles, 0, 0) : null;
    const suokuplat = map.getLayer('Suokuplat') ? map.createLayer('Suokuplat', allTiles, 0, 0) : null;
    const haudat = map.getLayer('Haudat') ? map.createLayer('Haudat', allTiles, 0, 0) : null;
    const ristit = map.getLayer('Ristit') ? map.createLayer('Ristit', allTiles, 0, 0) : null;
    const kukat = map.getLayer('Kukat') ? map.createLayer('Kukat', allTiles, 0, 0) : null;
    const aita = map.getLayer('Aita') ? map.createLayer('Aita', allTiles, 0, 0) : null;
    const tolpat = map.getLayer('Tolpat') ? map.createLayer('Tolpat', allTiles, 0, 0) : null;
    const rakennusaita = map.getLayer('Rakennusaita') ? map.createLayer('Rakennusaita', allTiles, 0, 0) : null;
    const rakennukset = map.getLayer('Rakennukset') ? map.createLayer('Rakennukset', allTiles, 0, 0) : null;
    const penkit = map.getLayer('Penkit') ? map.createLayer('Penkit', allTiles, 0, 0) : null;
    const puut = map.getLayer('Puut') ? map.createLayer('Puut', allTiles, 0, 0) : null;

    // Syvyydet (maa alimpana, esteet päällä)
    if (tie) tie.setDepth(0);
    if (suo) suo.setDepth(1);
    if (suokuplat) suokuplat.setDepth(1);
    if (kukat) kukat.setDepth(1);
    if (haudat) haudat.setDepth(2);
    if (ristit) ristit.setDepth(2);
    if (penkit) penkit.setDepth(2);
    if (tolpat) tolpat.setDepth(2);
    if (aita) aita.setDepth(2);
    if (rakennusaita) rakennusaita.setDepth(2);
    if (rakennukset) rakennukset.setDepth(3);
    if (puut) puut.setDepth(3);

    // Törmäykset esteisiin
    if (suo) suo.setCollisionByExclusion([-1, 0]);
    if (haudat) haudat.setCollisionByExclusion([-1, 0]);
    if (ristit) ristit.setCollisionByExclusion([-1, 0]);
    if (aita) aita.setCollisionByExclusion([-1, 0]);
    if (tolpat) tolpat.setCollisionByExclusion([-1, 0]);
    if (rakennusaita) rakennusaita.setCollisionByExclusion([-1, 0]);
    if (rakennukset) rakennukset.setCollisionByExclusion([-1, 0]);
    if (penkit) penkit.setCollisionByExclusion([-1, 0]);
    if (puut) puut.setCollisionByExclusion([-1, 0]);

    // Viholliset törmäävät samoihin esteisiin (spawnEnemy lukee this.obstacles)
    this.obstacles = [suo, haudat, ristit, aita, tolpat, rakennusaita, rakennukset, penkit, puut];

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050805');

    // --- Pelaaja: saapuu mökistä. PLACEHOLDER-spawn (säädä koordinaatit). ---
    const startX = 4 * TILE;
    const startY = 3 * TILE;

    this.playerShadow = this.add.ellipse(startX, startY + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    this.player = this.physics.add.sprite(startX, startY, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'oikea';

    this.createAnimations();
    for (const layer of this.obstacles) {
      if (layer) this.physics.add.collider(this.player, layer);
    }

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Maila kädessä (jos vielä tallessa) ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Kirves kädessä (seuraa perässä jos poimittu mökissä) ---
    this.heldAxe = this.add.image(0, 0, 'kirves');
    this.heldAxe.setOrigin(0.15, 0.5);
    this.heldAxe.setDepth(11);
    this.heldAxe.setScale(1.2);
    this.heldAxe.setVisible(this.axeCollected);

    // --- Näppäimet ---
    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Taskulamppu / pimeys (peritty BaseScenestä) ---
    this.flashlightOn = false;
    this.darkGfx = null;
    this.glowGfx = null;
    this.heldFlashlight = null;
    this.enableFlashlightBeam();

    // --- Energiapussi (HP täyteen), otetaan E:llä. Aluekohtainen lippu. ---
    this.pouchTaken = this.isPouchTaken();
    if (!this.pouchTaken) {
      this.createPouch(24 * TILE + 16, 19 * TILE + 16);
    }

    // --- Katakombi-ovi (poistuminen, 74, 29). E:llä siirrytään. ---
    this.katakombiDoorX = 74 * TILE;
    this.katakombiDoorY = 29 * TILE;
    this.enteringKatakombi = false;
    this.katakombiHint = this.add.text(this.katakombiDoorX, this.katakombiDoorY + 24, 'Alas katakombeihin (E)', {
      fontSize: '16px',
      color: '#fff2c0',
      fontStyle: 'bold',
      backgroundColor: '#000000cc',
      padding: { x: 8, y: 4 },
      stroke: '#000000',
      strokeThickness: 3,
    })
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setScrollFactor(1)
      .setVisible(false);

    this.emitHint('Hautausmaa. Jokin liikkuu hautakivien seassa.');
    this.emitStats();

    // Tallennuspiste: hautausmaalle saavuttu
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('hautausmaa', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'hautausmaa' });
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;

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

    // --- Viholliset (4 kpl) ---
    if (!this.enemy1Spawned && this.player.x > 8 * TILE) {
      this.enemy1Spawned = true;
      this.spawnEnemy('cabinZombie', 14, 12);
    }
    if (!this.enemy2Spawned && this.player.x > 18 * TILE) {
      this.enemy2Spawned = true;
      this.spawnEnemy('tytto', 24, 18);
    }
    if (!this.enemy3Spawned && this.player.x > 29 * TILE) {
      this.enemy3Spawned = true;
      this.spawnEnemy('mies', 35, 22);
    }
    if (!this.enemy4Spawned && this.player.x > 60 * TILE) {
      this.enemy4Spawned = true;
      this.spawnEnemy('nainen', 68, 40);
    }
    if (!this.enemy5Spawned && this.player.x > 70 * TILE) {
      this.enemy5Spawned = true;
      this.spawnEnemy('mohikaani', 73, 32);
    }
    if (!this.enemy6Spawned && this.player.x > 70 * TILE) {
      this.enemy6Spawned = true;
      this.spawnEnemy('cabinZombie', 75, 32);
    }
    this.updateEnemies();

    // --- Lyönti (mailalla TAI kirveellä) ---
    {
      const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;
      const hasWeapon = this.batCollected || this.axeCollected;
      if (spaceJustPressed && hasWeapon && this.stats.canAttack()) {
        this.tryHitEnemies();
      }
    }

    // Aseet seuraavat kättä
    if (this.batCollected) {
      this.updateHeldBat();
    }
    if (this.axeCollected) {
      this.updateHeldAxe();
    }

    // --- Energiapussin poiminta (E) + kimallus/vihje ---
    {
      const eJustPressed = this.keyE.isDown && !this.eWasDown;
      if (eJustPressed) {
        this.tryCollectPouch();
        this.tryEnterKatakombi();
      }
    }
    if (!this.pouchTaken && this.pouch) {
      this.updatePouchSparkle(time);
      const dPouch = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.pouchX, this.pouchY
      );
      this.pouchHint?.setVisible(dPouch < 50);
    }

    // Katakombi-oven vihje
    if (this.katakombiHint) {
      const dDoor = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.katakombiDoorX, this.katakombiDoorY
      );
      this.katakombiHint.setVisible(dDoor < 55);
    }

    // Taskulampun valokeila + lamppu kädessä
    if (this.flashlightOn) {
      this.updateFlashlight();
      this.updateLightGlow();
      this.updateHeldFlashlight();
    }

    this.eWasDown = this.keyE.isDown;
    this.spaceWasDown = this.keySpace.isDown;
    this.emitStats();
  }

  tryEnterKatakombi() {
    if (this.enteringKatakombi) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.katakombiDoorX, this.katakombiDoorY
    );
    if (dist < 55) {
      this.enteringKatakombi = true;
      this.game.events.emit('game-event', { type: 'hautausmaa-to-katakombi' });
    }
  }
}
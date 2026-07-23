import Phaser from 'phaser';
import BaseScene from './BaseScene';
import PlayerStats from '../PlayerStats';
import { textStyles } from '../textStyles';

const TILE = 32;

export default class MetsaScene extends BaseScene {
  constructor() {
    super('MetsaScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || 'kaupunki';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('cityTiles', '/assets/tilesets/City Test0.png');
    this.load.image('grass2Tiles', '/assets/tilesets/Grass 2 layer.png');
    this.load.image('plantsTiles', '/assets/tilesets/Plants.png');
    this.load.image('deadSwampTiles', '/assets/tilesets/dead-swamp-v4.png');
    this.load.image('swampBruheTiles', '/assets/tilesets/swamp-brühe animated-v5.png');
    this.load.image('dreckTiles', '/assets/tilesets/dreck auf dreck.png');
    this.load.image('swampBlubbelnTiles', '/assets/tilesets/swamp blubbeln.png');
    this.load.image('windspielTiles', '/assets/tilesets/windspiel.png');
    this.load.image('bambusfackelTiles', '/assets/tilesets/bambusfackel.png');
    this.load.image('itemsTiles', '/assets/tilesets/Items_1_32x32.png');
    this.load.image('skullTiles', '/assets/tilesets/skull.png');
    this.load.image('maila', '/assets/spritesheets/maila.png');
    this.load.spritesheet('hahmo', '/assets/spritesheets/hahmo.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.audio('punch', '/assets/sfx/punch.mp3');
    this.load.audio('collect', '/assets/sfx/collect.mp3');
    this.load.audio('door', '/assets/sfx/door.mp3');
    this.load.audio('level', '/assets/sfx/level.mp3');
    this.load.audio('zombie', '/assets/sfx/zombie.mp3');
    this.load.audio('death', '/assets/sfx/death.mp3');
    this.loadEnemyType('nainen');
    this.loadEnemyType('cabinZombie');
    this.loadEnemyType('mohikaani');
    this.load.tilemapTiledJSON('metsa', '/assets/metsa.json');
  }

  create() {
    this.areaName = 'metsa';
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;
    // Nollataan joka create()-kutsulla (Yritä uudelleen käyttää samaa scene-
    // instanssia stop+start-kutsulla, ei luo uutta) - muuten tämä jäisi
    // true:ksi ensimmäisen kuoleman jälkeen eikä game-over voisi laueta enää.
    this.gameOverTriggered = false;

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');

    const map = this.make.tilemap({ key: 'metsa' });

    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    const cityTiles = map.addTilesetImage('City Test0', 'cityTiles');
    const grass2 = map.addTilesetImage('Grass 2 layer', 'grass2Tiles');
    const plants = map.addTilesetImage('Plants', 'plantsTiles');
    const deadSwamp = map.addTilesetImage('dead-swamp-v4', 'deadSwampTiles');
    const swampBruhe = map.addTilesetImage('swamp-brühe animated-v5', 'swampBruheTiles');
    const dreck = map.addTilesetImage('dreck auf dreck', 'dreckTiles');
    const swampBlubbeln = map.addTilesetImage('swamp blubbeln', 'swampBlubbelnTiles');
    const windspiel = map.addTilesetImage('windspiel', 'windspielTiles');
    const bambusfackel = map.addTilesetImage('bambusfackel', 'bambusfackelTiles');
    const items = map.addTilesetImage('Items_1_32x32', 'itemsTiles');
    const skull = map.addTilesetImage('skull', 'skullTiles');

    // Kaikki tilesetit yhtenä listana (layerit voivat käyttää mitä tahansa niistä)
    const allTiles = [cityTiles, grass2, plants, deadSwamp, swampBruhe, dreck, swampBlubbeln, windspiel, bambusfackel, items, skull];

    // Layerit (samat nimet kuin metsa.json:ssa)
    const tie = map.getLayer('Tie') ? map.createLayer('Tie', allTiles, 0, 0) : null;
    const suo = map.getLayer('Suo') ? map.createLayer('Suo', allTiles, 0, 0) : null;
    const kallo = map.getLayer('Kallo') ? map.createLayer('Kallo', allTiles, 0, 0) : null;
    const aita = map.getLayer('Aita') ? map.createLayer('Aita', allTiles, 0, 0) : null;
    const suokuplat = map.getLayer('Suokuplat') ? map.createLayer('Suokuplat', allTiles, 0, 0) : null;
    const seina = map.getLayer('Seinä') ? map.createLayer('Seinä', allTiles, 0, 0) : null;
    const ovi = map.getLayer('Ovi') ? map.createLayer('Ovi', allTiles, 0, 0) : null;
    const katto = map.getLayer('Katto') ? map.createLayer('Katto', allTiles, 0, 0) : null;
    const puut = map.getLayer('Puut') ? map.createLayer('Puut', allTiles, 0, 0) : null;

    // Syvyydet
    if (tie) tie.setDepth(0);
    if (suo) suo.setDepth(1);
    if (suokuplat) suokuplat.setDepth(1);
    if (kallo) kallo.setDepth(2);
    if (aita) aita.setDepth(2);
    if (seina) seina.setDepth(3);
    if (ovi) ovi.setDepth(2);
    if (puut) puut.setDepth(3);
    if (katto) katto.setDepth(5);

    // Törmäykset esteisiin (suo, aita, puut, seinä)
    if (suo) suo.setCollisionByExclusion([-1, 0]);
    if (aita) aita.setCollisionByExclusion([-1, 0]);
    if (puut) puut.setCollisionByExclusion([-1, 0]);
    if (seina) seina.setCollisionByExclusion([-1, 0]);

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050805');

    // --- Pelaaja: tulee kaupungista vasemmalta (aukko y26-32) ---
    const startX = 2 * TILE;
    const startY = 28 * TILE;

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
    if (suo) this.physics.add.collider(this.player, suo);
    if (aita) this.physics.add.collider(this.player, aita);
    if (puut) this.physics.add.collider(this.player, puut);
    if (seina) this.physics.add.collider(this.player, seina);

    // Viholliset törmäävät samoihin esteisiin kuin pelaaja
    this.obstacles = [suo, aita, puut, seina];

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Maila kädessä ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Näppäimet (kuten kaupungissa) ---
    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    // Suora keydown-kuuntelija pussin poiminnalle (E)
    this._onKeyDownE = (ev) => {
      if (ev.code !== 'KeyE' && ev.key !== 'e' && ev.key !== 'E') return;
      this.tryCollectPouch();
      this.tryEnterMokki();
    };
    window.addEventListener('keydown', this._onKeyDownE);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this._onKeyDownE);
    });

    // --- Taskulamppu / pimeys (peritty BaseScenestä) ---
    this.flashlightOn = false;
    this.darkGfx = null;
    this.glowGfx = null;
    this.heldFlashlight = null;
    this.enableFlashlightBeam();

    // --- Soihtujen valo: yksi pyöreä hehku per soihtu (ADD-blend, pimeyden päällä) ---
    this.torchLights = [
      { x: 55.5 * TILE, y: 38 * TILE },
      { x: 62.5 * TILE, y: 34 * TILE },
      { x: 63.5 * TILE, y: 38 * TILE },
      { x: 67.5 * TILE, y: 38 * TILE },
      { x: 69.5 * TILE, y: 34 * TILE },
    ];
    this.torchLightGfx = this.add.graphics();
    this.torchLightGfx.setScrollFactor(1);
    this.torchLightGfx.setDepth(9);
    this.torchLightGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.drawTorchLights();

    // --- Vihollisten liput ---
    this.enemies = [];
    this.enemy1Spawned = false;
    this.enemy2Spawned = false;

    // Paluu-este: estä heti alussa livahtaminen ulos vasemmalta ennen kuin liikkeelle lähdetään
    this.returnArmed = false;

    // --- Energiapussi (HP täyteen), otetaan E:llä. Oma lippu (metsan pussi). ---
    this.pouchTaken = this.isPouchTaken();
    if (!this.pouchTaken) {
      this.createPouch(6 * TILE + 16, 28 * TILE + 16);
    }

    // --- Mökin ovi (x=65.9, y=38.9 tile-koordinaateissa) ---
    this.mokkiDoorX = 65.9 * TILE;
    this.mokkiDoorY = 38.9 * TILE;
    this.enteringMokki = false;
    this.mokkiHint = this.add.text(this.mokkiDoorX, this.mokkiDoorY + 24, 'Mökin ovi (E)', textStyles.itemHint)
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setVisible(false);

    this.emitHint('Metsä on pimeä ja hiljainen. Jokin liikkuu puiden seassa.');
    this.emitStats();

    // Tallennuspiste: metsään saavuttu
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('metsa', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'metsa' });
  }

  // Piirtää yhden pehmeän pyöreän hehkun jokaiselle soihdulle.
  drawTorchLights() {
    const g = this.torchLightGfx;
    g.clear();
    for (const t of this.torchLights) {
      g.fillStyle(0xffb04a, 0.10);
      g.fillCircle(t.x, t.y, 70);

      g.fillStyle(0xfff2c0, 0.5);
      g.fillCircle(t.x, t.y, 10);
    }
  }

  tryEnterMokki() {
    if (this.enteringMokki) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.mokkiDoorX, this.mokkiDoorY
    );
    if (dist < 55) {
      this.enteringMokki = true;
      this.playDoorSound();
      this.game.events.emit('game-event', { type: 'metsa-to-mokki' });
    }
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

    // Kun pelaaja on liikkunut sisään (x > 3 tile), aktivoi paluu-siirtymä
    if (!this.returnArmed && this.player.x > 4 * TILE) {
      this.returnArmed = true;
    }
    // Paluu kaupunkiin: kun pelaaja kävelee takaisin vasempaan reunaan (aukon kohdalla y26-32)
    if (this.returnArmed && this.player.x < 1 * TILE && this.player.y > 24 * TILE && this.player.y < 34 * TILE) {
      this.returnArmed = false;
      this.game.events.emit('game-event', { type: 'metsa-to-city' });
      return;
    }

    // --- Viholliset (spawnaa edetessä) ---
    if (!this.enemy1Spawned && this.player.x > 20 * TILE) {
      this.enemy1Spawned = true;
      this.spawnEnemy('mohikaani', 26, 30);
    }
    if (!this.enemy2Spawned && this.player.x > 25 * TILE) {
      this.enemy2Spawned = true;
      this.spawnEnemy('nainen', 31, 45);
    }
    if (!this.enemy3Spawned && this.player.x > 30 * TILE) {
      this.enemy3Spawned = true;
      this.spawnEnemy('cabinZombie', 53, 46);
    }
    this.updateEnemies();

    // --- Lyönti ---
    {
      const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;
      if (spaceJustPressed && this.batCollected && this.stats.canAttack()) {
        this.tryHitEnemies();
      }
    }

    if (this.batCollected) {
      this.updateHeldBat();
    }

    // Pussin kimallus + vihje (sama logiikka kuin aulassa)
    if (!this.pouchTaken && this.pouch) {
      this.updatePouchSparkle(time);
      const dPouch = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.pouchX, this.pouchY
      );
      this.pouchHint?.setVisible(dPouch < 50);
    }

    // Mökin oven vihje
    if (this.mokkiHint) {
      const dMokki = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.mokkiDoorX, this.mokkiDoorY
      );
      this.mokkiHint.setVisible(dMokki < 55);
    }

    if (this.flashlightOn) {
      this.updateFlashlight();
      this.updateLightGlow();
      this.updateHeldFlashlight();
    }

    this.eWasDown = this.keyE.isDown;
    this.spaceWasDown = this.keySpace.isDown;
    this.emitStats();
  }
}
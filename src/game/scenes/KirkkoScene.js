import Phaser from 'phaser';
import BaseScene from './BaseScene';
import PlayerStats from '../PlayerStats';

const TILE = 32;

export default class KirkkoScene extends BaseScene {
  constructor() {
    super('KirkkoScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || 'katakombi';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('gothicFurnitureTiles', '/assets/tilesets/GothicFurnitureSprites48x48.png');
    this.load.image('windowsDoors2Tiles', '/assets/tilesets/windows_and_doors2.png');
    this.load.image('interiorsTiles', '/assets/tilesets/Interiors_tilesets.png');
    this.load.image('atlasTiles', '/assets/tilesets/atlas_32x.png');

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
    this.load.audio('zombie', '/assets/sfx/zombie.mp3');
    this.load.audio('death', '/assets/sfx/death.mp3');
    this.load.audio('crack', '/assets/sfx/crack.mp3');

    this.loadEnemyType('mies');
    this.loadEnemyType('nainen');
    this.loadEnemyType('tytto');
    this.loadEnemyType('mohikaani');
    this.loadEnemyType('cabinZombie');
    this.loadEnemyType('miniZombie');

    this.load.tilemapTiledJSON('kirkko', '/assets/kirkko.json');
  }

  create() {
    this.areaName = 'kirkko';
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;
    // Nollataan joka create()-kutsulla (Yritä uudelleen käyttää samaa scene-
    // instanssia stop+start-kutsulla, ei luo uutta) - muuten tämä jäisi
    // true:ksi ensimmäisen kuoleman jälkeen eikä game-over voisi laueta enää.
    this.gameOverTriggered = false;

    this.enemies = [];
    this.enemy1Spawned = false;
    this.enemy2Spawned = false;
    this.enemy3Spawned = false;
    this.enemy4Spawned = false;
    this.enemy5Spawned = false;
    this.enemy6Spawned = false;

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');
    this.axeCollected = this.stats.hasItem('kirves');

    const map = this.make.tilemap({ key: 'kirkko' });

    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    const gothicFurniture = map.addTilesetImage('GothicFurnitureSprites48x48', 'gothicFurnitureTiles');
    const windowsDoors2 = map.addTilesetImage('windows_and_doors2', 'windowsDoors2Tiles');
    const interiors = map.addTilesetImage('Interiors_tilesets', 'interiorsTiles');
    const atlas = map.addTilesetImage('atlas_32x', 'atlasTiles');
    const allTiles = [gothicFurniture, windowsDoors2, interiors, atlas];

    // Layerit (samat nimet kuin kirkko.json:ssa)
    const lattia = map.getLayer('Lattia') ? map.createLayer('Lattia', allTiles, 0, 0) : null;
    const matot = map.getLayer('Matot') ? map.createLayer('Matot', allTiles, 0, 0) : null;
    const seinat = map.getLayer('Seinät') ? map.createLayer('Seinät', allTiles, 0, 0) : null;
    const ikkunat = map.getLayer('Ikkunat') ? map.createLayer('Ikkunat', allTiles, 0, 0) : null;
    const verhot = map.getLayer('Verhot') ? map.createLayer('Verhot', allTiles, 0, 0) : null;
    const kalusteet2 = map.getLayer('Kalusteet 2') ? map.createLayer('Kalusteet 2', allTiles, 0, 0) : null;
    const ovet = map.getLayer('Ovet') ? map.createLayer('Ovet', allTiles, 0, 0) : null;
    const kalusteet = map.getLayer('Kalusteet') ? map.createLayer('Kalusteet', allTiles, 0, 0) : null;
    const valot = map.getLayer('Valot') ? map.createLayer('Valot', allTiles, 0, 0) : null;

    // Syvyydet
    if (lattia) lattia.setDepth(0);
    if (matot) matot.setDepth(1);
    if (seinat) seinat.setDepth(2);
    if (ikkunat) ikkunat.setDepth(2);
    if (verhot) verhot.setDepth(2);
    if (ovet) ovet.setDepth(2);
    if (kalusteet2) kalusteet2.setDepth(3);
    if (kalusteet) kalusteet.setDepth(3);
    if (valot) valot.setDepth(4);

    // Törmäykset esteisiin (seinät, penkit/kalusteet)
    if (seinat) seinat.setCollisionByExclusion([-1, 0]);
    if (kalusteet) kalusteet.setCollisionByExclusion([-1, 0]);
    if (kalusteet2) kalusteet2.setCollisionByExclusion([-1, 0]);

    // Viholliset törmäävät samoihin esteisiin (spawnEnemy lukee this.obstacles)
    this.obstacles = [seinat, kalusteet, kalusteet2];

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050505');

    // --- Pelaaja: saapuu katakombeista kryptan portaita pitkin (portaat 2,8) ---
    const stairsX = 2 * TILE + 16;
    const stairsY = 7 * TILE + 16;
    const startX = 3 * TILE + 16;
    const startY = 8 * TILE + 16;

    this.playerShadow = this.add.ellipse(startX, startY + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    this.player = this.physics.add.sprite(startX, startY, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'alas';

    this.createAnimations();
    for (const layer of this.obstacles) {
      if (layer) this.physics.add.collider(this.player, layer);
    }

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Kryptan portaat (saapumispiste) ---
    this.buildCryptStairs(stairsX, stairsY);

    // --- Maila kädessä (jos vielä tallessa) ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Kirves kädessä (seuraa perässä jos poimittu) ---
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

    // --- Energiapussi (HP täyteen), luodaan kerran alustuksessa ---
    this.pouchTaken = this.isPouchTaken();
    if (!this.pouchTaken) {
      this.createPouch(24 * TILE + 16, 19 * TILE + 16);
    }

    this.emitHint('Kirkko. Alttarin luona jotain liikkuu.');
    this.emitStats();

    // Tallennuspiste: kirkkoon saavuttu
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('kirkko', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'kirkko' });
  }

  // Piirtää portaat samalla tyylillä kuin BaseScenen buildStairs (Aula/Käytävä),
  // mutta omaan sijaintiinsa (2,8) kiinteän x10,y3.5:n sijaan.
  buildCryptStairs(cx, cy) {
    const g = this.add.container(cx, cy);
    g.setDepth(3);

    const w = 2.5 * TILE;
    const h = 3 * TILE;

    const base = this.add.rectangle(0, 0, w, h, 0x1a140c);
    g.add(base);

    const steps = 6;
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
      const shade = Phaser.Display.Color.GetColor(58 + i * 8, 46 + i * 6, 30 + i * 4);
      // peilattu: levenee vasemmalle (i kasvaa -> vasemmalle), sama kuin Aulassa
      const step = this.add.rectangle(w / 2 - stepW / 2 - i * stepW, 0, stepW - 1, h - i * 6, shade);
      step.setStrokeStyle(1, 0x0e0a06);
      g.add(step);
    }

    const glow = this.add.ellipse(-6, 0, w * 0.8, h * 0.7, 0x6688cc, 0.15);
    g.add(glow);
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

    // --- Viholliset (6 kpl): ilmestyvät vasta kun pelaaja tulee lähelle ---
    const spawnDist = 8 * TILE;

    if (!this.enemy1Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 19 * TILE, 10 * TILE) < spawnDist) {
      this.enemy1Spawned = true;
      this.spawnEnemy('mies', 19, 10);
    }
    if (!this.enemy2Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 21 * TILE, 13 * TILE) < spawnDist) {
      this.enemy2Spawned = true;
      this.spawnEnemy('nainen', 21, 13);
    }
    if (!this.enemy3Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 18 * TILE, 16 * TILE) < spawnDist) {
      this.enemy3Spawned = true;
      this.spawnEnemy('tytto', 18, 16);
    }
    if (!this.enemy4Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 22 * TILE, 19 * TILE) < spawnDist) {
      this.enemy4Spawned = true;
      this.spawnEnemy('mohikaani', 22, 19);
    }
    if (!this.enemy5Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 30 * TILE, 8 * TILE) < spawnDist) {
      this.enemy5Spawned = true;
      this.spawnEnemy('cabinZombie', 30, 8);
    }
    if (!this.enemy6Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 10 * TILE, 8 * TILE) < spawnDist) {
      this.enemy6Spawned = true;
      this.spawnEnemy('miniZombie', 10, 8);
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
      }
    }
    if (!this.pouchTaken && this.pouch) {
      this.updatePouchSparkle(time);
      const dPouch = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.pouchX, this.pouchY
      );
      this.pouchHint?.setVisible(dPouch < 50);
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
}
import Phaser from 'phaser';
import BaseScene from './BaseScene';
import PlayerStats from '../PlayerStats';

const TILE = 32;

export default class MokkiScene extends BaseScene {
  constructor() {
    super('MokkiScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || 'metsa';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('furnitureTiles', '/assets/tilesets/furniture_and_props.png');
    this.load.image('windowsDoorsTiles', '/assets/tilesets/windows_and_doors.png');
    this.load.image('windowsDoors2Tiles', '/assets/tilesets/windows_and_doors2.png');
    this.load.image('interiorsTiles', '/assets/tilesets/Interiors_tilesets.png');
    this.load.image('itemsTiles', '/assets/tilesets/Items_1_32x32.png');
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
    this.loadEnemyType('cabinZombie');
    this.load.tilemapTiledJSON('mokki', '/assets/mokki.json');
  }

  create() {
    this.areaName = 'mokki';
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

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');

    const map = this.make.tilemap({ key: 'mokki' });

    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    const furniture = map.addTilesetImage('furniture_and_props', 'furnitureTiles');
    const windowsDoors = map.addTilesetImage('windows_and_doors', 'windowsDoorsTiles');
    const windowsDoors2 = map.addTilesetImage('windows_and_doors2', 'windowsDoors2Tiles');
    const interiors = map.addTilesetImage('Interiors_tilesets', 'interiorsTiles');
    const items = map.addTilesetImage('Items_1_32x32', 'itemsTiles');

    const allTiles = [furniture, windowsDoors, windowsDoors2, interiors, items];

    // Layerit (samat nimet kuin mokki.json:ssa)
    const lattia = map.getLayer('Lattia') ? map.createLayer('Lattia', allTiles, 0, 0) : null;
    const matot = map.getLayer('Matot') ? map.createLayer('Matot', allTiles, 0, 0) : null;
    const seinat = map.getLayer('Seinät') ? map.createLayer('Seinät', allTiles, 0, 0) : null;
    const ikkunat = map.getLayer('Ikkunat') ? map.createLayer('Ikkunat', allTiles, 0, 0) : null;
    const ovet = map.getLayer('Ovet') ? map.createLayer('Ovet', allTiles, 0, 0) : null;
    const kalusteet = map.getLayer('Kalusteet') ? map.createLayer('Kalusteet', allTiles, 0, 0) : null;
    const valot = map.getLayer('Valot') ? map.createLayer('Valot', allTiles, 0, 0) : null;

    // Syvyydet
    if (lattia) lattia.setDepth(0);
    if (matot) matot.setDepth(1);
    if (seinat) seinat.setDepth(2);
    if (ikkunat) ikkunat.setDepth(2);
    if (ovet) ovet.setDepth(2);
    if (kalusteet) kalusteet.setDepth(3);
    if (valot) valot.setDepth(4);

    // Törmäykset esteisiin (seinät, kalusteet)
    if (seinat) seinat.setCollisionByExclusion([-1, 0]);
    if (kalusteet) kalusteet.setCollisionByExclusion([-1, 0]);

    // Viholliset törmäävät näihin (spawnEnemy lukee this.obstacles)
    this.obstacles = [seinat, kalusteet];

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050805');

    // --- Pelaaja: tulee sisään alaovesta keskeltä ---
    const startX = 20 * TILE;
    const startY = 21 * TILE; 

    this.playerShadow = this.add.ellipse(startX, startY + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    this.player = this.physics.add.sprite(startX, startY, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'ylos';

    this.createAnimations();
    if (seinat) this.physics.add.collider(this.player, seinat);
    if (kalusteet) this.physics.add.collider(this.player, kalusteet);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Maila kädessä ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Kirves lattialla + kädessä (yleinen mekaniikka BaseScenestä) ---
    // Poimintapiste vastaa Kirves-layerin sijaintia kartassa (x=7, y=11.5).
    this.createAxe(7 * TILE + 16, 11.5 * TILE);

    // --- Näppäimet (kuten metsässä) ---
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

    // --- Kaminan valo: yksi pyöreä hehku vasemmalla (ADD-blend, pimeyden päällä) ---
    // Karkea sijainti, siirrellään myöhemmin Tiledin/pelin mukaan.
    this.hearthLight = { x: 4 * TILE, y: 16 * TILE };
    this.hearthLightGfx = this.add.graphics();
    this.hearthLightGfx.setScrollFactor(1);
    this.hearthLightGfx.setDepth(9);
    this.hearthLightGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.drawHearthLight();

    this.enemies = [];
    this.enemy1Spawned = false;
    this.enemy2Spawned = false;

    // --- Hautausmaa-ovi (poistuminen, x=20 y=2.9). E:llä siirrytään. ---
    this.hautausmaaDoorX = 20 * TILE;
    this.hautausmaaDoorY = 2.9 * TILE;
    this.enteringHautausmaa = false;
    this.hautausmaaHint = this.add.text(this.hautausmaaDoorX, this.hautausmaaDoorY + 24, 'Ulos hautausmaalle (E)', {
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

    this.emitHint('Mökki on hiljainen. Ainakin täällä on turvallista.');
    this.emitStats();

    // Tallennuspiste: mökkiin saavuttu
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('mokki', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'mokki' });
  }
  

  // Piirtää yhden pehmeän pyöreän hehkun kaminalle.
  drawHearthLight() {
    const g = this.hearthLightGfx;
    g.clear();
    const t = this.hearthLight;
    g.fillStyle(0xffb04a, 0.10);
    g.fillCircle(t.x, t.y, 70);
  }

  tryEnterHautausmaa() {
    if (this.enteringHautausmaa) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.hautausmaaDoorX, this.hautausmaaDoorY
    );
    if (dist < 55) {
      this.enteringHautausmaa = true;
      this.playDoorSound();
      this.game.events.emit('game-event', { type: 'mokki-to-hautausmaa' });
    }
  }

  update(time, delta) {
    this.logPlayerPos(time);// DEBUG: pelaajan sijainti konsoliin. POISTA kun ruutu valmis.
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

    // --- Viholliset ---
    if (!this.enemy1Spawned && this.player.x > 25 * TILE) {
      this.enemy1Spawned = true;
      this.spawnEnemy('cabinZombie', 25, 10);
    }
    if (!this.enemy2Spawned && this.player.x < 17 * TILE && this.player.y < 7 * TILE) {
      this.enemy2Spawned = true;
      this.spawnEnemy('cabinZombie', 18, 4);
    }
    this.updateEnemies();

    // Maila hajoaa kun ensimmäinen zombie on kaatunut -> paljain käsin,
    // kunnes kirves löytyy.
    if (this.batCollected && !this.batBroken) {
      const anyKilled = this.enemies.some((e) => !e.alive);
      if (anyKilled) {
        this.batBroken = true;
        this.breakBat();
        this.game.events.emit('game-event', {
          type: 'request-save',
          save: this.stats.getSaveData('mokki', {
            ...(this.initialSave?.progress || {}),
          }),
        });
      }
    }

    // --- Kirven poiminta (E) + hautausmaa-oven tarkistus (E) ---
    {
      const eJustPressed = this.keyE.isDown && !this.eWasDown;
      if (eJustPressed) {
        this.tryCollectAxe();
        this.tryEnterHautausmaa();
      }
    }

    // --- Lyönti (mailalla TAI kirveellä) ---
    {
      const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;
      const hasWeapon = this.batCollected || this.axeCollected;
      if (spaceJustPressed && hasWeapon && this.stats.canAttack()) {
        this.tryHitEnemies();
      }
    }

    if (this.batCollected) {
      this.updateHeldBat();
    }
    if (this.axeCollected) {
      this.updateHeldAxe();
    }
    if (this.axeSparkle && !this.axeTaken) {
      this.updateAxeSparkle(time);
      const dAxe = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.axeX, this.axeY
      );
      this.axeHint?.setVisible(dAxe < 50);
    }

    // Hautausmaa-oven vihje
    if (this.hautausmaaHint) {
      const dDoor = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.hautausmaaDoorX, this.hautausmaaDoorY
      );
      this.hautausmaaHint.setVisible(dDoor < 55);
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
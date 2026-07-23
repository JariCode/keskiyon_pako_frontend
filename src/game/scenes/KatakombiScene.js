import Phaser from 'phaser';
import BaseScene from './BaseScene';
import PlayerStats from '../PlayerStats';

const TILE = 32;

export default class KatakombiScene extends BaseScene {
  constructor() {
    super('KatakombiScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || 'hautausmaa';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('freeDTiles', '/assets/tilesets/free D.png');
    this.load.image('itemsTiles', '/assets/tilesets/Items_1_32x32.png');
    this.load.image('gyCTiles', '/assets/tilesets/gy_c.png');

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

    this.loadEnemyType('tytto');
    this.loadEnemyType('nainen');
    this.loadEnemyType('mies');
    this.loadEnemyType('cabinZombie');
    this.loadEnemyType('mohikaani');
    this.loadEnemyType('miniZombie');
    this.load.tilemapTiledJSON('katakombit', '/assets/katakombit.json');
  }

  create() {
    this.areaName = 'katakombi';
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
    this.enemy7Spawned = false;
    this.enemy8Spawned = false;

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');
    this.axeCollected = this.stats.hasItem('kirves');

    const map = this.make.tilemap({ key: 'katakombit' });

    // Tilesetit (Tiled-nimi -> Phaser-kuva-avain)
    const freeD = map.addTilesetImage('free D', 'freeDTiles');
    const items = map.addTilesetImage('Items_1_32x32', 'itemsTiles');
    const gyC = map.addTilesetImage('gy_c', 'gyCTiles');
    const allTiles = [freeD, items, gyC];

    // Layerit (samat nimet kuin katakombit.json:ssa)
    const lattia = map.getLayer('Lattia') ? map.createLayer('Lattia', allTiles, 0, 0) : null;
    const seinat = map.getLayer('Seinät') ? map.createLayer('Seinät', allTiles, 0, 0) : null;
    const seinat2 = map.getLayer('Seinät2') ? map.createLayer('Seinät2', allTiles, 0, 0) : null;
    const ovet = map.getLayer('Ovet') ? map.createLayer('Ovet', allTiles, 0, 0) : null;
    const kalusteet = map.getLayer('Kalusteet') ? map.createLayer('Kalusteet', allTiles, 0, 0) : null;
    const haudat = map.getLayer('Haudat') ? map.createLayer('Haudat', allTiles, 0, 0) : null;
    const valot = map.getLayer('Valot') ? map.createLayer('Valot', allTiles, 0, 0) : null;

    // Syvyydet
    if (lattia) lattia.setDepth(0);
    if (seinat) seinat.setDepth(2);
    if (seinat2) seinat2.setDepth(2);
    if (ovet) ovet.setDepth(2);
    if (kalusteet) kalusteet.setDepth(3);
    if (haudat) haudat.setDepth(3);
    if (valot) valot.setDepth(4);

    // Törmäykset esteisiin
    if (seinat) seinat.setCollisionByExclusion([-1, 0]);
    if (seinat2) seinat2.setCollisionByExclusion([-1, 0]);
    if (kalusteet) kalusteet.setCollisionByExclusion([-1, 0]);
    if (haudat) haudat.setCollisionByExclusion([-1, 0]);

    // Viholliset törmäävät näihin (spawnEnemy lukee this.obstacles)
    this.obstacles = [seinat, seinat2, kalusteet, haudat];

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050505');

    // --- Pelaaja: saapuu katakombeihin (tulopiste 8.5, 57) ---
    const startX = 8.5 * TILE;
    const startY = 57 * TILE;

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

    // --- Soihtujen valo: yksi pyöreä hehku per valonlähde (ADD-blend,
    // pimeyden päällä). Pisteet poimittu kartan Valot-tiilien klustereista. ---
    this.torchLights = [
      { x: 25.0 * TILE + 16, y: 8.0 * TILE + 16 },
      { x: 83.5 * TILE + 16, y: 10.0 * TILE + 16 },
      { x: 88.0 * TILE + 16, y: 26.0 * TILE + 16 },
      { x: 12.5 * TILE + 16, y: 29.0 * TILE + 16 },
      { x: 19.5 * TILE + 16, y: 29.0 * TILE + 16 },
      { x: 21.5 * TILE + 16, y: 46.0 * TILE + 16 },
      { x: 60.5 * TILE + 16, y: 55.0 * TILE + 16 },
    ];
    this.torchLightGfx = this.add.graphics();
    this.torchLightGfx.setScrollFactor(1);
    this.torchLightGfx.setDepth(9);
    this.torchLightGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.drawTorchLights();

    // --- Energiapussit (3 kpl) ---
    this.pouches = [];
    const pouchPositions = [
      { id: 1, x: 25 * TILE + 16, y: 33 * TILE + 16 },
      { id: 2, x: 47 * TILE + 16, y: 47 * TILE + 16 },
      { id: 3, x: 73 * TILE + 16, y: 28 * TILE + 16 }
    ];

    pouchPositions.forEach((pos) => {
      // Tarkistetaan tallennuksesta onko tämä kyseinen pussi jo otettu
      const takenKey = `pouchTaken_katakombi_${pos.id}`;
      const isTaken = !!(this.initialSave?.progress?.[takenKey]);

      if (!isTaken) {
        // Luodaan pussin grafiikat BaseScenen luontitavalla
        this.createPouch(pos.x, pos.y);
        
        // Otetaan pussi ja sen vihjeteksti talteen omiin taulukkomuuttujiin
        this.pouches.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          sprite: this.pouch,
          sparkle: this.pouchSparkle,
          hint: this.pouchHint
        });

        // Tyhjennetään BaseScenen yksittäiset viitteet, jotta seuraava pussi voi luoda uudet
        this.pouch = null;
        this.pouchSparkle = null;
        this.pouchHint = null;
      }
    });

    this.emitHint('Katakombit. Ilma on kylmää ja kosteaa.');
    this.emitStats();

    // Tallennuspiste: katakombeihin saavuttu
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('katakombi', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'katakombi' });
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

   // --- Viholliset (8 kpl): ilmestyvät vasta kun pelaaja tulee lähelle (säde < 8 ruutua) ---
    const spawnDist = 8 * TILE;
  
  //Luodaan viholliset, kun pelaaja tulee lähelle tiettyjä koordinaatteja. Spawnataan vain kerran per vihollinen.
    if (!this.enemy1Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 17 * TILE, 46 * TILE) < spawnDist) {
      this.enemy1Spawned = true;
      this.spawnEnemy('miniZombie', 17, 46);
    }
    if (!this.enemy2Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 38 * TILE, 57 * TILE) < spawnDist) {
      this.enemy2Spawned = true;
      this.spawnEnemy('mohikaani', 38, 57);
    }
    if (!this.enemy3Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 21 * TILE, 25 * TILE) < spawnDist) {
      this.enemy3Spawned = true;
      this.spawnEnemy('tytto', 21, 25);
    }
    if (!this.enemy4Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 33 * TILE, 17 * TILE) < spawnDist) {
      this.enemy4Spawned = true;
      this.spawnEnemy('mies', 33, 17);
    }
    if (!this.enemy5Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 61 * TILE, 51 * TILE) < spawnDist) {
      this.enemy5Spawned = true;
      this.spawnEnemy('nainen', 61, 51);
    }
    if (!this.enemy6Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 75 * TILE, 28 * TILE) < spawnDist) {
      this.enemy6Spawned = true;
      this.spawnEnemy('cabinZombie', 75, 28);
    }
    if (!this.enemy7Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 67 * TILE, 10 * TILE) < spawnDist) {
      this.enemy7Spawned = true;
      this.spawnEnemy('mohikaani', 67, 10);
    }
    if (!this.enemy8Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 85 * TILE, 13 * TILE) < spawnDist) {
      this.enemy8Spawned = true;
      this.spawnEnemy('cabinZombie', 85, 13);
    }
    if (!this.enemy9Spawned && Phaser.Math.Distance.Between(this.player.x, this.player.y, 80 * TILE, 6 * TILE) < spawnDist) {
      this.enemy9Spawned = true;
      this.spawnEnemy('miniZombie', 80, 6);
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

    // --- Energiapussien poiminta ja kimalluksen päivitys ---
    {
      const eJustPressed = this.keyE.isDown && !this.eWasDown;

      if (this.pouches && this.pouches.length > 0) {
        for (let i = this.pouches.length - 1; i >= 0; i--) {
          const p = this.pouches[i];
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);

          // Päivitetään tekstin näkyvyys etäisyyden mukaan
          if (p.hint) {
            p.hint.setVisible(dist < 50);
          }

          // Päivitetään kimallusefekti
          if (p.sparkle) {
            const near = Phaser.Math.Clamp(1 - dist / 400, 0.25, 1);
            const pulse = 0.5 + 0.5 * Math.sin(time / 180);
            const cx = p.x;
            const cy = p.y - 14;
            const r = 10 + 10 * near * pulse;
            const w = 3 + 2 * near * pulse;

            p.sparkle.clear();
            p.sparkle.fillStyle(0xfff2c0, 0.12 + 0.28 * near * pulse);
            p.sparkle.fillCircle(cx, cy, r * 1.1);
            p.sparkle.fillStyle(0xfff2c0, 0.18 + 0.32 * near * pulse);
            p.sparkle.fillCircle(cx, cy, r * 0.6);

            const a = 0.6 + 0.4 * near * pulse;
            p.sparkle.fillStyle(0xffffff, a);
            p.sparkle.fillTriangle(cx, cy - r, cx - w, cy, cx + w, cy);
            p.sparkle.fillTriangle(cx, cy + r, cx - w, cy, cx + w, cy);
            p.sparkle.fillTriangle(cx - r, cy, cx, cy - w, cx, cy + w);
            p.sparkle.fillTriangle(cx + r, cy, cx, cy - w, cx, cy + w);
            p.sparkle.fillStyle(0xffffff, Math.min(1, a + 0.2));
            p.sparkle.fillCircle(cx, cy, w * 0.9);
          }

          // Kerääminen E-näppäimellä
          if (eJustPressed && dist < 50) {
            if (p.sprite) p.sprite.destroy();
            if (p.sparkle) p.sparkle.destroy();
            if (p.hint) p.hint.destroy();

            this.pouches.splice(i, 1);

            this.stats.heal(this.stats.maxHP);
            this.playCollectSound();
            this.emitHint('Löysit lääkintätarvikkeita! Terveys palautui täyteen.', 'success');
            this.emitStats();

            // Tallennetaan tieto nimenomaan tämän yksittäisen pussin poimimisesta
            this.game.events.emit('game-event', {
              type: 'request-save',
              save: this.stats.getSaveData('katakombi', {
                ...(this.initialSave?.progress || {}),
                [`pouchTaken_katakombi_${p.id}`]: true,
              }),
            });
            break;
          }
        }
      }
    }

    // Aseet seuraavat kättä
    if (this.batCollected) {
      this.updateHeldBat();
    }
    if (this.axeCollected) {
      this.updateHeldAxe();
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

  // Piirtää yhden pehmeän pyöreän hehkun jokaiselle soihdulle (sama kuin metsässä).
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
}
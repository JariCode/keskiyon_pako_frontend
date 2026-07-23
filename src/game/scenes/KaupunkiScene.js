import Phaser from 'phaser';
import PlayerStats from '../PlayerStats';
import { textStyles } from '../textStyles';
import BaseScene from './BaseScene';

const TILE = 32;

export default class KaupunkiScene extends BaseScene {
  constructor() {
    super('KaupunkiScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnFrom = data?.spawn || null;
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('cityTiles', '/assets/tilesets/City Test0.png');
    this.load.image('tankTiles', '/assets/tilesets/Sheet_Tank_Big_Color.png');
    this.load.image('miesMaassa', '/assets/tilesets/miesmaassa.png');
    this.load.image('nainenMaassa', '/assets/tilesets/nainenmaassa.png');
    this.load.image('blood', '/assets/tilesets/Blood.png');
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
    this.load.spritesheet('troll', '/assets/spritesheets/Corvinian_Troll-Sheet.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.loadEnemyType('mies');
    this.loadEnemyType('nainen');
    this.loadEnemyType('cabinZombie');
    this.load.tilemapTiledJSON('kaupunki', '/assets/kaupunki.json');
  }

  create() {
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

    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Kartta ---
    const map = this.make.tilemap({ key: 'kaupunki' });
    const tiles = map.addTilesetImage('City Test0', 'cityTiles');
    const tankTiles = map.addTilesetImage('Sheet_Tank_Big_Color', 'tankTiles');
    
    // Tuodaan Tiled-tilesettien nimet ('miesmaassa', 'nainenmaassa', 'Blood') Phaserin kuva-avaimiin
    const miesTiles = map.addTilesetImage('miesmaassa', 'miesMaassa');
    const nainenTiles = map.addTilesetImage('nainenmaassa', 'nainenMaassa');
    const bloodTiles = map.addTilesetImage('Blood', 'blood');

    const tieLayer = map.createLayer('Tie', tiles, 0, 0);
    const veri = map.getLayer('Veri') ? map.createLayer('Veri', [tiles, bloodTiles], 0, 0) : null;
    const tiesulut = map.getLayer('Tiesulut') ? map.createLayer('Tiesulut', tiles, 0, 0) : null;
    const autot = map.getLayer('Autot') ? map.createLayer('Autot', tiles, 0, 0) : null;
    const aita = map.getLayer('Aita') ? map.createLayer('Aita', tiles, 0, 0) : null;
    const puut = map.getLayer('Puut') ? map.createLayer('Puut', tiles, 0, 0) : null;
    const rakennukset = map.getLayer('Rakennukset') ? map.createLayer('Rakennukset', tiles, 0, 0) : null;
    const tankit = map.getLayer('Tankit') ? map.createLayer('Tankit', [tiles, tankTiles], 0, 0) : null;
    
    // Luodaan Ruumiit-tilelayer kaikilla sen käyttämillä tileseteillä
    const ruumiit = map.getLayer('Ruumiit') ? map.createLayer('Ruumiit', [tiles, miesTiles, nainenTiles], 0, 0) : null;

    tieLayer.setDepth(0);
    if (veri) veri.setDepth(1);
    if (tiesulut) tiesulut.setDepth(1);
    if (autot) autot.setDepth(2);
    if (aita) aita.setDepth(2);
    if (puut) puut.setDepth(3);
    if (rakennukset) rakennukset.setDepth(3);
    if (tankit) tankit.setDepth(2);
    if (ruumiit) ruumiit.setDepth(4);

    // Törmäykset esteisiin
    if (tiesulut) tiesulut.setCollisionByExclusion([-1, 0]);
    if (autot) autot.setCollisionByExclusion([-1, 0]);
    if (aita) aita.setCollisionByExclusion([-1, 0]);
    if (rakennukset) rakennukset.setCollisionByExclusion([-1, 0]);
    if (puut) puut.setCollisionByExclusion([-1, 0]);
    if (tankit) tankit.setCollisionByExclusion([-1, 0]);

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#050508');

    // --- Pelaaja: aloitus vasemmalta, lähes alareunasta ---
    let startX = 2 * TILE;
    let startY = 57 * TILE;
    if (this.spawnFrom === 'metsa') {
      // Palataan metsästä: metsäpolun suulle oikeaan yläkulmaan
      startX = 98 * TILE;
      startY = 22 * TILE;
    }

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
    if (tiesulut) this.physics.add.collider(this.player, tiesulut);
    if (aita) this.physics.add.collider(this.player, aita);
    if (rakennukset) this.physics.add.collider(this.player, rakennukset);
    if (puut) this.physics.add.collider(this.player, puut);
    if (autot) this.physics.add.collider(this.player, autot);
    if (tankit) this.physics.add.collider(this.player, tankit);

    // Viholliset törmäävät TÄSMÄLLEEN samoihin esteisiin kuin pelaaja
    this.obstacles = [tiesulut, autot, aita, puut, rakennukset, tankit];

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Maila kädessä ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Autonvalot: hehkuvat keilat pimeyden päällä (depth 7) ---
    // Kiinteät valonlähteet kartalla (autojen kohdilla).
    // Autot: etupää oikealla -> valokeila lähtee auton oikeasta reunasta suuntaan oikea (angle 0)
    this.carLights = [
      { x: 16 * TILE, y: 44 * TILE, len: 300 },
      { x: 34 * TILE, y: 46 * TILE, len: 300 },
      { x: 79 * TILE, y: 46 * TILE, len: 280 },
      { x: 26 * TILE, y: 52 * TILE, len: 260 },
      { x: 21 * TILE, y: 58 * TILE, len: 280 },
      { x: 58 * TILE, y: 59 * TILE, len: 300 },
    ];
    this.carLightGfx = this.add.graphics();
    this.carLightGfx.setScrollFactor(1);
    this.carLightGfx.setDepth(9);
    this.carLightGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.drawCarLights();

    // Tankit -> valot oikealta VASEMMALLE (kirkkaammat)
    this.tankLights = [
      { x: 93 * TILE, y: 42 * TILE, len: 360 },
      { x: 94 * TILE, y: 50 * TILE, len: 360 },
      { x: 93 * TILE, y: 57 * TILE, len: 360 },
    ];
    this.tankLightGfx = this.add.graphics();
    this.tankLightGfx.setScrollFactor(1);
    this.tankLightGfx.setDepth(9);
    this.tankLightGfx.setBlendMode(Phaser.BlendModes.ADD);
    this.drawTankLights();

    // Taskulamppu-valokeila (hahmolla mukana kaupungissa)
    this.flashlightOn = false;
    this.darkGfx = null;
    this.glowGfx = null;
    this.heldFlashlight = null;
    this.enableFlashlightBeam();

    this.emitHint('Kaupunki on pimeä. Vain autojen valot loistavat.');
    this.emitStats();

    // Tallennuspiste: kaupunkiin saavuttu (päivitys/kuolema alkaa täältä)
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('kaupunki', {
        ...(this.initialSave?.progress || {}),
      }),
    });
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'kaupunki' });

    // Ensimmäinen troll: ilmestyy pian kun lähdetään liikkeelle (ekan auton jälkeen)
    this.troll = null;
    this.trollAlive = false;
    const fromForest = this.spawnFrom === 'metsa';
    this.trollSpawned = fromForest;
    this.enemies = [];
    this.miesSpawned = fromForest;
    this.naisenSpawned = fromForest;
    this.cabinZombieSpawned = fromForest;
    // Metsästä palatessa cutscene on jo nähty -> ei toistu
    this.roadblockSeen = fromForest;
    // Metsästä tullessa: pitää ensin astua pois polun suulta ennen kuin voi palata metsään
    this.forestArmed = !fromForest;

    this.eWasDown = true;
    this.spaceWasDown = true;
  }

  drawCarLights() {
    const g = this.carLightGfx;
    g.clear();
    const spread = 0.32;

    for (const c of this.carLights) {
      const originX = c.x + 20; // Auton etupää
      const originY = c.y;

      // Lamppujen korkeuserot (sama kuin valopisteillä: y - 12 ja y + 12)
      const lampOffsetY = 14;

      // Keilan piirto (trapetsi, joka alkaa lamppujen kohdalta)
      g.fillStyle(0xffe8a0, 0.07);
      g.beginPath();

      // Aloitetaan ylemmästä lampusta auton keulalta
      g.moveTo(originX, originY - lampOffsetY);

      // Piirretään kaari keilan päähän
      const steps = 18;
      for (let s = 0; s <= steps; s++) {
        const t = -spread + (2 * spread) * (s / steps);
        g.lineTo(
          originX + Math.cos(t) * c.len,
          originY + Math.sin(t) * c.len
        );
      }

      // Yhdistetään alemman lampun kohdalle auton keulalle
      g.lineTo(originX, originY + lampOffsetY);
      g.closePath();
      g.fillPath();

      // Kirkkaat ajovalot (kaksi pistettä etupäässä)
      g.fillStyle(0xfff6d8, 0.95);
      g.fillCircle(originX, originY - lampOffsetY, 5);
      g.fillCircle(originX, originY + lampOffsetY, 5);

      // Pieni hehku valojen ympärille
      g.fillStyle(0xfff2c0, 0.12);
      g.fillCircle(originX, originY, 28);
    }
  }

  drawTankLights() {
    const g = this.tankLightGfx;
    g.clear();
    const spread = 0.32;

    for (const c of this.tankLights) {
      const originX = c.x - 20; // Tankin keula vasemmalla
      const originY = c.y;
      const lampOffsetY = 14;

      // Keila vasemmalle
      g.fillStyle(0xffe8a0, 0.14);
      g.beginPath();
      g.moveTo(originX, originY - lampOffsetY);
      const steps = 18;
      for (let s = 0; s <= steps; s++) {
        const t = Math.PI - spread + (2 * spread) * (s / steps);
        g.lineTo(originX + Math.cos(t) * c.len, originY + Math.sin(t) * c.len);
      }
      g.lineTo(originX, originY + lampOffsetY);
      g.closePath();
      g.fillPath();

      // Kirkas ydinkeila
      g.fillStyle(0xfff6d8, 0.14);
      g.beginPath();
      g.moveTo(originX, originY - lampOffsetY);
      const inner = spread * 0.55;
      for (let s = 0; s <= steps; s++) {
        const t = Math.PI - inner + (2 * inner) * (s / steps);
        g.lineTo(originX + Math.cos(t) * c.len * 0.95, originY + Math.sin(t) * c.len * 0.95);
      }
      g.lineTo(originX, originY + lampOffsetY);
      g.closePath();
      g.fillPath();

      // Kirkkaat ajovalot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(originX, originY - lampOffsetY, 5);
      g.fillCircle(originX, originY + lampOffsetY, 5);

      // Hehku
      g.fillStyle(0xfff2c0, 0.3);
      g.fillCircle(originX, originY, 30);
    }
  }

  createTrollAnimations() {
    if (this.anims.exists('troll-kavele')) return;
    this.anims.create({
      key: 'troll-kavele',
      frames: this.anims.generateFrameNumbers('troll', { start: 0, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'troll-hyokkaa',
      frames: this.anims.generateFrameNumbers('troll', { start: 8, end: 15 }),
      frameRate: 14,
      repeat: -1,
    });
  }

  spawnTroll(tileX, tileY) {
    this.createTrollAnimations();
    this.playZombieSound();
    const x = tileX * TILE;
    const y = tileY * TILE;

    this.trollShadow = this.add.ellipse(x, y + 44, 70, 22, 0x000000, 0.4);
    this.trollShadow.setDepth(6);

    this.troll = this.physics.add.sprite(x, y, 'troll', 0);
    this.troll.setDepth(7);
    this.troll.setScale(2); // Zombien koko
    this.troll.body.setSize(28, 30);
    this.troll.body.setOffset(18, -70);
    this.troll.anims.play('troll-kavele', true);

    // Troll törmää samoihin esteisiin kuin pelaaja
    if (this.obstacles) {
      for (const layer of this.obstacles) {
        if (layer) this.physics.add.collider(this.troll, layer);
      }
    }

    this.trollHP = 60;
    this.trollAlive = true;

    this.trollHPText = this.add.text(x - 20, y - 60, `HP: ${this.trollHP}`, textStyles.danger)
      .setDepth(12);

    this.emitHint('Jokin valtava lähestyy! Hakkaa se mailalla (SPACE).', 'danger');
  }

  updateTroll() {
    if (!this.troll || !this.trollAlive) return;
    const dx = this.player.x - this.troll.x;
    const dy = this.player.y - this.troll.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      const speed = 55;
      this.troll.body.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }
    this.troll.setFlipX(dx < 0);
    if (dist < 45) {
      this.troll.anims.play('troll-hyokkaa', true);
    } else {
      this.troll.anims.play('troll-kavele', true);
    }
    this.trollShadow.setPosition(this.troll.x, this.troll.y + 44);
    this.trollHPText.setPosition(this.troll.x - 20, this.troll.y - 60);
    if (dist < 32) {
      this.stats.takeDamage(0.3);
      if (this.stats.isDead()) {
        this.handleGameOver();
      }
    }
  }

  tryHitTroll() {
    if (!this.troll || !this.trollAlive) return;
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.troll.x, this.troll.y);
    this.doPlayerAttackMotion(this.troll);
    if (dist < 65) {
      this.stats.useAttackEnergy(this.time.now);
      const damage = Phaser.Math.Between(7, 14);
      this.trollHP -= damage;
      this.trollHPText.setText(`HP: ${Math.max(0, this.trollHP)}`);
      const dx = this.troll.x - this.player.x;
      const dy = this.troll.y - this.player.y;
      const d2 = Math.sqrt(dx * dx + dy * dy) || 1;
      this.troll.body.setVelocity((dx / d2) * 200, (dy / d2) * 200);
      this.troll.setTintFill(0xffffff);
      this.time.delayedCall(60, () => this.troll?.clearTint());
      if (this.trollHP <= 0) {
        this.killTroll();
      }
    }
  }

  killTroll() {
    if (!this.trollAlive) return;
    this.trollAlive = false;
    const deathX = this.troll.x;
    const deathY = this.troll.y + 20;
    this.troll.body.setVelocity(0, 0);
    this.trollHPText.destroy();
    this.playDeathSound();

    // Ei kaatumis-framea -> häivytetään + verilammikko
    this.time.delayedCall(300, () => this.spawnBloodPool(deathX, deathY));
    this.tweens.add({
      targets: [this.troll, this.trollShadow],
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.troll?.destroy();
        this.trollShadow?.destroy();
        this.troll = null;
      },
    });

    const leveledUp = this.stats.registerKill();
    if (leveledUp) {
      this.playLevelSound();
    }
    this.emitHint('Hirviö kaatui. Jatka matkaa.', 'success');
    this.emitStats();
  }

  spawnBloodPool(x, y) {
    const pool = this.add.graphics();
    pool.setDepth(5);
    pool.fillStyle(0x6a0000, 0.85);
    pool.fillEllipse(x, y, 52, 24);
    pool.fillStyle(0x3a0000, 0.9);
    pool.fillEllipse(x - 4, y + 2, 30, 14);
    for (let i = 0; i < 7; i++) {
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const d = Phaser.Math.Between(18, 36);
      const sz = Phaser.Math.Between(3, 8);
      pool.fillStyle(0x5a0000, 0.7);
      pool.fillEllipse(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.45, sz, sz * 0.5);
    }
    pool.setAlpha(0);
    this.tweens.add({ targets: pool, alpha: 1, duration: 900, ease: 'Quad.easeOut' });
  }

  handleGameOver() {
    if (this.gameOverTriggered) return;
    this.gameOverTriggered = true;
    this.game.events.emit('game-event', { type: 'game-over', stats: this.stats.getSnapshot() });
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

    // Ensimmäinen troll ilmestyy kun pelaaja on edennyt ekan auton ohi (x > 10)
    if (!this.trollSpawned && this.player.x > 12 * TILE) {
      this.trollSpawned = true;
      this.spawnTroll(20, 52);
    }
    if (this.troll && this.trollAlive) {
      this.updateTroll();
      const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;
      if (spaceJustPressed && this.batCollected && this.stats.canAttack()) {
        this.tryHitTroll();
      }
    }

    // Toinen vihollinen: mies-zombie 2. ja 3. auton välissä (x > 30)
    if (!this.miesSpawned && this.player.x > 30 * TILE) {
      this.miesSpawned = true;
      this.spawnEnemy('mies', 35, 44);
    }
    if (!this.naisenSpawned && this.player.x > 65 * TILE) {
      this.naisenSpawned = true;
      this.spawnEnemy('nainen', 70, 58);
    }
   
    // Spawnaa cabinZombie kun pelaaja kulkee aita-aukosta ylös
    if (!this.cabinZombieSpawned && this.player.x > 75 * TILE && this.player.y < 35 * TILE) {
      this.cabinZombieSpawned = true;
      // CabinZombie ilmestyy enemmän vasemmalta ja alempaa
      this.spawnEnemy('cabinZombie', 65, 30);
    }
    // Tiesulku-cutscene: laukeaa kun hahmo saavuttaa viimeisen auton oikealla
      // Tiesulku-cutscene: laukeaa kun hahmo ylittää 
  if (!this.roadblockSeen && this.player.x > 75 * TILE) {
    this.roadblockSeen = true;
    this.game.events.emit('game-event', { type: 'city-to-roadblock' });
  }
    // Metsäpolku: kun pelaaja saavuttaa oikean yläreunan kävelytien.
    // forestArmed estää välittömän laukeamisen, jos juuri palattiin metsästä tähän kohtaan.
    if (!this.forestArmed && (this.player.x < 96 * TILE || this.player.y > 24 * TILE || this.player.y < 21 * TILE)) {
      this.forestArmed = true;
    }
    if (this.forestArmed && this.player.x > 98 * TILE && this.player.y > 21 * TILE && this.player.y < 24 * TILE) {
      this.forestArmed = false;
      // Tallenna nykyiset statsit (HP, taso, tapetut) ennen menoa metsään
      this.game.events.emit('game-event', {
        type: 'request-save',
        save: this.stats.getSaveData('metsa', {
          ...(this.initialSave?.progress || {}),
        }),
      });
      this.game.events.emit('game-event', { type: 'city-to-forest' });
    }

    this.updateEnemies();

    {
      const spaceJustPressed2 = this.keySpace.isDown && !this.spaceWasDown;
      if (spaceJustPressed2 && this.batCollected && this.stats.canAttack()) {
        this.tryHitEnemies();
      }
    }

    if (this.batCollected) {
      this.updateHeldBat();
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
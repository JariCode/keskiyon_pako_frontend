import Phaser from 'phaser';
import PlayerStats from '../PlayerStats';
import { textStyles } from '../textStyles';

const TILE = 32;

export default class KaytavaScene extends Phaser.Scene {
  constructor() {
    super('KaytavaScene');
  }

  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnPoint = data?.spawn || 'asunto';
  }

  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('wall1', '/assets/tilesets/Wall_1_32x32.png');
    this.load.image('floor1', '/assets/tilesets/Floor_1_32x32.png');
    this.load.image('items1', '/assets/tilesets/Items_1_32x32.png');
    this.load.image('others1', '/assets/tilesets/Others_1_32x32.png');
    this.load.image('borders1', '/assets/tilesets/Borders_32x32.png');
    this.load.image('maila', '/assets/spritesheets/maila.png');
    this.load.spritesheet('hahmo', '/assets/spritesheets/hahmo.png', { frameWidth: 32, frameHeight: 32 });
    this.load.audio('punch', '/assets/sfx/punch.mp3');
    this.load.spritesheet('zw-idle', '/assets/spritesheets/zombie-woman-idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('zw-walk', '/assets/spritesheets/zombie-woman-walk.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('zw-attack', '/assets/spritesheets/zombie-woman-attack.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('zw-hurt', '/assets/spritesheets/zombie-woman-hurt.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('zw-dead', '/assets/spritesheets/zombie-woman-dead.png', { frameWidth: 32, frameHeight: 32 });
    this.load.tilemapTiledJSON('kaytava', '/assets/kaytava.json');
  }

  create() {
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;
    this.stairsReached = false;
    this.canReachStairs = false;
    this.canReturnApt = false;
    this.returningApt = false;
    this.flashlightTaken = false;
    this.darknessActive = false;
    this.inputLocked = false;
    this.flashlightOn = false;
    this.heldFlashlight = null;

    this.zombie = null;
    this.zombieShadow = null;
    this.zombieAlive = false;
    this.zombieHP = 0;
    this.zombieDefeated = false;

    this.stats = new PlayerStats();
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }
    this.batCollected = this.stats.hasItem('maila');

    // Tallennuksesta: pimeys, tapettu zombie, taskulamppu
    const progress = this.initialSave?.progress || {};
    this.savedZombieKilled = !!progress.corridorZombieKilled;
    this.savedDarkness = !!progress.darkness;
    this.savedBloodX = progress.bloodX;
    this.savedBloodY = progress.bloodY;
    this.hasFlashlight = this.stats.hasItem('taskulamppu');

    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    const map = this.make.tilemap({ key: 'kaytava' });

    const tsWall = map.addTilesetImage('Wall_1_32x32', 'wall1');
    const tsItems = map.addTilesetImage('Items_1_32x32', 'items1');
    const tsFloor = map.addTilesetImage('Floor_1_32x32', 'floor1');
    const tsOthers = map.addTilesetImage('Others_1_32x32', 'others1');
    const tsBorders = map.addTilesetImage('Borders_32x32', 'borders1');
    const allTilesets = [tsWall, tsItems, tsFloor, tsOthers, tsBorders];

    map.createLayer('Lattia', allTilesets, 0, 0);
    const lightsLayer = map.createLayer('Valot', allTilesets, 0, 0);
    this.lightsLayer = lightsLayer;
    const wallsLayer = map.createLayer('Seinät', allTilesets, 0, 0);

    this.wallsLayer = wallsLayer;
    lightsLayer.setDepth(4);
    wallsLayer.setDepth(2);
    wallsLayer.setCollisionByExclusion([-1, 0]);

    this.mapWidth = map.widthInPixels;
    this.mapHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.setBackgroundColor('#111111');

    let startX = 18.5 * TILE;
    let startY = 46 * TILE;
    if (this.spawnPoint === 'aula') {
      // Tullaan aulasta -> portaikon aukosta (oikea yläreuna, x22 y3-4)
      startX = 21 * TILE;
      startY = 4 * TILE;
    }

    this.player = this.physics.add.sprite(startX, startY, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'ylos';

    this.createAnimations();
    this.createZombieAnimations();
    this.physics.add.collider(this.player, wallsLayer);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.playerShadow = this.add.ellipse(startX, startY + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(this.batCollected);

    // --- Pimeys ---
    this.darkness = this.add.rectangle(
      this.mapWidth / 2, this.mapHeight / 2,
      this.mapWidth, this.mapHeight,
      0x000000, 0.35
    );
    this.darkness.setScrollFactor(1);
    this.darkness.setDepth(8);

    this.buildStairs();

    this.zombieSpawnTriggered = false;
    this.zombieSpawnY = 34 * TILE;

    // Jos zombie on tapettu, piirrä verilammikko takaisin tallennetusta kohdasta
    if (this.savedZombieKilled && this.savedBloodX != null && this.savedBloodY != null) {
      this.drawBloodPool(this.savedBloodX, this.savedBloodY);
    }

    // Jos pimeys on jo tullut (paluu/lataus), sytytä valokeila heti
    if (this.savedDarkness && this.hasFlashlight) {
      if (this.darkness) {
        this.darkness.destroy();
        this.darkness = null;
      }
      this.flashlightTaken = true;
      this.enableFlashlightBeam();
    }

    this.flashlight = null;
    this.flashlightHint = null;

    this.emitHint('Kerrostalon käytävä. Etene ylös.');
    this.emitStats();

    this.eWasDown = true;
    this.spaceWasDown = true;

    // Reactin cutscene ilmoittaa kun pimeys saa alkaa
    this.game.events.on('corridor-darkness-start', this.onDarknessStart, this);
    this.events.once('shutdown', () => {
      this.game.events.off('corridor-darkness-start', this.onDarknessStart, this);
    });
  }

  onDarknessStart() {
    if (this.pendingDarkness) {
      this.startDarkness(this.pendingDarkness.x, this.pendingDarkness.y);
      this.pendingDarkness = null;
    }
  }

  // Valokeila: erillinen musta peitto (darkness) + kirkas keila joka

  // Valokeila ILMAN maskeja/blendejä: pimeys piirretään joka framella
  // isona mustana polygonina jossa on keilan+lähivalon muotoinen REIKÄ.
  // Graphics-reikä tehdään piirtämällä ulkokehä myötäpäivään ja reikä
  // vastapäivään samassa polussa (even-odd täyttö).
  updateFlashlight() {
    if (!this.flashlightOn || !this.darkGfx) return;

    const cam = this.cameras.main;
    const px = this.player.x - cam.scrollX;
    const py = this.player.y - cam.scrollY;
    const W = this.scale.width;
    const H = this.scale.height;

    const g = this.darkGfx;
    g.clear();
    g.fillStyle(0x000000, 0.97);

    // Säteittäinen pimeys: käydään koko ympyrä (0..2PI) läpi pieninä sektoreina.
    // Jokaiselle sektorille lasketaan valon ulottuma (near-ympyrä + keila),
    // ja piirretään pimeys valon reunasta ruudun reunaan asti.
    const dirAngle = { ylos: -Math.PI/2, alas: Math.PI/2, vasen: Math.PI, oikea: 0 }[this.lastDirection];
    const near = 38;
    const beamLen = 250;
    const spread = 0.5;

    const maxR = Math.sqrt(W * W + H * H); // varmasti ruudun ulkopuolelle
    const N = 72;                          // sektorien määrä (5 astetta)
    const step = (2 * Math.PI) / N;

    for (let i = 0; i < N; i++) {
      const a1 = i * step;
      const a2 = (i + 1) * step;

      // valon ulottuma tässä kulmassa (kummallekin reunalle)
      const r1 = this.lightRadiusAt(a1, dirAngle, near, beamLen, spread);
      const r2 = this.lightRadiusAt(a2, dirAngle, near, beamLen, spread);

      // pimeys nelikulmiona: valon reunasta ruudun reunaan
      g.beginPath();
      g.moveTo(px + Math.cos(a1) * r1, py + Math.sin(a1) * r1);
      g.lineTo(px + Math.cos(a1) * maxR, py + Math.sin(a1) * maxR);
      g.lineTo(px + Math.cos(a2) * maxR, py + Math.sin(a2) * maxR);
      g.lineTo(px + Math.cos(a2) * r2, py + Math.sin(a2) * r2);
      g.closePath();
      g.fillPath();
    }
  }

  // Valon ulottuma annetussa kulmassa: lähiympyrä + keila jos kulma osuu keilaan
  lightRadiusAt(angle, dirAngle, near, beamLen, spread) {
    // kulmaero keilan keskisuuntaan (-PI..PI)
    let d = angle - dirAngle;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;

    if (Math.abs(d) <= spread) {
      // Tasainen kärki: keila yhtä pitkä koko leveydeltä, reunoilla pehmennys
      const edge = spread * 0.8;
      if (Math.abs(d) <= edge) {
        return beamLen;
      }
      const t = (Math.abs(d) - edge) / (spread - edge);
      return near + (beamLen - near) * (1 - t);
    }
    return near;
  }

  updateLightGlow() {
    if (!this.flashlightOn || !this.glowGfx) return;
    const px = this.player.x;
    const py = this.player.y;
    const g = this.glowGfx;
    g.clear();
    for (let i = 4; i >= 1; i--) {
      g.fillStyle(0xfff2c0, 0.08);
      g.fillCircle(px, py, 30 + i * 10);
    }
    const dirAngle = { ylos: -Math.PI/2, alas: Math.PI/2, vasen: Math.PI, oikea: 0 }[this.lastDirection];
    const beamLen = 230;
    const spread = 0.45;
    g.fillStyle(0xfff2c0, 0.07);
    g.beginPath();
    g.moveTo(px, py);
    const steps = 16;
    for (let st = 0; st <= steps; st++) {
      const t = -spread + (2 * spread) * (st / steps);
      const ang = dirAngle + t;
      g.lineTo(px + Math.cos(ang) * beamLen, py + Math.sin(ang) * beamLen);
    }
    g.closePath();
    g.fillPath();
  }

  updateHeldFlashlight() {
    if (!this.heldFlashlight) return;
    const off = {
      alas:  { x: -10, y: 14, angle: 90 },
      ylos:  { x: 10,  y: 6,  angle: -90 },
      vasen: { x: -10, y: 14, angle: 180 },
      oikea: { x: 10,  y: 14, angle: 0 },
    }[this.lastDirection];
    this.heldFlashlight.setPosition(this.player.x + off.x, this.player.y + off.y);
    this.heldFlashlight.setAngle(off.angle);
    this.heldFlashlight.setDepth(this.lastDirection === 'ylos' ? 9 : 11);
  }

  enableFlashlightBeam() {
    this.flashlightOn = true;

    // Pimeys tullut: piilota ikkunoiden valokerros
    if (this.lightsLayer) {
      this.lightsLayer.setVisible(false);
    }

    if (this.darkness) {
      this.darkness.destroy();
      this.darkness = null;
    }

    // Additiivinen valohohde maailmassa (depth 7, pimeyden alla)
    this.glowGfx = this.add.graphics();
    this.glowGfx.setScrollFactor(1);
    this.glowGfx.setDepth(7);
    this.glowGfx.setBlendMode(Phaser.BlendModes.ADD);

    // Pimeys ruudun päällä, keila-reikä (scrollFactor 0)
    this.darkGfx = this.add.graphics();
    this.darkGfx.setScrollFactor(0);
    this.darkGfx.setDepth(8);

    // Taskulamppu käteen
    this.heldFlashlight = this.add.container(this.player.x, this.player.y);
    this.heldFlashlight.setDepth(11);
    const fBody = this.add.rectangle(0, 0, 14, 6, 0x2a2a30);
    fBody.setStrokeStyle(1, 0x666670);
    const fHead = this.add.rectangle(8, 0, 5, 8, 0x444450);
    const fLens = this.add.circle(11, 0, 2.6, 0xffe08a);
    this.heldFlashlight.add([fBody, fHead, fLens]);

    this.updateFlashlight();
    this.updateLightGlow();
    this.updateHeldFlashlight();
  }

  buildStairs() {
    const cx = 22 * TILE + TILE / 2;
    const cy = 4 * TILE;
    const g = this.add.container(cx, cy);
    g.setDepth(3);
    const w = TILE;
    const h = 3 * TILE;
    const base = this.add.rectangle(0, 0, w, h, 0x1a140c);
    g.add(base);
    const steps = 6;
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
      const shade = Phaser.Display.Color.GetColor(58 + i * 8, 46 + i * 6, 30 + i * 4);
      const step = this.add.rectangle(-w / 2 + stepW / 2 + i * stepW, 0, stepW - 1, h - i * 6, shade);
      step.setStrokeStyle(1, 0x0e0a06);
      g.add(step);
    }
    const glow = this.add.ellipse(6, 0, w * 0.8, h * 0.7, 0x6688cc, 0.15);
    g.add(glow);
    this.stairsPos = { x: cx, y: cy };
  }

  spawnZombie() {
    const zx = 19.5 * TILE;
    const zy = 26 * TILE;
    this.zombieShadow = this.add.ellipse(zx, zy + 22, 34, 13, 0x000000, 0.45);
    this.zombieShadow.setDepth(8);
    this.zombie = this.physics.add.sprite(zx, zy, 'zw-idle', 0);
    this.zombie.setDepth(9);
    this.zombie.setScale(2);
    this.zombie.body.setSize(16, 14);
    this.zombie.body.setOffset(8, 16);
    this.zombie.body.setCollideWorldBounds(true);
    this.zombie.anims.play('zw-seiso', true);
    this.physics.add.collider(this.zombie, this.wallsLayer);
    this.zombieHP = 34;
    this.zombieAlive = true;
    this.zombieHPText = this.add.text(zx - 20, zy -75, 'HP: 34', textStyles.hp).setDepth(11);
    this.cameras.main.flash(300, 60, 0, 0);
    this.emitHint('Jokin tulee käytävässä! Hakkaa se mailalla (SPACE).', 'danger');
  }

  updateZombie() {
    const dx = this.player.x - this.zombie.x;
    const dy = this.player.y - this.zombie.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      const speed = 60;
      this.zombie.body.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }
    this.zombie.setFlipX(dx < 0);
    const currentAnim = this.zombie.anims.currentAnim?.key;
    const isBusy = currentAnim === 'zw-osuma' && this.zombie.anims.isPlaying;
    if (!isBusy) {
      if (dist < 40) {
        if (currentAnim !== 'zw-hyokkaa' || !this.zombie.anims.isPlaying) {
          this.zombie.anims.play('zw-hyokkaa', true);
        }
      } else {
        this.zombie.anims.play('zw-kavele', true);
      }
    }
    this.zombieShadow.setPosition(this.zombie.x, this.zombie.y + 22);
    this.zombieHPText.setPosition(this.zombie.x - 20, this.zombie.y -75);
    if (dist < 28) {
      this.stats.takeDamage(0.28);
      if (this.stats.isDead()) {
        this.handleGameOver();
      }
    }
  }

  tryHitZombie() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.zombie.x, this.zombie.y);
    this.doPlayerAttackMotion();
    if (dist < 60) {
      this.stats.useAttackEnergy(this.time.now);
      const damage = Phaser.Math.Between(7, 14);
      this.zombieHP -= damage;
      this.zombieHPText.setText(`HP: ${Math.max(0, this.zombieHP)}`);
      const dx = this.zombie.x - this.player.x;
      const dy = this.zombie.y - this.player.y;
      const d2 = Math.sqrt(dx * dx + dy * dy) || 1;
      this.zombie.body.setVelocity((dx / d2) * 220, (dy / d2) * 220);
      this.hitZombieEffect();
      if (this.zombieHP > 0) {
        this.zombie.anims.play('zw-osuma', true);
      }
      if (this.zombieHP <= 0) {
        this.killZombie();
      }
    }
  }

  doPlayerAttackMotion() {
    const dir = this.lastDirection;

    // Lyöntiääni (soi joka iskulla)
    if (this.cache.audio.exists('punch')) {
      const sfxMuted = this.registry.get('sfxMuted');
        const sfxVol = this.registry.get('sfxVolume');
        this.sound.play('punch', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }

    // Hahmo nytkähtää zombieta kohti (sama kuin nyrkki-isku asunnossa)
    if (this.zombie) {
      const dx = this.zombie.x - this.player.x;
      const dy = this.zombie.y - this.player.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      this.tweens.add({
        targets: this.player,
        x: this.player.x + (dx / len) * 12,
        y: this.player.y + (dy / len) * 12,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    // Maila heilahtaa
    const swingFrom = { alas: 55, ylos: 235, vasen: 145, oikea: 35 }[dir];
    const swingTo = swingFrom - 90;
    this.tweens.killTweensOf(this.heldBat);
    this.heldBat.setAngle(swingFrom);
    this.tweens.add({
      targets: this.heldBat,
      angle: swingTo,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Lyöntiefekti: valkoinen kaari-välähdys mailan eteen
    const off = {
      alas:  { x: 0,  y: 34 },
      ylos:  { x: 0,  y: -34 },
      vasen: { x: -34, y: 6 },
      oikea: { x: 34, y: 6 },
    }[dir];
    const sx = this.player.x + off.x;
    const sy = this.player.y + off.y;

    const slash = this.add.graphics();
    slash.setDepth(12);
    slash.lineStyle(3, 0xffffff, 0.9);
    const baseAng = { alas: Math.PI/2, ylos: -Math.PI/2, vasen: Math.PI, oikea: 0 }[dir];
    slash.beginPath();
    slash.arc(sx, sy, 22, baseAng - 0.7, baseAng + 0.7);
    slash.strokePath();
    this.tweens.add({
      targets: slash,
      alpha: 0,
      duration: 160,
      onComplete: () => slash.destroy(),
    });

    // pieni pamaus-rengas
    const ring = this.add.circle(sx, sy, 5, 0xffffff, 0.8);
    ring.setDepth(12);
    this.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  hitZombieEffect() {
    if (!this.zombie) return;
    this.zombie.setTint(0xffffff);
    this.zombie.tintFill = true;
    this.time.delayedCall(80, () => {
      if (this.zombie) this.zombie.clearTint();
    });
    const baseScale = 2;
    this.tweens.add({
      targets: this.zombie,
      scaleX: baseScale * 1.12,
      scaleY: baseScale * 0.9,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
    const spray = this.add.graphics();
    spray.setDepth(11);
    spray.fillStyle(0x8a0000, 0.85);
    for (let i = 0; i < 5; i++) {
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const d = Phaser.Math.Between(6, 20);
      spray.fillCircle(this.zombie.x + Math.cos(a) * d, this.zombie.y - 10 + Math.sin(a) * d, Phaser.Math.Between(1, 3));
    }
    this.tweens.add({ targets: spray, alpha: 0, duration: 350, onComplete: () => spray.destroy() });
  }

  killZombie() {
    this.zombieAlive = false;
    this.zombieDefeated = true;
    this.zombie.body.setVelocity(0, 0);
    this.zombie.anims.play('zw-kuolee', true);
    this.zombieHPText.destroy();
    const dyingZombie = this.zombie;
    const dyingShadow = this.zombieShadow;
    const deathX = this.zombie.x;
    const deathY = this.zombie.y + 22;
    this.zombie = null;
    this.zombieShadow = null;
    this.time.delayedCall(500, () => this.spawnBloodPool(deathX, deathY));
    this.time.delayedCall(2200, () => {
      dyingZombie.destroy();
      dyingShadow.destroy();
    });
    const leveledUp = this.stats.registerKill();
    this.emitHint(leveledUp ? `Kaatui. TASO NOUSI! Nyt taso ${this.stats.level}` : 'Kaatui. Selvisit taistelusta.', 'success');
    this.emitStats();
    // HUOM: ei tallenneta vielä — tallennuspiste tulee vasta kun
    // taskulamppu on otettu (takeFlashlight). Näin päivitys ennen lamppua
    // ei jätä peliä rikkinäiseen välitilaan; zombie tulee tarvittaessa uudestaan.
    // Zombien kuoltua: pimeys-cutscene (React), jonka jälkeen käytävä pimenee
    this.pendingDarkness = { x: deathX, y: deathY };
    // Lukitse liike heti: cutscene (React) ottaa inputin pois, mutta jos
    // nuolinäppäin oli pohjassa, hahmo jäisi muuten kävelemään käytävän päähän.
    this.inputLocked = true;
    this.player.body.setVelocity(0);
    this.time.delayedCall(1200, () => {
      this.game.events.emit('game-event', { type: 'darkness-falling' });
    });
  }

  startDarkness(nearX, nearY) {
    this.darknessActive = true;
    this.inputLocked = false;
    // Nollaa näppäinten isDown-tila: cutscenen aikana keyboard.enabled oli
    // false, joten näppäimen keyup ei rekisteröitynyt ja cursors saattoi
    // jäädä jumiin true:ksi -> ilman tätä hahmo jatkaisi kävelyä cutscenen
    // jälkeen vaikka näppäin on jo vapautettu.
    this.input?.keyboard?.resetKeys();
    this.player.body.setVelocity(0);
    // Cutscene hoiti pimenemisen visuaalisesti -> käytävä on jo pimeä.
    this.darkness.setFillStyle(0x000000, 0.97);
    this.darkness.setAlpha(1);
    this.createFlashlight(nearX + 30, nearY);
    this.emitHint('Pimeää. Ota taskulamppu (E).', 'warning');
  }

  createFlashlight(x, y) {
    this.flashlight = this.add.container(x, y);
    this.flashlight.setDepth(9);
    const body = this.add.rectangle(0, 0, 18, 8, 0x2a2a30);
    body.setStrokeStyle(1, 0x555560);
    const headLamp = this.add.rectangle(-10, 0, 6, 10, 0x444450);
    const lens = this.add.circle(-13, 0, 3.5, 0xffe08a);
    const beam = this.add.ellipse(-28, 0, 40, 18, 0xffe08a, 0.3);
    this.flashlight.add([beam, body, headLamp, lens]);
    this.tweens.add({ targets: beam, alpha: 0.14, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.flashlightHint = this.add.text(x - 20, y + 24, 'Taskulamppu (E)', textStyles.itemHint).setDepth(11).setVisible(false);
  }

  drawBloodPool(x, y) {
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
    return pool;
  }

  spawnBloodPool(x, y) {
    this.bloodX = x;
    this.bloodY = y;
    const pool = this.drawBloodPool(x, y);
    pool.setAlpha(0);
    this.tweens.add({ targets: pool, alpha: 1, duration: 900, ease: 'Quad.easeOut' });
  }

  takeFlashlight() {
    this.flashlightTaken = true;
    this.flashlight.destroy();
    this.flashlightHint?.destroy();
    this.stats.addItem('taskulamppu');
    this.hasFlashlight = true;
    this.savedDarkness = true;
    this.savedZombieKilled = true;
    this.emitHint('Sait taskulampun. Se valaisee edessäsi.', 'success');
    this.emitStats();
    // Kytke valokeila päälle
    this.enableFlashlightBeam();
    // Tallennuspiste: taskulamppu + pimeys + tapettu zombie talteen
    this.requestSave();
    this.game.events.emit('game-event', { type: 'checkpoint-reached', area: 'kaytava' });
    this.game.events.emit('game-event', { type: 'flashlight-taken' });
  }

  requestSave() {
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('kaytava', {
        firstZombieKilled: true,
        batCollected: true,
        corridorZombieKilled: this.savedZombieKilled || this.zombieDefeated,
        darkness: this.savedDarkness || this.darknessActive,
        bloodX: this.bloodX ?? this.savedBloodX,
        bloodY: this.bloodY ?? this.savedBloodY,
      }),
    });
  }

  handleGameOver() {
    this.scene.pause();
    this.game.events.emit('game-event', { type: 'game-over', stats: this.stats.getSnapshot() });
  }

  createAnimations() {
    if (this.anims.exists('kavele-alas')) return;
    const dirs = [
      { key: 'alas', start: 0 },
      { key: 'vasen', start: 4 },
      { key: 'oikea', start: 8 },
      { key: 'ylos', start: 12 },
    ];
    dirs.forEach(({ key, start }) => {
      this.anims.create({
        key: `kavele-${key}`,
        frames: this.anims.generateFrameNumbers('hahmo', { start, end: start + 3 }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `seiso-${key}`,
        frames: [{ key: 'hahmo', frame: start }],
        frameRate: 1,
      });
    });
  }

  createZombieAnimations() {
    if (this.anims.exists('zw-kavele')) return;
    this.anims.create({ key: 'zw-seiso', frames: this.anims.generateFrameNumbers('zw-idle', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'zw-kavele', frames: this.anims.generateFrameNumbers('zw-walk', { start: 0, end: 5 }), frameRate: 9, repeat: -1 });
    this.anims.create({ key: 'zw-hyokkaa', frames: this.anims.generateFrameNumbers('zw-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
    this.anims.create({ key: 'zw-osuma', frames: this.anims.generateFrameNumbers('zw-hurt', { start: 0, end: 4 }), frameRate: 14, repeat: 0 });
    this.anims.create({ key: 'zw-kuolee', frames: this.anims.generateFrameNumbers('zw-dead', { start: 0, end: 7 }), frameRate: 10, repeat: 0 });
  }

  updateHeldBat() {
    const offsets = {
      alas:  { x: 8,  y: 18, angle: 55,  depth: 11 },
      ylos:  { x: -8, y: 14, angle: 235, depth: 9 },
      vasen: { x: -8, y: 18, angle: 145, depth: 11 },
      oikea: { x: 8,  y: 18, angle: 35,  depth: 11 },
    };
    const o = offsets[this.lastDirection];
    this.heldBat.setPosition(this.player.x + o.x, this.player.y + o.y);
    this.heldBat.setAngle(o.angle);
    this.heldBat.setDepth(o.depth);
  }

  emitHint(text, kind = 'hint') {
    this.game.events.emit('game-event', { type: 'hint', text, kind });
  }

  emitStats() {
    const snap = this.stats.getSnapshot();
    const json = JSON.stringify(snap);
    if (json === this.lastStatsJson) return;
    this.lastStatsJson = json;
    this.game.events.emit('game-event', { type: 'stats-update', stats: snap });
  }

  update(time, delta) {
    if (this.inputLocked) {
      this.player.body.setVelocity(0);
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

    // Taskulampun valokeila + lamppu kädessä seuraavat hahmoa
    if (this.flashlightOn) {
      this.updateFlashlight();
      this.updateLightGlow();
      this.updateHeldFlashlight();
    }

    const eJustPressed = this.keyE.isDown && !this.eWasDown;
    const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;

    if (!this.savedZombieKilled && !this.zombieSpawnTriggered && this.player.y < this.zombieSpawnY) {
      this.zombieSpawnTriggered = true;
      this.spawnZombie();
    }

    if (this.zombie && this.zombieAlive) {
      this.updateZombie();
      if (spaceJustPressed && this.stats.canAttack()) {
        this.tryHitZombie();
      }
    }

    if (this.flashlight && !this.flashlightTaken) {
      const distToLamp = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.flashlight.x, this.flashlight.y);
      if (distToLamp < 55) {
        this.flashlightHint?.setVisible(true);
        if (eJustPressed) {
          this.takeFlashlight();
        }
      } else {
        this.flashlightHint?.setVisible(false);
      }
    }

    // Aulaan: kävele portaikon aukosta ulos (x > 21.5, rivit y3-4)
    const stX = this.player.x / TILE;
    const stY = this.player.y / TILE;
    if (!this.stairsReached && stX > 21.5 && stY > 2.5 && stY < 4.5) {
      this.stairsReached = true;
      this.reachStairs();
    }

    // Paluu asuntoon: kävele vasempaan alaoveen
    // Paluu asuntoon: kävele alaoven aukosta ulos (x < 17.8, rivit y46-47)
    const tileX = this.player.x / TILE;
    const tileY = this.player.y / TILE;
    if (!this.returningApt && tileX < 17.8 && tileY > 45.5 && tileY < 47.5) {
      this.returningApt = true;
      this.game.events.emit('game-event', { type: 'return-to-apartment' });
    }

    this.eWasDown = this.keyE.isDown;
    this.spaceWasDown = this.keySpace.isDown;
    this.emitStats();
  }

  reachStairs() {
    this.emitHint('Portaat johtavat eteenpäin... (seuraava alue tulossa)', 'success');
    this.game.events.emit('game-event', { type: 'stairs-reached' });
  }
}
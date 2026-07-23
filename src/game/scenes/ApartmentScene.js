import Phaser from 'phaser';
import PlayerStats from '../PlayerStats';
import { textStyles } from '../textStyles';

export default class ApartmentScene extends Phaser.Scene {
  constructor() {
    super('ApartmentScene');
  }

  // Phaser kutsuu tätä ENNEN create()-vaihetta, kun scene.start('ApartmentScene', { save }) ajetaan
  init(data) {
    this.initialSave = data?.save || this.initialSave || null;
    this.spawnPoint = data?.spawn || null;
  }

  // Yhteensopivuus: GameCanvas voi myös asettaa saven suoraan
  setInitialSave(save) {
    this.initialSave = save || null;
  }

  preload() {
    this.load.image('wall1', '/assets/tilesets/Wall_1_32x32.png');
    this.load.image('floor1', '/assets/tilesets/Floor_1_32x32.png');
    this.load.image('items1', '/assets/tilesets/Items_1_32x32.png');
    this.load.image('carpets1', '/assets/tilesets/Carpets_1_32x32.png');
    this.load.image('others1', '/assets/tilesets/Others_1_32x32.png');
    this.load.image('tileset', '/assets/tilesets/InteriorTilesLITE.png');
    this.load.image('maila', '/assets/spritesheets/maila.png');

    this.load.spritesheet('zombie-walk', '/assets/spritesheets/zombie-walk.png', {
      frameWidth: 480,
      frameHeight: 480,
    });
    this.load.spritesheet('zombie-idle', '/assets/spritesheets/zombie-idle.png', {
      frameWidth: 480,
      frameHeight: 480,
    });
    this.load.spritesheet('zombie-attack', '/assets/spritesheets/zombie-attack.png', {
      frameWidth: 480,
      frameHeight: 480,
    });
    this.load.spritesheet('zombie-hurt', '/assets/spritesheets/zombie-hurt.png', {
      frameWidth: 480,
      frameHeight: 480,
    });
    this.load.spritesheet('zombie-dead', '/assets/spritesheets/zombie-dead.png', {
      frameWidth: 480,
      frameHeight: 480,
    });
    this.load.spritesheet('hahmo', '/assets/spritesheets/hahmo.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.audio('punch', '/assets/sfx/punch.mp3');
    this.load.audio('collect', '/assets/sfx/collect.mp3');
    this.load.audio('door', '/assets/sfx/door.mp3');
    this.load.audio('level', '/assets/sfx/level.mp3');
    this.load.audio('knocking', '/assets/sfx/knocking.mp3');
    this.load.tilemapTiledJSON('asunto', '/assets/asunto.json');
  }

  create() {
    // --- Nollaa tila (tärkeä restartissa) ---
    this.zombie = null;
    this.zombieShadow = null;
    this.zombieAlive = false;
    this.zombieHP = 0;
    this.doorOpened = false;
    this.batCollected = false;
    this.firstZombieKilled = false;
    this.eWasDown = false;
    this.spaceWasDown = false;
    this.lastStatsJson = null;
    this.leaving = false;
    this.canLeaveApt = this.spawnPoint !== 'kaytava';
    this.exitHintShown = false;

    this.stats = new PlayerStats();

    // --- Lataa tallennettu edistyminen ---
    const progress = this.initialSave?.progress || {};
    if (this.initialSave) {
      this.stats.loadFromSave(this.initialSave);
    }

    // Juonivaiheet tallennuksesta.
    // Asunto on yksi haaste: ovi+zombie tallennetaan yhdessä vasta kun zombie on tapettu.
    const savedFirstZombieKilled = !!progress.firstZombieKilled;
    this.savedDarkness = !!progress.darkness;
    this.hasFlashlight = this.stats.hasItem('taskulamppu');
    const batAlreadyOwned = this.stats.hasItem('maila') || !!progress.batCollected;
    const savedDoorOpened = savedFirstZombieKilled;

    this.keyShift = this.input.keyboard.addKey('SHIFT');
    this.keyE = this.input.keyboard.addKey('E');

    // Suora keydown-kuuntelija mailan poiminnalle. Phaserin keyboard.enabled
    // false/true -sykli (cutscene) sotkee this.keyE.isDown -tilan, joten
    // mailan poiminta luetaan suoraan selaimen tapahtumasta.
    this._onKeyDownE = (ev) => {
      if (ev.code !== 'KeyE' && ev.key !== 'e' && ev.key !== 'E') return;
      this.tryCollectBat();
    };
    window.addEventListener('keydown', this._onKeyDownE);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this._onKeyDownE);
      // Varmista ettei koputus-ääni jää soimaan jos scene vaihtuu ennen
      // oven avaamista (esim. kuolema).
      if (this.knockSound) {
        this.knockSound.stop();
        this.knockSound.destroy();
        this.knockSound = null;
      }
    });
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Kartta ---
    const map = this.make.tilemap({ key: 'asunto' });

    const tsWall = map.addTilesetImage('Wall_1_32x32', 'wall1');
    const tsFloor = map.addTilesetImage('Floor_1_32x32', 'floor1');
    const tsItems = map.addTilesetImage('Items_1_32x32', 'items1');
    const tsCarpets = map.addTilesetImage('Carpets_1_32x32', 'carpets1');
    const tsOthers = map.addTilesetImage('Others_1_32x32', 'others1');
    const tsTileset = map.addTilesetImage('InteriorTilesLITE', 'tileset');

    const allTilesets = [
      tsWall,
      tsFloor,
      tsItems,
      tsCarpets,
      tsOthers,
      tsTileset,
    ];

    map.createLayer('Lattia', allTilesets, 0, 0);
    const wallsLayer = map.createLayer('Seinät', allTilesets, 0, 0);
    const furnitureLayer = map.createLayer('Kalusteet', allTilesets, 0, 0);
    const carpetsLayer = map.createLayer('Matot', allTilesets, 0, 0);
    const lightsLayer = map.createLayer('Valot', allTilesets, 0, 0);
    this.lightsLayer = lightsLayer;

    this.wallsLayer = wallsLayer;
    this.furnitureLayer = furnitureLayer;

    lightsLayer.setDepth(4);
    carpetsLayer.setDepth(1);
    wallsLayer.setDepth(2);
    furnitureLayer.setDepth(3);

    wallsLayer.setCollisionByExclusion([-1, 0]);
    furnitureLayer.setCollisionByExclusion([-1, 0]);

    // --- Objektien sijainnit kartasta ---
    let playerPos = this.getObjectPos(map, 'Pelaaja', 783, 143);
    if (this.spawnPoint === 'kaytava') {
      const dp = this.getObjectPos(map, 'Ovi', 1248, 732);
      playerPos = { x: dp.x - 40, y: dp.y };
    }
    const batPos = this.getObjectPos(map, 'Maila', 295, 92);
    const doorPos = this.getObjectPos(map, 'Ovi', 1248, 732);
    this.zombieSpawn = this.getObjectPos(map, 'Zombie', 1275, 734);

    // --- Varjo pelaajan alle ---
    this.playerShadow = this.add.ellipse(playerPos.x, playerPos.y + 20, 40, 16, 0x000000, 0.4);
    this.playerShadow.setDepth(9);

    // --- Pelaaja ---
    this.player = this.physics.add.sprite(playerPos.x, playerPos.y, 'hahmo', 0);
    this.player.setDepth(10);
    this.player.setScale(2);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(18, 14);
    this.player.body.setOffset(7, 18);
    this.lastDirection = 'alas';

    this.createAnimations();

    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, furnitureLayer);

    // Kevyt hämäryys asuntoon
    this.cameras.main.setBackgroundColor('#111111');

    this.darkness = this.add.rectangle(
      map.widthInPixels / 2,
      map.heightInPixels / 2,
      map.widthInPixels,
      map.heightInPixels,
      0x000000,
      0.35
    );
    this.darkness.setScrollFactor(1);
    this.darkness.setDepth(8);

    // --- Maila kädessä (piilossa kunnes poimittu) ---
    this.heldBat = this.add.image(0, 0, 'maila');
    this.heldBat.setOrigin(0.15, 0.5);
    this.heldBat.setDepth(11);
    this.heldBat.setScale(1.2);
    this.heldBat.setVisible(false);

    if (batAlreadyOwned) {
      this.batCollected = true;
      this.bat = null;
      this.batShadow = null;
      this.batHint = null;
      this.heldBat.setVisible(true);
    } else {
      this.batShadow = this.add.ellipse(batPos.x, batPos.y + 6, 42, 11, 0x000000, 0.35);
      this.batShadow.setDepth(8);

      this.bat = this.add.image(batPos.x, batPos.y, 'maila');
      this.bat.setDepth(9);

      // Maila näkyy vasta kun ensimmäinen zombie on tapettu
      this.bat.setVisible(savedFirstZombieKilled);
      this.batShadow.setVisible(savedFirstZombieKilled);

      this.batHint = this.add.text(batPos.x - 40, batPos.y + 20, 'Maila (E)', textStyles.itemHint)
        .setDepth(11)
        .setVisible(false);
    }

    // --- Ovi ---
    this.knockText = null;

    if (savedDoorOpened) {
      this.doorOpened = true;
      this.door = null;
    } else {
      this.door = this.add.rectangle(doorPos.x, doorPos.y, 12, 68, 0x5a3a20);
      this.door.setDepth(9);
      this.physics.add.existing(this.door, true);
      this.physics.add.collider(this.player, this.door);

      // Oven koputus-ääni: alkaa heti, luuppaa (tiedosto lyhyt),
      // pysähtyy kun ovi avataan (openDoor).
      if (this.cache.audio.exists('knocking')) {
        const kSfxMuted = this.registry.get('sfxMuted');
        const kSfxVol = this.registry.get('sfxVolume');
        this.knockSound = this.sound.add('knocking', { loop: true, volume: kSfxMuted ? 0 : 0.6 * (kSfxVol ?? 1) });
        this.knockSound.play();
      }

      this.knockText = this.add.text(doorPos.x - 120, doorPos.y - 40, '*KOLKUTUS*', textStyles.danger)
        .setDepth(11)
        .setVisible(false);

      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          if (!this.doorOpened && this.knockText) {
            this.knockText.setVisible(true);
            this.time.delayedCall(300, () => this.knockText?.setVisible(false));
          }
        },
      });
    }

    this.firstZombieKilled = savedFirstZombieKilled;

    // Aloitusvihje riippuu vaiheesta
    if (batAlreadyOwned) {
      this.emitHint('Maila kädessä. Lähde ovesta käytäville.', 'success');
    } else if (savedFirstZombieKilled) {
      this.emitHint('Kuulet kaaosta käytäviltä... etsi maila makuuhuoneesta!', 'warning');
    } else {
      this.emitHint('Joku kolkuttaa ovea... mene eteiseen ja avaa se (E)');
    }

    this.emitStats();

    // --- Valokeila (jos pimeys on jo tullut ja taskulamppu hallussa) ---
    this.flashlightOn = false;
    this.darkGfx = null;
    this.glowGfx = null;
    this.heldFlashlight = null;
    if (this.savedDarkness && this.hasFlashlight) {
      if (this.lightsLayer) this.lightsLayer.setVisible(false);
      this.enableFlashlightBeam();
    }

    this.eWasDown = true;
    this.spaceWasDown = true;
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

    // Zombie: idle 4, walk 6, attack 6, hurt 5, dead 8 framea
    this.anims.create({
      key: 'z-kavele',
      frames: this.anims.generateFrameNumbers('zombie-walk', { start: 0, end: 5 }),
      frameRate: 9,
      repeat: -1,
    });

    this.anims.create({
      key: 'z-seiso',
      frames: this.anims.generateFrameNumbers('zombie-idle', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: 'z-hyokkaa',
      frames: this.anims.generateFrameNumbers('zombie-attack', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: 'z-osuma',
      frames: this.anims.generateFrameNumbers('zombie-hurt', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: 'z-kuolee',
      frames: this.anims.generateFrameNumbers('zombie-dead', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  getObjectPos(map, layerName, fallbackX, fallbackY) {
    const layer = map.getObjectLayer(layerName);
    const obj = layer?.objects?.[0];
    return obj
      ? { x: obj.x, y: obj.y }
      : { x: fallbackX, y: fallbackY };
  }

  // Pyydä Reactia tallentamaan nykyinen tila backendiin
  requestSave() {
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData('asunto', {
        firstZombieKilled: this.firstZombieKilled,
        batCollected: this.batCollected,
        corridorZombieKilled: !!this.savedDarkness,
        darkness: !!this.savedDarkness,
      }),
    });
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

    this.game.events.emit('game-event', {
      type: 'stats-update',
      stats: snap,
    });
  }

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

  update(time, delta) {
    // Päivitä koputus-ääni reaaliajassa asetuksista. TÄMÄ on ennen input-eston
    // returnia, jotta mykistys/palautus reagoi heti myös silloin kun asetus-
    // paneeli on auki (paneeli asettaa inputEnabled=false). Mykistys pysäyttää
    // äänen kokonaan (ei jää looppaamaan äänettömänä), poisto käynnistää sen.
    if (this.knockSound) {
      const kMuted = this.registry.get('sfxMuted');
      const kVol = this.registry.get('sfxVolume');
      if (kMuted) {
        if (this.knockSound.isPlaying) this.knockSound.stop();
      } else {
        this.knockSound.setVolume(0.6 * (kVol ?? 1));
        if (!this.knockSound.isPlaying) this.knockSound.play();
      }
    }

    // Cutscene/reveal-suojaus: kun input on estetty (esim. zombie-reveal),
    // pysäytä liike joka framella. Kun input palautuu, nollaa näppäinten
    // isDown-tila kerran -- muuten cursors saattoi jäädä jumiin true:ksi
    // (keyup ei rekisteröitynyt kun keyboard.enabled oli false) ja hahmo
    // jatkaisi kävelyä cutscenen jälkeen.
    const inputBlocked = this.registry?.get('inputEnabled') === false;
    if (inputBlocked) {
      this.player.body.setVelocity(0);
      this._wasInputBlocked = true;
      return;
    }
    if (this._wasInputBlocked) {
      this._wasInputBlocked = false;
      this.input?.keyboard?.resetKeys();
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

    const eJustPressed = this.keyE.isDown && !this.eWasDown;
    const spaceJustPressed = this.keySpace.isDown && !this.spaceWasDown;

    // --- Maila ---
    if (!this.batCollected && this.bat && this.bat.visible) {
      const distToBat = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.bat.x, this.bat.y
      );

      if (distToBat < 45) {
        this.batHint?.setVisible(true);
      } else {
        this.batHint?.setVisible(false);
      }
    } else if (this.batCollected) {
      this.updateHeldBat();
    }

    // --- Ovi ---
    if (!this.doorOpened && this.door) {
      const distToDoor = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.door.x, this.door.y
      );
      if (distToDoor < 70 && eJustPressed) {
        this.openDoor();
      }
    }

    // --- Poistuminen käytävään: pelkkä oven kohdalle käveleminen (ei E:tä) ---
    if (this.doorOpened && this.batCollected && !this.leaving) {
      const doorX = 1248;
      const doorY = 732;
      const distToExit = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, doorX, doorY
      );
      // Käytävään: kävele oven aukosta ulos (x > 38.5, rivi y22)
      const apX = this.player.x / 32;
      const apY = this.player.y / 32;
      if (!this.leaving && apX > 38.5 && apY > 20.05 && apY < 22.7) {
        this.leaving = true;
        this.requestSave();
        this.game.events.emit('game-event', { type: 'leave-to-corridor' });
      }
    }

    // --- Zombie ---
    if (this.zombie && this.zombieAlive) {
      this.updateZombie();
      if (spaceJustPressed && this.stats.canAttack()) {
        this.tryPunch();
      }
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

  tryCollectBat() {
    if (this.batCollected || !this.bat || !this.bat.visible) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.bat.x, this.bat.y
    );
    if (dist < 45) {
      this.collectBat();
    }
  }

  collectBat() {
    this.batCollected = true;
    this.stats.addItem('maila');
    this.bat.destroy();
    this.batShadow.destroy();
    this.batHint.destroy();

    this.heldBat.setVisible(true);
    this.playCollectSound();
    this.emitHint('Sait mailan! Lähde nyt ovesta käytäville.', 'success');

    this.emitStats();
    this.requestSave();
  }

  openDoor() {
    // Ovi vain avataan — EI tallenneta vielä.
    // Asunnon haaste on kesken kunnes zombie on tapettu.
    this.doorOpened = true;
    this.door.destroy();
    this.door = null;
    this.knockText?.destroy();
    this.knockText = null;
    this.playDoorSound();
    this.emitHint('');

    // Pysäytä oven koputus-ääni.
    if (this.knockSound) {
      this.knockSound.stop();
      this.knockSound.destroy();
      this.knockSound = null;
    }

    this.game.events.emit('game-event', { type: 'door-opening' });
  }

  startZombieFight() {
    this.cameras.main.flash(300, 120, 0, 0);
    this.spawnZombie();
  }

  spawnZombie() {
    // Zombie-frame on 480x480, hahmo alaosassa. Skaala 0.22 -> ~105px korkea.
    // Jalat ovat framessa ~y470, keskitetty x240. Skaalattuna jalat ovat
    // spriten y-keskipisteestä n. (470-240)*0.22 ≈ 50px alaspäin.
    const FEET_OFFSET = 33;

    const spawnX = Phaser.Math.Clamp(this.zombieSpawn.x, 40, 1240);
    const spawnY = Phaser.Math.Clamp(this.zombieSpawn.y, 40, 760) - FEET_OFFSET;

    this.zombieShadow = this.add.ellipse(spawnX, spawnY + FEET_OFFSET, 32, 12, 0x000000, 0.45);
    this.zombieShadow.setDepth(8);

    this.zombie = this.physics.add.sprite(spawnX, spawnY, 'zombie-idle', 0);
    this.zombie.setDepth(9);
    this.zombie.setScale(0.15);
    // Body framen alaosan jalkoihin (480px frame): x-keskellä ~225-255, y ~450-472
    this.zombie.body.setSize(70, 40);
    this.zombie.body.setOffset(205, 432);
    this.zombie.body.setCollideWorldBounds(true);
    this.zombie.anims.play('z-seiso', true);

    this.physics.add.collider(this.zombie, this.wallsLayer);
    this.physics.add.collider(this.zombie, this.furnitureLayer);

    this.zombieHP = 30;
    this.zombieAlive = true;

    this.zombieHPText = this.add.text(spawnX - 20, spawnY - 70, 'HP: 30', textStyles.hp)
      .setDepth(11);

    this.emitHint('Paina SPACE kun zombie on lähellä (paljain käsin!)', 'danger');

    this.game.events.emit('game-event', { type: 'zombie-spawned' });
  }

  updateZombie() {
    const dx = this.player.x - this.zombie.x;
    const dy = this.player.y - this.zombie.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const speed = 70;
      this.zombie.body.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }

    // Zombie katsoo aina kameraan päin; käännä vain vaakasuunnan mukaan
    this.zombie.setFlipX(dx < 0);

    const currentAnim = this.zombie.anims.currentAnim?.key;
    const isBusy = currentAnim === 'z-osuma' && this.zombie.anims.isPlaying;

    if (!isBusy) {
      if (dist < 45) {
        if (currentAnim !== 'z-hyokkaa' || !this.zombie.anims.isPlaying) {
          this.zombie.anims.play('z-hyokkaa', true);
        }
      } else {
        this.zombie.anims.play('z-kavele', true);
      }
    }

    this.zombieShadow.setPosition(this.zombie.x, this.zombie.y + 33);
    this.zombieHPText.setPosition(this.zombie.x - 20, this.zombie.y - 70);

    if (dist < 35) {
      this.stats.takeDamage(0.3);

      if (this.stats.isDead()) {
        this.handleGameOver();
      }
    }
  }

 tryPunch() {
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.zombie.x, this.zombie.y
    );

    // Isku-liike aina kun lyödään (vaikka ei osuisi)
    this.doPlayerAttackMotion();

    if (dist < 55) {
      this.stats.useAttackEnergy(this.time.now);

      const damage = Phaser.Math.Between(5, 12);
      this.zombieHP -= damage;
      this.zombieHPText.setText(`HP: ${Math.max(0, this.zombieHP)}`);

      // Zombie työntyy taaksepäin
      const dx = this.zombie.x - this.player.x;
      const dy = this.zombie.y - this.player.y;
      const dist2 = Math.sqrt(dx * dx + dy * dy) || 1;
      this.zombie.body.setVelocity((dx / dist2) * 200, (dy / dist2) * 200);

      // Osumaefekti zombieen
      this.hitZombieEffect();

      // TODO ääni: osuma-ääni tähän

      if (this.zombieHP > 0) {
        this.zombie.anims.play('z-osuma', true);
      }

      if (this.zombieHP <= 0) {
        this.killZombie();
      }
    }
  }

  // Pelaajan isku-liike: maila heilahtaa tai hahmo nytkähtää eteenpäin
  // ========== YHTEISET SFX-ÄÄNET (collect/door/level) ==========
  // ApartmentScene ei peri BaseSceneä, joten samat apumetodit tässä myös.
  playCollectSound() {
    if (this.cache.audio.exists('collect')) {
      const sfxMuted = this.registry.get('sfxMuted');
      const sfxVol = this.registry.get('sfxVolume');
      this.sound.play('collect', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }
  }

  playDoorSound() {
    if (this.cache.audio.exists('door')) {
      const sfxMuted = this.registry.get('sfxMuted');
      const sfxVol = this.registry.get('sfxVolume');
      this.sound.play('door', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }
  }

  playLevelSound() {
    if (this.cache.audio.exists('level')) {
      const sfxMuted = this.registry.get('sfxMuted');
      const sfxVol = this.registry.get('sfxVolume');
      this.sound.play('level', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }
  }

  doPlayerAttackMotion() {
    // Lyöntiääni (soi joka iskulla)
    if (this.cache.audio.exists('punch')) {
      const sfxMuted = this.registry.get('sfxMuted');
        const sfxVol = this.registry.get('sfxVolume');
        this.sound.play('punch', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }

    if (this.batCollected && this.heldBat) {
      // Maila heilahtaa kaarelle ja takaisin
      const dir = this.lastDirection;
      const swingFrom = {
        alas: 55, ylos: 235, vasen: 145, oikea: 35,
      }[dir];
      const swingTo = swingFrom - 90; // huitaisu

      this.tweens.killTweensOf(this.heldBat);
      this.heldBat.setAngle(swingFrom);
      this.tweens.add({
        targets: this.heldBat,
        angle: swingTo,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    } else {
      // Paljain käsin: hahmo nytkähtää zombieta kohti
      const dx = this.zombie.x - this.player.x;
      const dy = this.zombie.y - this.player.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const lungeX = this.player.x + (dx / len) * 12;
      const lungeY = this.player.y + (dy / len) * 12;

      this.tweens.add({
        targets: this.player,
        x: lungeX,
        y: lungeY,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeOut',
      });

      // Nyrkki-isku: pamaus-rengas osumakohtaan (ei asemainen viiva)
      const dxh = this.zombie.x - this.player.x;
      const dyh = this.zombie.y - this.player.y;
      const lenh = Math.sqrt(dxh * dxh + dyh * dyh) || 1;
      const hitX = this.player.x + (dxh / lenh) * 28;
      const hitY = this.player.y + (dyh / lenh) * 28;

      const impact = this.add.circle(hitX, hitY, 4, 0xffffff, 0.85);
      impact.setDepth(12);
      this.tweens.add({
        targets: impact,
        scale: 3,
        alpha: 0,
        duration: 180,
        ease: 'Quad.easeOut',
        onComplete: () => impact.destroy(),
      });
    }
  }

  // Osumaefekti zombieen: valkoinen välähdys + pieni nytkähdys
  hitZombieEffect() {
    if (!this.zombie) return;

    // Valkoinen välähdys (tint)
    this.zombie.setTint(0xffffff);
    this.zombie.tintFill = true;;
    this.zombie.tintFill = true;
    this.time.delayedCall(80, () => {
      if (this.zombie) this.zombie.clearTint();
    });

    // Nopea skaalanytkähdys
    const baseScale = 0.15;
    this.tweens.add({
      targets: this.zombie,
      scaleX: baseScale * 1.12,
      scaleY: baseScale * 0.9,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Veriroiske osumakohtaan
    const spray = this.add.graphics();
    spray.setDepth(11);
    spray.fillStyle(0x8a0000, 0.85);
    for (let i = 0; i < 5; i++) {
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const d = Phaser.Math.Between(4, 16);
      spray.fillCircle(
        this.zombie.x + Math.cos(a) * d,
        this.zombie.y - 20 + Math.sin(a) * d,
        Phaser.Math.Between(1, 3)
      );
    }
    this.tweens.add({
      targets: spray,
      alpha: 0,
      duration: 350,
      onComplete: () => spray.destroy(),
    });
  }

  killZombie() {
    this.zombieAlive = false;
    this.zombie.body.setVelocity(0, 0);
    this.zombie.anims.play('z-kuolee', true);
    this.zombieHPText.destroy();

    const dyingZombie = this.zombie;
    const dyingShadow = this.zombieShadow;
    const deathX = this.zombie.x;
    const deathY = this.zombie.y + 33;
    this.zombie = null;
    this.zombieShadow = null;

    this.time.delayedCall(500, () => {
      this.spawnBloodPool(deathX, deathY);
    });

    this.time.delayedCall(2000, () => {
      dyingZombie.destroy();
      dyingShadow.destroy();
    });

    const leveledUp = this.stats.registerKill();
    this.firstZombieKilled = true;
    if (leveledUp) {
      this.playLevelSound();
    }

    this.emitHint(leveledUp
      ? `Zombie kaatui. TASO NOUSI! Nyt taso ${this.stats.level}`
      : 'Zombie kaatui. Selvisit paljain käsin.',
      'success'
    );

    this.time.delayedCall(1500, () => {
      this.emitHint('Kuulet kaaosta käytäviltä... etsi maila makuuhuoneesta!', 'warning');
      if (this.bat) {
        this.bat.setVisible(true);
        this.batShadow?.setVisible(true);
      }
    });

    this.game.events.emit('game-event', { type: 'first-zombie-killed' });

    // Nyt haaste on selvitetty: tallennetaan
    this.emitStats();
    this.requestSave();
  }

  spawnBloodPool(x, y) {
    const pool = this.add.graphics();
    pool.setDepth(5);

    pool.fillStyle(0x6a0000, 0.85);
    pool.fillEllipse(x, y, 46, 22);

    pool.fillStyle(0x3a0000, 0.9);
    pool.fillEllipse(x - 3, y + 1, 26, 12);

    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(18, 34);
      const size = Phaser.Math.Between(3, 8);
      pool.fillStyle(0x5a0000, 0.7);
      pool.fillEllipse(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist * 0.45,
        size,
        size * 0.5
      );
    }

    pool.setAlpha(0);
    this.tweens.add({
      targets: pool,
      alpha: 1,
      duration: 900,
      ease: 'Quad.easeOut',
    });
  }

  handleGameOver() {
    this.scene.pause();
    this.game.events.emit('game-event', {
      type: 'game-over',
      stats: this.stats.getSnapshot(),
    });
  }
}
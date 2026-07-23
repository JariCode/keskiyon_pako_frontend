import Phaser from 'phaser';
import { textStyles } from '../textStyles';

const TILE = 32;

// Yhteinen perusluokka kaikille pelin kohtauksille.
// Sisältää jaetun koodin: hahmon animaatiot, taskulamppu/valokeila,
// pimeys, mailan pito, HP-viestit. Kohtaukset perivät tämän ja lisäävät
// vain oman sisältönsä (kartta, viholliset, esineet).
export default class BaseScene extends Phaser.Scene {
  // Pysäyttää pelaajan liikkeen välittömästi. Kutsutaan kun cutscene/reveal
  // käynnistyy (GameCanvas asettaa inputEnabled=false), jotta hahmo ei jää
  // "juuttuneena" juoksemaan sillä nopeudella/suunnalla mikä oli päällä
  // sillä hetkellä kun näppäin oli vielä pohjassa.
  stopPlayerMovement() {
    if (this.player?.body) {
      this.player.body.setVelocity(0);
    }
  }

  // Palauttaa true jos input on parhaillaan estetty (cutscene/reveal/profiili
  // yms., GameCanvas asettaa tämän registry-arvon inputEnabled-propin mukaan).
  // Scenet voivat kutsua tätä update()-metodinsa alussa: jos true, nollataan
  // liike JOKA framella eikä vain kerran, koska yksittäisten näppäinten
  // isDown-tila voi jäädä jumiin vaikka keyboard.enabled=false.
  isInputBlocked() {
    const blocked = this.registry?.get('inputEnabled') === false;
    // Havaitse siirtymä lukitusta -> auki: nollaa näppäinten isDown-tila
    // täsmälleen sillä framella kun input palautuu. Cutscenen aikana
    // keyboard.enabled oli false, joten näppäimen keyup ei rekisteröitynyt
    // ja cursors.left.isDown yms. saattoi jäädä true:ksi -> ilman tätä hahmo
    // jatkaisi kävelyä vaikka näppäin on jo vapautettu.
    if (this._wasInputBlocked && !blocked) {
      this.input?.keyboard?.resetKeys();
      this.stopPlayerMovement();
    }
    this._wasInputBlocked = blocked;
    return blocked;
  }

  updateFlashlight() {
    if (!this.flashlightOn || !this.darkGfx) return;

    const px = this.player.x;
    const py = this.player.y;
    const W = this.scale.width;
    const H = this.scale.height;

    const g = this.darkGfx;
    g.clear();
    g.fillStyle(0x000000, 0.97);

    const dirAngle = { ylos: -Math.PI / 2, alas: Math.PI / 2, vasen: Math.PI, oikea: 0 }[this.lastDirection];
    const near = 38;
    const beamLen = 250;
    const spread = 0.5;

    const maxR = Math.max(this.mapWidth || W, this.mapHeight || H) * 1.5;
    const N = 72;
    const step = (2 * Math.PI) / N;

    for (let i = 0; i < N; i++) {
      const a1 = i * step;
      const a2 = (i + 1) * step;
      const r1 = this.lightRadiusAt(a1, dirAngle, near, beamLen, spread);
      const r2 = this.lightRadiusAt(a2, dirAngle, near, beamLen, spread);
      g.beginPath();
      g.moveTo(px + Math.cos(a1) * r1, py + Math.sin(a1) * r1);
      g.lineTo(px + Math.cos(a1) * maxR, py + Math.sin(a1) * maxR);
      g.lineTo(px + Math.cos(a2) * maxR, py + Math.sin(a2) * maxR);
      g.lineTo(px + Math.cos(a2) * r2, py + Math.sin(a2) * r2);
      g.closePath();
      g.fillPath();
    }
  }

  lightRadiusAt(angle, dirAngle, near, beamLen, spread) {
    let d = angle - dirAngle;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    if (Math.abs(d) <= spread) {
      const edge = spread * 0.8;
      if (Math.abs(d) <= edge) return beamLen;
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
    const dirAngle = { ylos: -Math.PI / 2, alas: Math.PI / 2, vasen: Math.PI, oikea: 0 }[this.lastDirection];
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

    this.glowGfx = this.add.graphics();
    this.glowGfx.setScrollFactor(1);
    this.glowGfx.setDepth(7);
    this.glowGfx.setBlendMode(Phaser.BlendModes.ADD);

    this.darkGfx = this.add.graphics();
    this.darkGfx.setScrollFactor(1);
    this.darkGfx.setDepth(8);

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
    // Aukko vasemmalla (x10, y3-4). Portaikko täyttää sen, askelmat levenevät vasemmalle.
    const cx = 10 * TILE + TILE / 2;
    const cy = 3.5 * TILE;

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
      // peilattu: levenee vasemmalle (i kasvaa -> vasemmalle)
      const step = this.add.rectangle(w / 2 - stepW / 2 - i * stepW, 0, stepW - 1, h - i * 6, shade);
      step.setStrokeStyle(1, 0x0e0a06);
      g.add(step);
    }

    const glow = this.add.ellipse(-6, 0, w * 0.8, h * 0.7, 0x6688cc, 0.15);
    g.add(glow);

    this.stairsPos = { x: cx, y: cy };
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

  updateHeldBat() {
    const offsets = {
      alas:  { x: 8,  y: 18, angle: 55,  depth: 11 },
      ylos:  { x: -8, y: 14, angle: 235, depth: 9 },
      vasen: { x: -8, y: 18, angle: 145, depth: 11 },
      oikea: { x: 8,  y: 18, angle: 35,  depth: 11 },
    };
    const o = offsets[this.lastDirection];
    this.heldBat.setPosition(this.player.x + o.x, this.player.y + o.y);
    this.heldBat.setAngle(o.angle + (this.weaponSwing || 0));
    this.heldBat.setDepth(o.depth);
  }

  // ========== MAILAN HAJOAMINEN ==========
  // Maila hajoaa (esim. ensimmäisen zombien kaaduttua): häviää kädestä,
  // poistetaan inventorystä, pelaaja on taas paljain käsin.
  breakBat() {
    if (!this.batCollected) return;
    this.batCollected = false;
    this.stats.removeItem('maila');
    if (this.heldBat) {
      // pieni "sirpaloitumis"-välähdys ennen katoamista
      this.tweens.killTweensOf(this.heldBat);
      this.tweens.add({
        targets: this.heldBat,
        alpha: 0,
        angle: this.heldBat.angle + 120,
        duration: 260,
        ease: 'Quad.easeIn',
        onComplete: () => { this.heldBat?.setVisible(false); },
      });
    }
    this.playCrackSound();
    this.emitHint('Maila hajosi! Etsi uusi ase.', 'warning');
    this.emitStats();
  }

  // ========== KIRVES: LATTIALTA POIMITTAVA ASE ==========
  // Sama poimintalogiikka kuin pussilla/mailalla: E-näppäimellä lähellä.
  // Kirves seuraa hahmon kättä ja sillä voi lyödä (tryHitEnemies käyttää
  // heldWeaponia). Kutsu createAxe(x, y) scenen create()-metodista.
  createAxe(x, y) {
    this.axeX = x;
    this.axeY = y;
    this.axeTaken = this.stats.hasItem('kirves');

    // Kirves lattialla (kuva). Piilotettu jos jo poimittu.
    this.axePickup = this.add.image(x, y, 'kirves');
    this.axePickup.setDepth(6);
    this.axePickup.setScale(1.4);
    this.axePickup.setVisible(!this.axeTaken);

    // Kimallus (sama tyyli kuin pussilla)
    this.axeSparkle = this.add.graphics();
    this.axeSparkle.setDepth(7);
    this.axeSparkle.setVisible(!this.axeTaken);

    this.axeHint = this.add.text(x, y + 26, 'Ota kirves (E)', {
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

    // Kirves kädessä (piilossa kunnes poimittu). Sama origo/skaala kuin mailalla.
    this.heldAxe = this.add.image(0, 0, 'kirves');
    this.heldAxe.setOrigin(0.15, 0.5);
    this.heldAxe.setDepth(11);
    this.heldAxe.setScale(1.2);
    this.heldAxe.setVisible(this.axeTaken);
    if (this.axeTaken) this.axeCollected = true;
  }

  updateAxeSparkle(time) {
    if (!this.axeSparkle || this.axeTaken) return;
    const g = this.axeSparkle;
    g.clear();
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.axeX, this.axeY
    );
    const near = Phaser.Math.Clamp(1 - dist / 400, 0.25, 1);
    const pulse = 0.5 + 0.5 * Math.sin(time / 180);
    const cx = this.axeX;
    const cy = this.axeY - 14;
    const r = 10 + 10 * near * pulse;
    const w = 3 + 2 * near * pulse;
    g.fillStyle(0xfff2c0, 0.12 + 0.28 * near * pulse);
    g.fillCircle(cx, cy, r * 1.1);
    g.fillStyle(0xfff2c0, 0.18 + 0.32 * near * pulse);
    g.fillCircle(cx, cy, r * 0.6);
    const a = 0.6 + 0.4 * near * pulse;
    g.fillStyle(0xffffff, a);
    g.fillTriangle(cx, cy - r, cx - w, cy, cx + w, cy);
    g.fillTriangle(cx, cy + r, cx - w, cy, cx + w, cy);
    g.fillTriangle(cx - r, cy, cx, cy - w, cx, cy + w);
    g.fillTriangle(cx + r, cy, cx, cy - w, cx, cy + w);
    g.fillStyle(0xffffff, Math.min(1, a + 0.2));
    g.fillCircle(cx, cy, w * 0.9);
  }

  tryCollectAxe() {
    if (this.axeTaken || !this.axePickup) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.axeX, this.axeY
    );
    if (dist < 50) {
      this.collectAxe();
    }
  }

  collectAxe() {
    this.axeTaken = true;
    this.axeCollected = true;
    this.stats.addItem('kirves');
    this.axePickup?.destroy();
    this.axePickup = null;
    this.axeSparkle?.destroy();
    this.axeSparkle = null;
    this.axeHint?.destroy();
    this.axeHint = null;
    this.heldAxe?.setVisible(true);
    this.playCollectSound();
    this.emitHint('Sait kirveen! Hakkaa vihollisia (SPACE).', 'success');
    this.emitStats();

    const area = this.areaName || 'mokki';
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData(area, {
        ...(this.initialSave?.progress || {}),
      }),
    });
  }

  updateHeldAxe() {
    // Kirves on epäsymmetrinen (terän leikkaava reuna toisella puolella).
    // Kulmat ovat samat kuin mailalla, mutta oikea/alas-suunnissa terä
    // käännetään flipY:llä oikein päin (muuten leikkaava reuna osoittaa väärään
    // suuntaan).
    const offsets = {
      alas:  { x: 8,  y: 18, angle: 55,  depth: 11, flipY: true },
      ylos:  { x: -8, y: 14, angle: 235, depth: 9,  flipY: false },
      vasen: { x: -8, y: 18, angle: 145, depth: 11, flipY: false },
      oikea: { x: 8,  y: 18, angle: 35,  depth: 11, flipY: true },
    };
    const o = offsets[this.lastDirection];
    this.heldAxe.setPosition(this.player.x + o.x, this.player.y + o.y);
    this.heldAxe.setAngle(o.angle + (this.weaponSwing || 0));
    this.heldAxe.setFlipX(false);
    this.heldAxe.setFlipY(o.flipY);
    this.heldAxe.setDepth(o.depth);
  }

  createPouch(x, y) {
    this.pouchX = x;
    this.pouchY = y;

    // Pussi (säkkimäinen, tumma kangas + naru)
    this.pouch = this.add.container(x, y);
    this.pouch.setDepth(6);
    const body = this.add.ellipse(0, 4, 22, 24, 0x5a4a2a);
    body.setStrokeStyle(2, 0x3a2e18);
    const neck = this.add.rectangle(0, -9, 10, 8, 0x6a5836);
    const tie = this.add.rectangle(0, -12, 14, 3, 0x2a2216);
    this.pouch.add([body, neck, tie]);

    // Kimallus valokeilassa (pieni tähti/pilkku joka sykkii)
    this.pouchSparkle = this.add.graphics();
    this.pouchSparkle.setDepth(7);

    /// Vihjeteksti (kirkas, taustallinen, erottuu pimeästä)
    this.pouchHint = this.add.text(x, y + 26, 'Ota pussi (E)', {
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
  }

  updatePouchSparkle(time) {
    if (!this.pouchSparkle || this.pouchTaken) return;
    const g = this.pouchSparkle;
    g.clear();
    // Kimalluksen kirkkaus sykkii ja riippuu valokeilan suunnasta/etäisyydestä
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.pouchX, this.pouchY
    );
    const near = Phaser.Math.Clamp(1 - dist / 400, 0.25, 1);
    const pulse = 0.5 + 0.5 * Math.sin(time / 180);
    const cx = this.pouchX;
    const cy = this.pouchY - 14;
    const r = 10 + 10 * near * pulse;      // sakaran pituus
    const w = 3 + 2 * near * pulse;        // sakaran leveys

    // pehmeä hehku taustalle
    g.fillStyle(0xfff2c0, 0.12 + 0.28 * near * pulse);
    g.fillCircle(cx, cy, r * 1.1);
    g.fillStyle(0xfff2c0, 0.18 + 0.32 * near * pulse);
    g.fillCircle(cx, cy, r * 0.6);

    // neljä sakaraa (ylös, alas, vasen, oikea)
    const a = 0.6 + 0.4 * near * pulse;
    g.fillStyle(0xffffff, a);
    g.fillTriangle(cx, cy - r, cx - w, cy, cx + w, cy);      // ylös
    g.fillTriangle(cx, cy + r, cx - w, cy, cx + w, cy);      // alas
    g.fillTriangle(cx - r, cy, cx, cy - w, cx, cy + w);      // vasen
    g.fillTriangle(cx + r, cy, cx, cy - w, cx, cy + w);      // oikea
    g.fillStyle(0xffffff, Math.min(1, a + 0.2));
    g.fillCircle(cx, cy, w * 0.9);                            // kirkas keskus
  }

  tryCollectPouch() {
    if (this.pouchTaken || !this.pouch) return;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.pouchX, this.pouchY
    );
    if (dist < 50) {
      this.collectPouch();
    }
  }

  collectPouch() {
    this.pouchTaken = true;
    this.pouch.destroy();
    this.pouch = null;
    this.pouchSparkle?.destroy();
    this.pouchSparkle = null;
    this.pouchHint?.destroy();
    this.pouchHint = null;

    this.stats.heal(this.stats.maxHP);
    this.playCollectSound();
    this.emitHint('Löysit lääkintätarvikkeita! Terveys palautui täyteen.', 'success');
    this.emitStats();

    const area = this.areaName || 'aula';
    this.game.events.emit('game-event', {
      type: 'request-save',
      save: this.stats.getSaveData(area, {
        ...(this.initialSave?.progress || {}),
        [`pouchTaken_${area}`]: true,
      }),
    });
  }

  // Onko TÄMÄN alueen pussi jo otettu? (aluekohtainen lippu progressissa)
  isPouchTaken() {
    const area = this.areaName || 'aula';
    return !!(this.initialSave?.progress?.[`pouchTaken_${area}`]);
  }

  // ========== YLEINEN VIHOLLISSYSTEEMI ==========
  // Vihollistyyppien määrittelyt. Lisää uusi tyyppi tähän:
  // sheetit (walk/attack/hurt/dead/idle), frameWidth/Height, scale, hp, speed.
  static ENEMY_TYPES = {
    mies: {
      sheets: {
        idle:   { key: 'z-mies-idle',   file: 'zombie-idle.png',   frames: 4 },
        walk:   { key: 'z-mies-walk',   file: 'zombie-walk.png',   frames: 6 },
        attack: { key: 'z-mies-attack', file: 'zombie-attack.png', frames: 6 },
        hurt:   { key: 'z-mies-hurt',   file: 'zombie-hurt.png',   frames: 5 },
        dead:   { key: 'z-mies-dead',   file: 'zombie-dead.png',   frames: 8 },
      },
      frameWidth: 480, frameHeight: 480,
      scale: 0.16, hp: 65, speed: 50,
      bodySize: [90, 120], bodyOffset: [195, 260],
      shadow: [60, 20, 40], hpOffset: -70,
    },
    nainen: {
      sheets: {
        idle:   { key: 'z-nainen-idle',   file: 'zombie-woman-idle.png',   frames: 4 },
        walk:   { key: 'z-nainen-walk',   file: 'zombie-woman-walk.png',   frames: 6 },
        attack: { key: 'z-nainen-attack', file: 'zombie-woman-attack.png', frames: 6 },
        hurt:   { key: 'z-nainen-hurt',   file: 'zombie-woman-hurt.png',   frames: 5 },
        dead:   { key: 'z-nainen-dead',   file: 'zombie-woman-dead.png',   frames: 8 },
      },
      frameWidth: 32, frameHeight: 32,
      scale: 2.2, hp: 55, speed: 60,
      bodySize: [16, 14], bodyOffset: [8, 16],
      shadow: [34, 13, 22], hpOffset: -75,
  },
    cabinZombie: {
      sheets: {
        idle:   { key: 'z-cabin-zombie-idle',   file: 'zombie2-idle.png',   frames: 4 },
        walk:   { key: 'z-cabin-zombie-walk',   file: 'zombie2-walk.png',   frames: 6 },
        attack: { key: 'z-cabin-zombie-attack', file: 'zombie2-attack.png', frames: 6 },
        hurt:   { key: 'z-cabin-zombie-hurt',   file: 'zombie2-hurt.png',   frames: 5 },
        dead:   { key: 'z-cabin-zombie-dead',   file: 'zombie2-dead.png',   frames: 8 },
      },
      frameWidth: 64, frameHeight: 64,
      scale: 1, hp: 65, speed: 55,
      bodySize: [32, 28], bodyOffset: [16, 32],
      shadow: [34, 13, 22], hpOffset: -75,
    },
    mohikaani: {
      sheets: {
        idle:   { key: 'z-mohikaani-idle',   file: 'zombie3-idle.png',   frames: 4 },
        walk:   { key: 'z-mohikaani-walk',   file: 'zombie3-walk.png',   frames: 6 },
        attack: { key: 'z-mohikaani-attack', file: 'zombie3-attack.png', frames: 6 },
        hurt:   { key: 'z-mohikaani-hurt',   file: 'zombie3-hurt.png',   frames: 5 },
        dead:   { key: 'z-mohikaani-dead',   file: 'zombie3-dead.png',   frames: 8 },
      },
      frameWidth: 64, frameHeight: 64,
      scale: 1, hp: 75, speed: 50,
      bodySize: [32, 28], bodyOffset: [16, 32],
      shadow: [34, 13, 22], hpOffset: -75,
    },
    tytto: {
      sheets: {
        idle:   { key: 'z-tytto-idle',   file: 'zombie4-idle.png',   frames: 4 },
        walk:   { key: 'z-tytto-walk',   file: 'zombie4-walk.png',   frames: 6 },
        attack: { key: 'z-tytto-attack', file: 'zombie4-attack.png', frames: 6 },
        hurt:   { key: 'z-tytto-hurt',   file: 'zombie4-hurt.png',   frames: 5 },
        dead:   { key: 'z-tytto-dead',   file: 'zombie4-dead.png',   frames: 8 },
      },
      frameWidth: 64, frameHeight: 64,
      scale: 1, hp: 45, speed: 60,
      bodySize: [32, 28], bodyOffset: [16, 32],
      shadow: [34, 13, 22], hpOffset: -75,
    },
    miniZombie: {
      sheets: {
        idle:   { key: 'z-mini-idle',   file: 'miniZombie-idle.png',   frames: 12 },
        walk:   { key: 'z-mini-walk',   file: 'miniZombie-walk.png',   frames: 8 },
        attack: { key: 'z-mini-attack', file: 'miniZombie-attack.png', frames: 12 },
        hurt:   { key: 'z-mini-hurt',   file: 'miniZombie-hurt.png',   frames: 8 },
        dead:   { key: 'z-mini-dead',   file: 'miniZombie-dead.png',   frames: 8 },
      },
      frameWidth: 64, frameHeight: 64,
      scale: 0.5, hp: 35, speed: 75,
      bodySize: [15, 13], bodyOffset: [7, 15],
      shadow: [15, 6, 10], hpOffset: -75,
    },
  
  };

  // Lataa yhden vihollistyypin spritesheetit (kutsu scenen preloadista)
  loadEnemyType(type) {
    const def = BaseScene.ENEMY_TYPES[type];
    if (!def) return;
    for (const anim of Object.values(def.sheets)) {
      this.load.spritesheet(anim.key, '/assets/spritesheets/' + anim.file, {
        frameWidth: def.frameWidth,
        frameHeight: def.frameHeight,
      });
    }
  }

  // Luo animaatiot vihollistyypille (kutsutaan automaattisesti spawnissa)
  createEnemyAnimations(type) {
    const def = BaseScene.ENEMY_TYPES[type];
    if (!def || this.anims.exists(`${type}-walk`)) return;
    const s = def.sheets;
    this.anims.create({ key: `${type}-idle`,   frames: this.anims.generateFrameNumbers(s.idle.key,   { start: 0, end: s.idle.frames - 1 }),   frameRate: 5,  repeat: -1 });
    this.anims.create({ key: `${type}-walk`,   frames: this.anims.generateFrameNumbers(s.walk.key,   { start: 0, end: s.walk.frames - 1 }),   frameRate: 8,  repeat: -1 });
    this.anims.create({ key: `${type}-attack`, frames: this.anims.generateFrameNumbers(s.attack.key, { start: 0, end: s.attack.frames - 1 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: `${type}-hurt`,   frames: this.anims.generateFrameNumbers(s.hurt.key,   { start: 0, end: s.hurt.frames - 1 }),   frameRate: 14, repeat: 0 });
    this.anims.create({ key: `${type}-dead`,   frames: this.anims.generateFrameNumbers(s.dead.key,   { start: 0, end: s.dead.frames - 1 }),   frameRate: 10, repeat: 0 });
  }

  // Spawnaa vihollinen. type = 'mies' jne, tileX/tileY = ruutukoordinaatit.
  spawnEnemy(type, tileX, tileY) {
    if (!this.enemies) this.enemies = [];
    const def = BaseScene.ENEMY_TYPES[type];
    if (!def) return;
    this.createEnemyAnimations(type);

    const x = tileX * TILE;
    const y = tileY * TILE;

    const shadow = this.add.ellipse(x, y + def.shadow[2], def.shadow[0], def.shadow[1], 0x000000, 0.4);
    shadow.setDepth(6);

    const sprite = this.physics.add.sprite(x, y, def.sheets.idle.key, 0);
    sprite.setDepth(7);
    sprite.setScale(def.scale);
    sprite.body.setSize(def.bodySize[0], def.bodySize[1]);
    sprite.body.setOffset(def.bodyOffset[0], def.bodyOffset[1]);
    sprite.anims.play(`${type}-walk`, true);

    const hpText = this.add.text(x - 20, y + def.hpOffset, `HP: ${def.hp}`, textStyles.danger).setDepth(12);

    const enemy = {
      type, sprite, shadow, hpText,
      hp: def.hp, maxHp: def.hp, alive: true,
      speed: def.speed, def,
    };
    // Törmäykset esteisiin (scene asettaa this.obstacles)
    if (this.obstacles) {
      for (const layer of this.obstacles) {
        if (layer) this.physics.add.collider(sprite, layer);
      }
    }
    this.enemies.push(enemy);
    this.emitHint('Vihollinen lähestyy! Hakkaa se mailalla (SPACE).', 'danger');
    return enemy;
  }

  // Päivitä kaikki viholliset (kutsu update-metodista)
  updateEnemies() {
    if (!this.enemies) return;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = this.player.x - e.sprite.x;
      const dy = this.player.y - e.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        e.sprite.body.setVelocity((dx / dist) * e.speed, (dy / dist) * e.speed);
      }
      e.sprite.setFlipX(dx < 0);
      const anim = e.sprite.anims.currentAnim?.key;
      const busy = anim === `${e.type}-hurt` && e.sprite.anims.isPlaying;
      if (!busy) {
        e.sprite.anims.play(dist < 50 ? `${e.type}-attack` : `${e.type}-walk`, true);
      }
      e.shadow.setPosition(e.sprite.x, e.sprite.y + e.def.shadow[2]);
      e.hpText.setPosition(e.sprite.x - 20, e.sprite.y + e.def.hpOffset);
      if (dist < 36) {
        this.stats.takeDamage(0.3);
        if (this.stats.isDead()) this.handleGameOver();
      }
    }
  }

  // Yritä lyödä lähintä vihollista (kutsu kun SPACE painettu)
  tryHitEnemies() {
    if (!this.enemies) return;
    let closest = null, cd = Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y);
      if (d < cd) { cd = d; closest = e; }
    }
    if (!closest) return;
    this.doPlayerAttackMotion(closest.sprite);
    if (cd < 70) {
      this.stats.useAttackEnergy(this.time.now);
      const damage = Phaser.Math.Between(7, 14);
      closest.hp -= damage;
      closest.hpText.setText(`HP: ${Math.max(0, closest.hp)}`);
      const dx = closest.sprite.x - this.player.x;
      const dy = closest.sprite.y - this.player.y;
      const d2 = Math.sqrt(dx * dx + dy * dy) || 1;
      closest.sprite.body.setVelocity((dx / d2) * 180, (dy / d2) * 180);
      if (closest.hp > 0) {
        closest.sprite.anims.play(`${closest.type}-hurt`, true);
      } else {
        this.killEnemy(closest);
      }
    }
  }

  killEnemy(e) {
    if (!e.alive) return;
    e.alive = false;
    const deathX = e.sprite.x;
    const deathY = e.sprite.y + 20;
    e.sprite.body.setVelocity(0, 0);
    e.hpText.destroy();
    this.spawnBloodPool(deathX, deathY);
    // dead-animaatio, sitten häivytys
    e.sprite.anims.play(`${e.type}-dead`, true);
    e.sprite.once('animationcomplete', () => {
      this.tweens.add({
        targets: [e.sprite, e.shadow],
        alpha: 0, duration: 600, ease: 'Quad.easeIn',
        onComplete: () => { e.sprite.destroy(); e.shadow.destroy(); },
      });
    });
    const leveledUp = this.stats.registerKill();
    if (leveledUp) {
      this.playLevelSound();
    }
    this.emitHint('Vihollinen kaatui.', 'success');
    this.emitStats();
  }

  doPlayerAttackMotion(target) {
    const dir = this.lastDirection;
    // Lyöntiääni (soi joka iskulla). Turvallinen: ei kaadu jos ääntä ei ladattu.
    if (this.cache.audio.exists('punch')) {
      const sfxMuted = this.registry.get('sfxMuted');
        const sfxVol = this.registry.get('sfxVolume');
        this.sound.play('punch', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }
    if (target) {
      const dx = target.x - this.player.x;
      const dy = target.y - this.player.y;
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
    // Heilauta aktiivista asetta: kirves jos se on kädessä, muuten maila.
    // Tweenataan this.weaponSwing-lukua (ei suoraan weapon.anglea), koska
    // updateHeldBat/updateHeldAxe asettavat suuntakulman joka framella —
    // ne lisäävät tämän offsetin siihen sen sijaan että ylikirjoittaisivat sen.
    const weapon = (this.axeCollected && this.heldAxe) ? this.heldAxe : this.heldBat;
    if (weapon) {
      this.tweens.killTweensOf(this);
      this.weaponSwing = 0;
      this.tweens.add({
        targets: this,
        weaponSwing: -90,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => { this.weaponSwing = 0; },
      });
    }
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
    this.tweens.add({ targets: slash, alpha: 0, duration: 160, onComplete: () => slash.destroy() });
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

  // ========== YHTEISET SFX-ÄÄNET (collect/door/level) ==========
  // Jokainen scene lataa nämä preloadissa: this.load.audio('collect', ...) jne.
  // Turvallinen: ei kaadu jos ääntä ei ladattu.
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

  playCrackSound() {
    if (this.cache.audio.exists('crack')) {
      const sfxMuted = this.registry.get('sfxMuted');
      const sfxVol = this.registry.get('sfxVolume');
      this.sound.play('crack', { volume: sfxMuted ? 0 : (sfxVol ?? 1) });
    }
  }

  emitHint(text, kind = 'hint') {
    this.game.events.emit('game-event', { type: 'hint', text, kind });
  }

  // DEBUG: tulostaa hahmon ruutukoordinaatit konsoliin (poista kun valmis)
  logPlayerPos(time) {
    if (!this.player) return;
    if (!this._lastLog || time - this._lastLog > 400) {
      this._lastLog = time;
      const tx = (this.player.x / TILE).toFixed(1);
      const ty = (this.player.y / TILE).toFixed(1);
      console.log(`[${this.scene.key}] hahmo: x=${tx} y=${ty}  (px ${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
    }
  }//Debub LOPPUU. POISTA kun peli valmis

  emitStats() {
    const snap = this.stats.getSnapshot();
    const json = JSON.stringify(snap);
    if (json === this.lastStatsJson) return;
    this.lastStatsJson = json;
    this.game.events.emit('game-event', { type: 'stats-update', stats: snap });
  }
}
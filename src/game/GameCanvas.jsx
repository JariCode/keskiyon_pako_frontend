import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import ApartmentScene from './scenes/ApartmentScene';
import KaytavaScene from './scenes/KaytavaScene';
import AulaScene from './scenes/AulaScene';
import KaupunkiScene from './scenes/KaupunkiScene';
import MetsaScene from './scenes/MetsaScene';
import MokkiScene from './scenes/MokkiScene';
import HautausmaaScene from './scenes/HautausmaaScene';
import KatakombiScene from './scenes/KatakombiScene';
import './GameCanvas.css';

export default function GameCanvas({
  onGameEvent,
  inputEnabled = true,
  triggerZombieFight = false,
  restartKey = 0,
  gotoScene = null,
  sceneNonce = 0,
  sceneSpawn = 'asunto',
  darknessDoneSignal = 0,
  getSave = () => null,
  sfxVolume = 0.5,
  sfxMuted = false,
}) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const getSaveRef = useRef(getSave);
  const currentSceneRef = useRef('ApartmentScene');

  useEffect(() => {
    getSaveRef.current = getSave;
  }, [getSave]);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 800,
      parent: containerRef.current,
      backgroundColor: '#0a0a0a',
      // pixelArt: NEAREST-suodatus (ei reunojen sekoitusta) + roundPixels:
      // kamera/spritet kokonaisiin pikseleihin -> poistaa tiilirajojen
      // vilkkuvat viivat (texture bleeding) kun kamera liikkuu.
      pixelArt: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: [],
    };

    gameRef.current = new Phaser.Game(config);
    gameRef.current.registry.set('inputEnabled', true);
    gameRef.current.registry.set('sfxVolume', sfxVolume);
    gameRef.current.registry.set('sfxMuted', sfxMuted);

    gameRef.current.events.on('game-event', (payload) => {
      onGameEvent?.(payload);
    });

    // Lisää molemmat scenet ilman autostarttia
    gameRef.current.scene.add('ApartmentScene', ApartmentScene, false);
    gameRef.current.scene.add('KaytavaScene', KaytavaScene, false);
    gameRef.current.scene.add('AulaScene', AulaScene, false);
    gameRef.current.scene.add('KaupunkiScene', KaupunkiScene, false);
    gameRef.current.scene.add('MetsaScene', MetsaScene, false);
    gameRef.current.scene.add('MokkiScene', MokkiScene, false);
    gameRef.current.scene.add('HautausmaaScene', HautausmaaScene, false);
    gameRef.current.scene.add('KatakombiScene', KatakombiScene, false);

    // Käynnistä oikea scene tallennuksen currentArea-kentän mukaan
    const save = getSaveRef.current();
    const areaToScene = {
      asunto: 'ApartmentScene',
      kaytava: 'KaytavaScene',
      aula: 'AulaScene',
      kaupunki: 'KaupunkiScene',
      metsa: 'MetsaScene',
      mokki: 'MokkiScene',
      hautausmaa: 'HautausmaaScene',
      katakombi: 'KatakombiScene',
    };
    const startScene = areaToScene[save?.currentArea] || 'ApartmentScene';
    currentSceneRef.current = startScene;
    gameRef.current.scene.start(startScene, { save });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onGameEvent]);

  useEffect(() => {
    const keyboard = gameRef.current?.input?.keyboard;
    if (!keyboard) return;

    // Rekisteriin merkintä: scenet voivat tarkistaa tämän omassa update()-
    // metodissaan ja pitää pelaajan liikkumattomana koko ajan kun input on
    // pois päältä (cutscene/reveal/profiili), riippumatta siitä missä
    // tilassa yksittäisten näppäinten isDown-liput sattuvat olemaan.
    gameRef.current?.registry?.set('inputEnabled', inputEnabled);

    if (inputEnabled) {
      keyboard.enabled = true;
      keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'SHIFT', 'E']);
    } else {
      keyboard.enabled = false;
      keyboard.clearCaptures();

      // Pysäytä pelaajan liike heti myös tällä framella (ei vasta seuraavalla
      // scenen update()-kutsulla).
      const activeScene = gameRef.current?.scene?.getScene(currentSceneRef.current);
      activeScene?.stopPlayerMovement?.();
    }
  }, [inputEnabled]);

  // Päivitä ääniefektien asetukset rekisteriin (scenet lukevat nämä
  // sound.play-kutsuissa). Ei vaadi scenen uudelleenlatausta.
  useEffect(() => {
    gameRef.current?.registry?.set('sfxVolume', sfxVolume);
    gameRef.current?.registry?.set('sfxMuted', sfxMuted);
  }, [sfxVolume, sfxMuted]);

  useEffect(() => {
    if (!triggerZombieFight) return;
    const scene = gameRef.current?.scene?.getScene('ApartmentScene');
    scene?.startZombieFight?.();
  }, [triggerZombieFight]);

  // --- Scenen vaihto (asunto -> käytävä jne.) ---
  useEffect(() => {
    if (sceneNonce === 0 || !gotoScene) return;
    const manager = gameRef.current?.scene;
    if (!manager) return;

    const save = getSaveRef.current();
    manager.stop(currentSceneRef.current);
    manager.start(gotoScene, { save, spawn: sceneSpawn });
    currentSceneRef.current = gotoScene;
  }, [sceneNonce]);

  // --- Käynnistä nykyinen scene uudelleen kuoleman jälkeen ---
  useEffect(() => {
    if (restartKey === 0) return;
    const manager = gameRef.current?.scene;
    if (manager) {
      const save = getSaveRef.current();
      manager.stop(currentSceneRef.current);
      manager.start(currentSceneRef.current, { save });
    }
  }, [restartKey]);

  useEffect(() => {
    if (darknessDoneSignal === 0) return;
    gameRef.current?.events.emit('corridor-darkness-start');
  }, [darknessDoneSignal]);

  return <div className="game-container" ref={containerRef} />;
}
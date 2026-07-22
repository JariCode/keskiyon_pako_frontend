import { useState, useEffect, useRef } from 'react';
import './IntroCutscene.css';

const SCENES = [
  {
    visual: 'room',
    tv: 'YLE UUTISET',
    text: 'Kello on 23:47. Olet nukahtanut sohvalle television ääneen.',
  },
  {
    visual: 'room',
    tv: 'HÄTÄTIEDOTE',
    text: '"...pysykää sisätiloissa. Lukitkaa ovet. Älkää päästäkö ketään sisään..."',
  },
  {
    visual: 'window',
    text: 'Ulkoa kantautuu huutoa. Sireenit ulvovat. Taivas palaa oranssina.',
  },
  {
    visual: 'window',
    text: 'Kadulla liikkuu ihmisiä. Ne eivät kävele oikein.',
  },
  {
    visual: 'door',
    text: 'Sitten kuulet sen. Ovea hakataan. Hitaasti. Raskaasti.',
  },
  {
    visual: 'door',
    text: 'Se ei lopu.',
  },
];

const TYPE_SPEED = 45;
const SCENE_PAUSE = 2200;

export default function IntroCutscene({ onComplete, sfxVolume = 1 }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const knockRef = useRef(null);

  const scene = SCENES[sceneIndex];

  // Oven koputus: alkaa kun ovi-scene tulee (indeksi 4), luuppaa (tiedosto
  // lyhyt), ja loppuu kun intro poistuu (loppuu tai skipataan).
  useEffect(() => {
    if (sceneIndex >= 4 && !knockRef.current) {
      const audio = new Audio('/assets/sfx/knocking.mp3');
      audio.loop = true;
      audio.volume = 0.6 * sfxVolume;
      audio.play().catch(() => {});
      knockRef.current = audio;
    }
  }, [sceneIndex]);

  // Pysäytä koputus kun komponentti poistuu (intro loppuu / skip).
  useEffect(() => {
    return () => {
      if (knockRef.current) {
        knockRef.current.pause();
        knockRef.current.currentTime = 0;
        knockRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setTyped('');
    setDone(false);
    let i = 0;

    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(scene.text.slice(0, i));

      if (i >= scene.text.length) {
        clearInterval(typeTimer);
        setDone(true);
      }
    }, TYPE_SPEED);

    return () => clearInterval(typeTimer);
  }, [sceneIndex, scene.text]);

  useEffect(() => {
    if (!done) return;

    timerRef.current = setTimeout(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex((i) => i + 1);
      } else {
        onComplete();
      }
    }, SCENE_PAUSE);

    return () => clearTimeout(timerRef.current);
  }, [done, sceneIndex, onComplete]);

  const handleSkip = () => {
    clearTimeout(timerRef.current);
    onComplete();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="cutscene" onClick={handleSkip}>
      <div className="scene" key={sceneIndex}>
        {scene.visual === 'room' && (
          <div className="room-scene">
            <div className="room-glow" />
            <div className="tv-set">
              <div className="tv-screen-inner">
                <div className="tv-static" />
                <div className="tv-content">{scene.tv}</div>
                <div className="tv-scanline" />
              </div>
            </div>
            <div className="couch" />
          </div>
        )}

        {scene.visual === 'window' && (
          <div className="window-scene">
            <div className="window-outer">
              <div className="skyline">
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
              <div className="street" />
              <div className="fire-glow" />
              <div className="smoke" />
              <div className="figures">
                <b /><b /><b /><b /><b />
              </div>
            </div>
          </div>
        )}

        {scene.visual === 'door' && (
          <div className="door-scene">
            <div className="door-frame">
              <div className="door-panel">
                <div className="door-handle" />
                <div className="door-light" />
              </div>
              <div className="door-shadow" />
              <div className="door-impact" />
            </div>
          </div>
        )}
      </div>

      <div className="cutscene-vignette" />

      <div className="scene-text-wrap">
        <p className="scene-text">
          {typed}
          {!done && <span className="cursor" />}
        </p>
      </div>

      <div className="skip-hint">Klikkaa tai paina väliyöntiä ohittaaksesi</div>
    </div>
  );
}
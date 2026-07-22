import { useState, useEffect, useRef } from 'react';
import './TiesulkuReveal.css';

function RoadblockScene() {
  return (
    <svg className="tiesulku-svg" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a14" />
          <stop offset="100%" stopColor="#1a0e12" />
        </linearGradient>
        <linearGradient id="tsBuilding" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14141c" />
          <stop offset="100%" stopColor="#0a0a10" />
        </linearGradient>
        <linearGradient id="tsForest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1712" />
          <stop offset="100%" stopColor="#05100a" />
        </linearGradient>
        {/* Panssarin metalli */}
        <linearGradient id="tsHull" x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#3a4030" />
          <stop offset="55%" stopColor="#242a1a" />
          <stop offset="100%" stopColor="#10130a" />
        </linearGradient>
        <linearGradient id="tsTurret" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#434a34" />
          <stop offset="60%" stopColor="#2a3020" />
          <stop offset="100%" stopColor="#151810" />
        </linearGradient>
        <linearGradient id="tsBarrel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a5038" />
          <stop offset="50%" stopColor="#2c3220" />
          <stop offset="100%" stopColor="#12160c" />
        </linearGradient>
        {/* Valonheittimen keila */}
        <radialGradient id="tsSpot" cx="0.5" cy="0.05">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%" stopColor="#fff8e0" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#ffe89a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffe89a" stopOpacity="0" />
        </radialGradient>
        {/* Tykin suuaukko: musta keskusta, valoreunus */}
        <radialGradient id="tsMuzzle" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#050705" />
          <stop offset="60%" stopColor="#0a0d07" />
          <stop offset="85%" stopColor="#2c3220" />
          <stop offset="100%" stopColor="#4a5038" />
        </radialGradient>
        {/* Sotilaan varusteet */}
        <linearGradient id="tsUniform" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#242a18" />
          <stop offset="100%" stopColor="#0e120a" />
        </linearGradient>
        <filter id="tsGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tsSoftShade">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect x="0" y="0" width="640" height="400" fill="url(#tsSky)" />

      {/* ===== KAUPUNKI TAUSTALLA (siluetit + ikkunat) ===== */}
      <g className="ts-buildings">
        <rect x="8" y="118" width="72" height="202" fill="url(#tsBuilding)" />
        <rect x="88" y="76" width="62" height="244" fill="url(#tsBuilding)" />
        <rect x="158" y="138" width="84" height="182" fill="url(#tsBuilding)" />
        <rect x="250" y="98" width="56" height="222" fill="url(#tsBuilding)" />
        <rect x="314" y="150" width="72" height="170" fill="url(#tsBuilding)" />
        {/* ikkunavaloja */}
        <rect x="24" y="150" width="7" height="9" fill="#ffcc66" opacity="0.55" />
        <rect x="24" y="180" width="7" height="9" fill="#ffaa44" opacity="0.35" />
        <rect x="104" y="118" width="7" height="9" fill="#ffcc66" opacity="0.5" />
        <rect x="104" y="150" width="7" height="9" fill="#ffcc66" opacity="0.3" />
        <rect x="182" y="168" width="7" height="9" fill="#ffaa44" opacity="0.4" />
        <rect x="266" y="128" width="7" height="9" fill="#ffcc66" opacity="0.5" />
        <rect x="338" y="180" width="7" height="9" fill="#ffaa44" opacity="0.45" />
      </g>

      {/* ===== METSÄ OIKEALLA (minne peli ohjaa) ===== */}
      <g className="ts-forest">
        <rect x="466" y="0" width="174" height="400" fill="url(#tsForest)" />
        <path d="M466 400 L466 118 Q486 86 502 118 Q512 76 532 112 Q552 66 574 108 Q594 82 610 118 Q626 92 640 122 L640 400 Z" fill="#071410" />
        {/* puiden latvoja */}
        <ellipse cx="522" cy="64" rx="16" ry="22" fill="#0a1712" opacity="0.9" />
        <ellipse cx="566" cy="52" rx="18" ry="26" fill="#081510" opacity="0.9" />
        <ellipse cx="610" cy="70" rx="17" ry="24" fill="#0a1712" opacity="0.9" />
        {/* rungot */}
        <rect x="519" y="80" width="6" height="40" fill="#0a0f0a" opacity="0.7" />
        <rect x="563" y="72" width="7" height="48" fill="#080c08" opacity="0.7" />
      </g>

      {/* Kävelytie metsään (hohtaa – peli ohjaa tänne) */}
      <path className="ts-path-glow" d="M452 400 L482 220 L516 156 L548 100" stroke="#8a8a5a" strokeWidth="5" fill="none" opacity="0.4" strokeLinecap="round" filter="url(#tsGlow)" />
      <path className="ts-path" d="M452 400 L482 220 L516 156 L548 100" stroke="#3c3c28" strokeWidth="18" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* ===== KATU ===== */}
      <rect x="0" y="318" width="640" height="82" fill="#0c0c10" />
      <rect x="0" y="354" width="640" height="4" fill="#2a2a1a" opacity="0.4" />
      <rect x="40" y="376" width="34" height="4" fill="#2a2a1a" opacity="0.3" />
      <rect x="120" y="376" width="34" height="4" fill="#2a2a1a" opacity="0.3" />

      {/* Tankkien valonheittimet: keilat suuntautuvat katsojaan (alas eteen), häikäisevät */}
      <ellipse className="ts-beam ts-beam1" cx="158" cy="400" rx="150" ry="200" fill="url(#tsSpot)" />
      <ellipse className="ts-beam ts-beam2" cx="356" cy="400" rx="150" ry="210" fill="url(#tsSpot)" />

      {/* ===== PANSSARIVAUNU 1 (vasen) ===== */}
      <g className="ts-tanks">
        <g transform="translate(96 226)">
          {/* varjo */}
          <ellipse cx="62" cy="80" rx="72" ry="10" fill="#000" opacity="0.4" filter="url(#tsSoftShade)" />
          {/* telaketju */}
          <rect x="4" y="56" width="116" height="20" rx="10" fill="#0a0c07" />
          <rect x="4" y="56" width="116" height="20" rx="10" fill="none" stroke="#1c2012" strokeWidth="2" />
          <circle cx="20" cy="66" r="10" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="44" cy="66" r="10" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="70" cy="66" r="10" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="96" cy="66" r="10" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          {/* runko */}
          <path d="M2 56 L14 30 L110 30 L122 56 Z" fill="url(#tsHull)" stroke="#0c0f07" strokeWidth="1.5" />
          <rect x="10" y="42" width="104" height="4" fill="#0e120a" opacity="0.6" />
          {/* torni */}
          <path d="M40 30 L46 10 L86 10 L94 30 Z" fill="url(#tsTurret)" stroke="#0c0f07" strokeWidth="1.5" />
          <ellipse cx="66" cy="12" rx="14" ry="4" fill="#3a4030" opacity="0.6" />
          {/* tykin putki KOHTI KATSOJAA: lyhyt paksu putki + iso suuaukko edessä */}
          <ellipse cx="66" cy="30" rx="15" ry="8" fill="#1a1e12" />
          <path d="M52 30 L46 58 L86 58 L80 30 Z" fill="url(#tsBarrel)" stroke="#0c0f07" strokeWidth="1" />
          <ellipse cx="66" cy="58" rx="21" ry="12" fill="url(#tsMuzzle)" stroke="#0c0f07" strokeWidth="1.5" />
          <ellipse cx="66" cy="57" rx="11" ry="6" fill="#050705" />
        </g>

        {/* ===== PANSSARIVAUNU 2 (oikea, isompi/lähempänä) ===== */}
        <g transform="translate(280 240)">
          <ellipse cx="72" cy="92" rx="84" ry="12" fill="#000" opacity="0.4" filter="url(#tsSoftShade)" />
          <rect x="4" y="64" width="136" height="24" rx="12" fill="#0a0c07" />
          <rect x="4" y="64" width="136" height="24" rx="12" fill="none" stroke="#1c2012" strokeWidth="2" />
          <circle cx="24" cy="76" r="12" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="52" cy="76" r="12" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="82" cy="76" r="12" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <circle cx="112" cy="76" r="12" fill="#161a10" stroke="#242a16" strokeWidth="2" />
          <path d="M2 64 L16 34 L128 34 L142 64 Z" fill="url(#tsHull)" stroke="#0c0f07" strokeWidth="1.5" />
          <rect x="12" y="48" width="120" height="4" fill="#0e120a" opacity="0.6" />
          <path d="M46 34 L54 10 L98 10 L108 34 Z" fill="url(#tsTurret)" stroke="#0c0f07" strokeWidth="1.5" />
          <ellipse cx="76" cy="12" rx="16" ry="4.5" fill="#3a4030" opacity="0.6" />
          {/* ISO tykin putki SUORAAN KATSOJAAN: leveä suuaukko edessä */}
          <ellipse cx="76" cy="34" rx="18" ry="9" fill="#1a1e12" />
          <path d="M58 34 L50 70 L102 70 L94 34 Z" fill="url(#tsBarrel)" stroke="#0c0f07" strokeWidth="1.5" />
          <ellipse cx="76" cy="70" rx="27" ry="15" fill="url(#tsMuzzle)" stroke="#0c0f07" strokeWidth="2" />
          <ellipse cx="76" cy="68" rx="15" ry="8" fill="#050705" />
        </g>
      </g>

      {/* ===== TIESULKU: puomi + betoniporsaat + piikkilanka (hahmon ja sotilaiden välissä) ===== */}
      <g className="ts-barrier">
        {/* puomin tolppa */}
        <rect x="148" y="298" width="18" height="46" rx="2" fill="#1e1e22" />
        <rect x="150" y="300" width="6" height="42" fill="#2e2e34" opacity="0.6" />
        {/* raidallinen puomi */}
        <g transform="rotate(-5 157 304)">
          <rect x="150" y="298" width="320" height="14" rx="2" fill="#c8c8cc" stroke="#8a8a90" strokeWidth="1" />
          <rect x="150" y="298" width="32" height="14" fill="#c0201a" />
          <rect x="214" y="298" width="32" height="14" fill="#c0201a" />
          <rect x="278" y="298" width="32" height="14" fill="#c0201a" />
          <rect x="342" y="298" width="32" height="14" fill="#c0201a" />
          <rect x="406" y="298" width="32" height="14" fill="#c0201a" />
        </g>
        {/* betoniporsaat (3D-viisteet) */}
        <g>
          <path d="M196 364 L214 334 L232 364 Z" fill="#3e3e42" />
          <path d="M214 334 L232 364 L224 364 L214 342 Z" fill="#2a2a2e" />
          <path d="M244 364 L262 334 L280 364 Z" fill="#3a3a3e" />
          <path d="M262 334 L280 364 L272 364 L262 342 Z" fill="#28282c" />
          <path d="M292 364 L310 334 L328 364 Z" fill="#3e3e42" />
          <path d="M310 334 L328 364 L320 364 L310 342 Z" fill="#2a2a2e" />
        </g>
        {/* piikkilanka */}
        <path d="M186 338 q10 -9 20 0 q10 9 20 0 q10 -9 20 0 q10 9 20 0 q10 -9 20 0 q10 9 20 0 q10 -9 20 0"
              stroke="#6a6a62" strokeWidth="1.5" fill="none" opacity="0.85" />
        <g stroke="#6a6a62" strokeWidth="1.2" opacity="0.8">
          <path d="M206 332 l0 12 M246 332 l0 12 M286 332 l0 12 M326 332 l0 12" />
        </g>
      </g>

      {/* Valonheittimen välähdys silmiin */}
      <rect className="ts-flash" x="0" y="0" width="640" height="400" fill="#fff8e0" opacity="0" />
    </svg>
  );
}

const TEXTS = [
  'Kaupungin laidalla tie katkeaa. Edessä sotilaiden tiesulku.',
  'Puomit edessä. Panssarivaunut sojottavat putkiaan suoraan sinua kohti.',
  'Valonheittimet iskevät silmiin. "SEIS! Alue on suljettu!"',
  'Sotilaat viittovat kivääreillään. Tänne ei ole menemistä.',
  'Perääntyessäsi huomaat kapean kävelytien, joka kaartuu metsän pimeyteen.',
  'Sinne on nyt ainoa tie.',
];

const TYPE_SPEED = 42;
const SCENE_PAUSE = 2400;

export default function TiesulkuReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('opening');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const militaryRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase('revealed'), 1000);
    return () => clearTimeout(t);
  }, []);

  // Sotilasääni (military.mp3) ja sen hiljentyminen kohtauksen poistuessa
  useEffect(() => {
    const audio = new Audio('/assets/sfx/military.mp3');
    audio.volume = 0.5 * sfxVolume;
    audio.loop = true;
    audio.play().catch(() => {});
    militaryRef.current = audio;

    return () => {
      if (militaryRef.current) {
        militaryRef.current.pause();
        militaryRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== 'revealed') return;
    setTyped('');
    setDone(false);
    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(TEXTS[sceneIndex].slice(0, i));
      if (i >= TEXTS[sceneIndex].length) {
        clearInterval(typeTimer);
        setDone(true);
      }
    }, TYPE_SPEED);
    return () => clearInterval(typeTimer);
  }, [phase, sceneIndex]);

  useEffect(() => {
    if (!done) return;

    let fadeInterval = null;
    let fadeStartTimeout = null;

    // Jos ollaan viimeisessä tekstissä, aloitetaan hiljennys vasta aivan kohtauksen lopussa
    if (sceneIndex === TEXTS.length - 1 && militaryRef.current) {
      const audio = militaryRef.current;
      
      // Viivästetty aloitus (1700 ms), jotta ääni kuuluu lähes loppuun asti
      fadeStartTimeout = setTimeout(() => {
        fadeInterval = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume -= 0.05;
          } else {
            audio.volume = 0;
            clearInterval(fadeInterval);
          }
        }, 50); // Lyhyt ja pehmeä 0,5 sekunnin liuku nollaan
      }, 1700);
    }

    timerRef.current = setTimeout(() => {
      if (sceneIndex < TEXTS.length - 1) {
        setSceneIndex((i) => i + 1);
      } else {
        setPhase('fading');
        setTimeout(() => onComplete(), 700);
      }
    }, SCENE_PAUSE);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fadeStartTimeout);
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [done, sceneIndex, onComplete]);

  return (
    <div className={`tiesulku tiesulku-${phase}`}>
      <div className="tiesulku-dark" />
      <div className="tiesulku-scene">
        <RoadblockScene />
      </div>
      {phase === 'revealed' && typed && (
        <div className="tiesulku-text-wrap">
          <p className="tiesulku-text">{typed}</p>
        </div>
      )}
      <div className="tiesulku-vignette" />
    </div>
  );
}
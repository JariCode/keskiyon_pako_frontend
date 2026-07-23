import { useState, useEffect, useRef } from 'react';
import './KirkkoReveal.css';

function ChurchInterior({ phase }) {
  return (
    <svg className="kirk-svg" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kiRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0d10" />
          <stop offset="100%" stopColor="#040405" />
        </linearGradient>
        <radialGradient id="kiMoon" cx="0.5" cy="0.25">
          <stop offset="0%" stopColor="#aeb8d8" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#6a7398" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6a7398" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kiStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2b30" />
          <stop offset="100%" stopColor="#131318" />
        </linearGradient>
        <linearGradient id="kiWindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6a9a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#232840" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Kirkkosali */}
      <rect x="0" y="0" width="640" height="400" fill="url(#kiRoom)" />

      {/* Kivilattia */}
      <g opacity="0.6">
        <rect x="0" y="280" width="640" height="120" fill="url(#kiStone)" />
        <line x1="0" y1="310" x2="640" y2="300" stroke="#0a0a0c" strokeWidth="2" />
        <line x1="0" y1="350" x2="640" y2="345" stroke="#0a0a0c" strokeWidth="2" />
      </g>

      {/* Keskikäytävä syvenee alttarin holviin */}
      <path d="M240 280 L255 130 Q255 70 320 65 Q385 70 385 130 L400 280 Z" fill="#07070a" />

      {/* Ikkunakaaret sivuilla (kuunvalo läpi) */}
      <g>
        <rect x="60" y="70" width="46" height="140" rx="23" fill="url(#kiWindow)" />
        <rect x="534" y="70" width="46" height="140" rx="23" fill="url(#kiWindow)" />
      </g>
      <ellipse cx="320" cy="60" rx="220" ry="80" fill="url(#kiMoon)" />

      {/* Pylväät */}
      <g fill="url(#kiStone)">
        <rect x="150" y="60" width="22" height="230" />
        <rect x="468" y="60" width="22" height="230" />
      </g>

      {/* Penkkirivit */}
      <g className="kirk-pews" opacity="0.8">
        <rect x="190" y="260" width="90" height="14" fill="#1a1a20" />
        <rect x="360" y="260" width="90" height="14" fill="#1a1a20" />
        <rect x="185" y="230" width="95" height="14" fill="#1a1a20" />
        <rect x="360" y="230" width="95" height="14" fill="#1a1a20" />
      </g>

      {/* Alttari holvin sisällä */}
      <rect x="300" y="200" width="40" height="24" fill="#151519" opacity="0.9" />

      {/* Zombiehahmot nousevat penkkien välistä (silhuetit) */}
      <g className={`kirk-zombies ${phase === 'revealed' || phase === 'lunging' ? 'kirk-zombies-show' : ''}`}>
        <g className="kirk-zombie kirk-zombie-1">
          <ellipse cx="205" cy="248" rx="10" ry="4" fill="#000" opacity="0.4" />
          <rect x="199" y="212" width="12" height="36" rx="4" fill="#161a14" />
          <circle cx="205" cy="206" r="7" fill="#161a14" />
        </g>
        <g className="kirk-zombie kirk-zombie-2">
          <ellipse cx="400" cy="252" rx="10" ry="4" fill="#000" opacity="0.4" />
          <rect x="394" y="214" width="12" height="38" rx="4" fill="#161a14" />
          <circle cx="400" cy="208" r="7" fill="#161a14" />
        </g>
        <g className="kirk-zombie kirk-zombie-3">
          <ellipse cx="320" cy="238" rx="11" ry="4" fill="#000" opacity="0.45" />
          <rect x="313" y="196" width="14" height="42" rx="4" fill="#12140f" />
          <circle cx="320" cy="188" r="8" fill="#12140f" />
        </g>
      </g>

      {/* Pölyhiukkaset */}
      <g className="kirk-dust">
        <circle cx="220" cy="150" r="1.4" fill="#c8bfa0" opacity="0.5" />
        <circle cx="440" cy="140" r="1" fill="#c8bfa0" opacity="0.45" />
        <circle cx="320" cy="180" r="1.2" fill="#c8bfa0" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function KirkkoReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('opening');
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const roarRef = useRef(null);

  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Portaat päättyvät kirkon lattialle.');
    }, 1200));

    t.push(setTimeout(() => {
      setText('Penkkien välistä nousee varjoja.');
      // Zombien karjaisu kerran (ei loopia) kun useampi hirviö paljastuu.
      const roar = new Audio('/assets/sfx/roar.mp3');
      roar.volume = 0.7 * sfxVolume;
      roar.play().catch(() => {});
      roarRef.current = roar;
    }, 3000));

    t.push(setTimeout(() => setText('Niitä on useampi.'), 4800));

    t.push(setTimeout(() => {
      setPhase('lunging');
      setText('');
    }, 6000));

    t.push(setTimeout(() => onComplete(), 6900));

    return () => {
      t.forEach(clearTimeout);
      if (roarRef.current) {
        roarRef.current.pause();
        roarRef.current.currentTime = 0;
        roarRef.current = null;
      }
    };
  }, [onComplete, sfxVolume]);

  return (
    <div className={`kirk kirk-${phase}`}>
      <div className="kirk-dark" />
      <div className="kirk-scene">
        <ChurchInterior phase={phase} />
      </div>
      {text && (
        <div className="kirk-text-wrap">
          <p className="kirk-text">{text}</p>
        </div>
      )}
      <div className="kirk-vignette" />
    </div>
  );
}

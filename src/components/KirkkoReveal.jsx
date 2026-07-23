import { useState, useEffect, useRef } from 'react';
import './KirkkoReveal.css';

function ZombieSilhouette({ className, tint = '#1c2418' }) {
  return (
    <g className={`kirk-zombie ${className}`}>
      <ellipse cx="0" cy="46" rx="13" ry="4" fill="#000" opacity="0.4" />
      {/* jalat, hieman koukussa */}
      <path d="M-7 20 L-9 44 L-3 44 L-2 22 Z" fill={tint} />
      <path d="M6 20 L9 44 L3 44 L2 22 Z" fill={tint} />
      {/* vartalo, kumarassa asennossa */}
      <path d="M-9 -10 Q-11 6 -7 22 L8 22 Q11 6 9 -10 Q0 -16 -9 -10 Z" fill={tint} />
      {/* revitty vaatteen repale */}
      <path d="M-8 -2 L-3 4 L-9 8 Z" fill="#000" opacity="0.35" />
      <path d="M6 2 L2 8 L9 10 Z" fill="#000" opacity="0.3" />
      {/* kädet ojossa eteenpäin */}
      <path d="M-9 -8 Q-20 -4 -25 6" stroke={tint} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M9 -8 Q19 -2 23 8" stroke={tint} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* pää, hieman eteenpäin roikkuen */}
      <circle cx="-1" cy="-20" r="8.5" fill={tint} />
      {/* hehkuvat silmät */}
      <circle className="kirk-zombie-eye" cx="-4" cy="-21" r="1.4" fill="#d7ffb0" />
      <circle className="kirk-zombie-eye" cx="2" cy="-21" r="1.4" fill="#d7ffb0" />
    </g>
  );
}

function ChurchInterior({ phase }) {
  return (
    <svg className="kirk-svg" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kiRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0e13" />
          <stop offset="100%" stopColor="#040406" />
        </linearGradient>
        <radialGradient id="kiRose" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#7fa0e6" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#3d5aa8" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#241a3a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#100a18" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kiStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2d33" />
          <stop offset="100%" stopColor="#131317" />
        </linearGradient>
        <linearGradient id="kiFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232328" />
          <stop offset="100%" stopColor="#0d0d10" />
        </linearGradient>
        <linearGradient id="kiPillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38393f" />
          <stop offset="50%" stopColor="#232429" />
          <stop offset="100%" stopColor="#131317" />
        </linearGradient>
        <linearGradient id="kiWindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6a9a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#232840" stopOpacity="0.15" />
        </linearGradient>
        <filter id="kiSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <rect x="0" y="0" width="640" height="420" fill="url(#kiRoom)" />

      {/* Ruusuikkuna takaseinällä, alttarin holvin yläpuolella */}
      <g opacity={phase === 'opening' ? 0.4 : 0.85} style={{ transition: 'opacity 1.2s ease' }}>
        <circle cx="320" cy="70" r="58" fill="url(#kiRose)" filter="url(#kiSoftGlow)" />
        <g stroke="#0a0a0c" strokeWidth="2.5" opacity="0.8">
          <line x1="320" y1="14" x2="320" y2="126" />
          <line x1="266" y1="70" x2="374" y2="70" />
          <line x1="281" y1="31" x2="359" y2="109" />
          <line x1="359" y1="31" x2="281" y2="109" />
        </g>
        <circle cx="320" cy="70" r="58" fill="none" stroke="#0a0a0c" strokeWidth="4" />
      </g>

      {/* Gotiikkaholvi joka syvenee alttariin */}
      <path d="M225 300 L245 140 Q245 78 320 72 Q395 78 395 140 L415 300 Z" fill="#06060a" />
      <path d="M225 300 L245 140 Q245 78 320 72 Q395 78 395 140 L415 300"
        fill="none" stroke="#050508" strokeWidth="3" opacity="0.9" />

      {/* Ristikaaret (nervures) holvin katossa */}
      <g stroke="#0a0a0d" strokeWidth="2" fill="none" opacity="0.7">
        <path d="M150 90 Q320 20 490 90" />
        <path d="M180 110 Q320 55 460 110" />
      </g>

      {/* Sivuikkunat, kuunvalo läpi */}
      <g>
        <rect x="55" y="90" width="42" height="160" rx="21" fill="url(#kiWindow)" />
        <rect x="543" y="90" width="42" height="160" rx="21" fill="url(#kiWindow)" />
        <rect x="55" y="90" width="42" height="160" rx="21" fill="none" stroke="#0a0a0c" strokeWidth="2" />
        <rect x="543" y="90" width="42" height="160" rx="21" fill="none" stroke="#0a0a0c" strokeWidth="2" />
        <line x1="76" y1="90" x2="76" y2="250" stroke="#0a0a0c" strokeWidth="1.5" />
        <line x1="564" y1="90" x2="564" y2="250" stroke="#0a0a0c" strokeWidth="1.5" />
      </g>

      {/* Pylväät */}
      <rect x="140" y="70" width="24" height="240" fill="url(#kiPillar)" />
      <rect x="476" y="70" width="24" height="240" fill="url(#kiPillar)" />
      <ellipse cx="152" cy="70" rx="16" ry="6" fill="#3a3b42" />
      <ellipse cx="488" cy="70" rx="16" ry="6" fill="#3a3b42" />

      {/* Kivilattia keskikäytävällä */}
      <rect x="0" y="300" width="640" height="120" fill="url(#kiFloor)" />
      <g stroke="#000000" strokeWidth="1.5" opacity="0.5">
        <line x1="0" y1="330" x2="640" y2="326" />
        <line x1="0" y1="365" x2="640" y2="362" />
        <line x1="0" y1="398" x2="640" y2="396" />
      </g>

      {/* Alttari + risti holvin sisällä */}
      <g>
        <rect x="295" y="230" width="50" height="26" fill="#17171b" stroke="#0a0a0c" strokeWidth="1.5" />
        <rect x="303" y="215" width="34" height="10" fill="#1c1c21" />
        <rect x="316" y="150" width="8" height="60" fill="#2a2a2f" />
        <rect x="298" y="172" width="44" height="8" fill="#2a2a2f" />
        <circle cx="320" cy="150" r="5" fill="#8899cc" opacity="0.7" filter="url(#kiSoftGlow)" />
        {/* kynttilät alttarilla */}
        <rect x="300" y="220" width="3" height="10" fill="#d8c896" />
        <rect x="337" y="220" width="3" height="10" fill="#d8c896" />
        <circle className="kirk-candle" cx="301.5" cy="219" r="2" fill="#ffcf7a" />
        <circle className="kirk-candle" cx="338.5" cy="219" r="2" fill="#ffcf7a" />
      </g>

      {/* Penkkirivit kummallakin puolella keskikäytävää, useampi rivi */}
      <g className="kirk-pews">
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={200 - i * 4} y={250 + i * 24} width="86" height="16" rx="2" fill="#1a1a20" stroke="#0a0a0c" strokeWidth="1" />
            <rect x={200 - i * 4} y={244 + i * 24} width="86" height="8" rx="2" fill="#222228" stroke="#0a0a0c" strokeWidth="1" />
            <rect x={354 + i * 4} y={250 + i * 24} width="86" height="16" rx="2" fill="#1a1a20" stroke="#0a0a0c" strokeWidth="1" />
            <rect x={354 + i * 4} y={244 + i * 24} width="86" height="8" rx="2" fill="#222228" stroke="#0a0a0c" strokeWidth="1" />
          </g>
        ))}
      </g>

      {/* Zombiet nousevat penkkien välistä ja käytävälle */}
      <g className={`kirk-zombies ${phase === 'revealed' || phase === 'lunging' ? 'kirk-zombies-show' : ''}`}>
        <g transform="translate(230, 300)"><ZombieSilhouette className="kirk-zombie-1" tint="#202b18" /></g>
        <g transform="translate(400, 306)"><ZombieSilhouette className="kirk-zombie-2" tint="#232b1c" /></g>
        <g transform="translate(320, 288) scale(1.1)"><ZombieSilhouette className="kirk-zombie-3" tint="#161f10" /></g>
        <g transform="translate(265, 330) scale(0.9)"><ZombieSilhouette className="kirk-zombie-4" tint="#1c2416" /></g>
        <g transform="translate(370, 335) scale(0.9)"><ZombieSilhouette className="kirk-zombie-5" tint="#1f2819" /></g>
      </g>

      {/* Pölyhiukkaset kuunvalossa */}
      <g className="kirk-dust">
        <circle cx="230" cy="160" r="1.4" fill="#c8bfa0" opacity="0.5" />
        <circle cx="430" cy="150" r="1" fill="#c8bfa0" opacity="0.45" />
        <circle cx="320" cy="190" r="1.2" fill="#c8bfa0" opacity="0.5" />
        <circle cx="360" cy="120" r="1" fill="#c8bfa0" opacity="0.4" />
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
      setText('Penkkien välistä nousee useampi varjo.');
      // Zombien karjaisu kerran (ei loopia) kun useampi hirviö paljastuu.
      const roar = new Audio('/assets/sfx/roar.mp3');
      roar.volume = 0.7 * sfxVolume;
      roar.play().catch(() => {});
      roarRef.current = roar;
    }, 3000));

    t.push(setTimeout(() => setText('Ne kääntyvät kohti sinua.'), 4900));

    t.push(setTimeout(() => {
      setPhase('lunging');
      setText('');
    }, 6100));

    t.push(setTimeout(() => onComplete(), 7000));

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

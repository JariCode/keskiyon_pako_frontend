import { useState, useEffect, useRef } from 'react';
import './MokkiReveal.css';

function CabinInterior() {
  return (
    <svg className="mokki-svg" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mkRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#120e0a" />
          <stop offset="100%" stopColor="#050403" />
        </linearGradient>
        <radialGradient id="mkHearthGlow" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#ffcf7a" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ff9a3c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mkFire" cx="0.5" cy="0.65">
          <stop offset="0%" stopColor="#fff3c0" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ffaa44" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mkWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a1c" />
          <stop offset="100%" stopColor="#241a10" />
        </linearGradient>
        <linearGradient id="mkPlank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2016" />
          <stop offset="100%" stopColor="#1a130c" />
        </linearGradient>
      </defs>

      {/* Huoneen pohja */}
      <rect x="0" y="0" width="640" height="400" fill="url(#mkRoom)" />

      {/* Lattialankut, näkymä alhaalta ylös */}
      <g opacity="0.5">
        <line x1="0" y1="300" x2="640" y2="260" stroke="#1a130c" strokeWidth="2" />
        <line x1="0" y1="340" x2="640" y2="310" stroke="#1a130c" strokeWidth="2" />
        <line x1="0" y1="380" x2="640" y2="360" stroke="#1a130c" strokeWidth="2" />
        <rect x="0" y="250" width="640" height="150" fill="url(#mkPlank)" opacity="0.4" />
      </g>

      {/* Takaseinä hirsistä */}
      <g opacity="0.85">
        <rect x="0" y="0" width="640" height="260" fill="url(#mkWood)" />
        <line x1="0" y1="40" x2="640" y2="40" stroke="#0e0a06" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="80" x2="640" y2="80" stroke="#0e0a06" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="120" x2="640" y2="120" stroke="#0e0a06" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="160" x2="640" y2="160" stroke="#0e0a06" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="200" x2="640" y2="200" stroke="#0e0a06" strokeWidth="2" opacity="0.5" />
      </g>

      {/* ===== KAMINA VASEMMALLA ===== */}
      <g className="mk-hearth">
        <ellipse className="mk-hearth-glow" cx="95" cy="210" rx="170" ry="140" fill="url(#mkHearthGlow)" />
        {/* kiviholvi */}
        <path d="M20 260 L20 120 Q20 90 60 80 L140 80 Q180 90 180 120 L180 260 Z"
          fill="#2a2420" stroke="#141210" strokeWidth="3" />
        <path d="M35 260 L35 130 Q35 105 65 98 L135 98 Q165 105 165 130 L165 260 Z"
          fill="#0c0908" />
        {/* kivet */}
        <circle cx="35" cy="150" r="9" fill="#38312b" />
        <circle cx="165" cy="170" r="10" fill="#332c26" />
        <circle cx="28" cy="200" r="8" fill="#332c26" />
        <circle cx="172" cy="220" r="9" fill="#38312b" />
        <circle cx="45" cy="95" r="7" fill="#38312b" />
        <circle cx="150" cy="90" r="7" fill="#332c26" />
        {/* tuli */}
        <g className="mk-fire">
          <ellipse cx="100" cy="235" rx="55" ry="24" fill="url(#mkFire)" />
          <path d="M75 240 Q80 205 98 195 Q92 215 100 220 Q108 200 118 195 Q112 218 122 225 Q128 210 130 200 Q136 220 122 240 Z"
            fill="#ffb347" opacity="0.9" />
          <path d="M88 238 Q92 218 100 212 Q97 224 102 226 Q107 214 112 212 Q108 226 116 236 Z"
            fill="#fff3c0" opacity="0.9" />
        </g>
        {/* halot */}
        <rect x="70" y="242" width="60" height="10" rx="3" fill="#1c130a" />
        <rect x="78" y="230" width="50" height="9" rx="3" fill="#241a0e" />
      </g>

      {/* ===== PÖYTÄ JA TUOLIT KAMINAN VIERESSÄ ===== */}
      <g className="mk-table">
        <ellipse cx="290" cy="300" rx="90" ry="18" fill="#000" opacity="0.4" />
        {/* pöydän jalat */}
        <rect x="235" y="255" width="8" height="45" fill="#1c140c" />
        <rect x="335" y="255" width="8" height="45" fill="#1c140c" />
        {/* pöytälevy */}
        <path d="M220 240 L360 240 L370 258 L210 258 Z" fill="#3a2a1c" stroke="#1c140c" strokeWidth="2" />
        <path d="M225 245 L355 245" stroke="#241a10" strokeWidth="1.5" opacity="0.6" />
        {/* mukeja/lautanen pöydällä */}
        <ellipse cx="260" cy="249" rx="9" ry="4" fill="#4a3826" opacity="0.8" />
        <ellipse cx="320" cy="250" rx="7" ry="3" fill="#2a1f14" opacity="0.8" />

        {/* Tuoli vasemmalla */}
        <g transform="translate(190,255)">
          <rect x="-6" y="18" width="6" height="30" fill="#241a10" />
          <rect x="26" y="18" width="6" height="30" fill="#241a10" />
          <path d="M-10 10 L34 10 L30 22 L-6 22 Z" fill="#2c2016" />
          <rect x="-10" y="-18" width="8" height="30" fill="#2c2016" />
        </g>
        {/* Tuoli oikealla */}
        <g transform="translate(378,255)">
          <rect x="-6" y="18" width="6" height="30" fill="#241a10" />
          <rect x="26" y="18" width="6" height="30" fill="#241a10" />
          <path d="M-10 10 L34 10 L30 22 L-6 22 Z" fill="#2c2016" />
          <rect x="34" y="-18" width="8" height="30" fill="#2c2016" />
        </g>
      </g>

      {/* Hämärä oikea laita, huoneen jatkumo */}
      <rect x="480" y="0" width="160" height="400" fill="#000" opacity="0.35" />

      {/* Pöly / hiukkaset ilmassa kaminan valossa */}
      <g className="mk-dust">
        <circle cx="140" cy="150" r="1.4" fill="#ffdca0" opacity="0.6" />
        <circle cx="170" cy="120" r="1" fill="#ffdca0" opacity="0.5" />
        <circle cx="110" cy="100" r="1.2" fill="#ffdca0" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function MokkiReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('opening');
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const firewoodRef = useRef(null);

  // Tekstien ja vaiheiden ajastus
  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Ovi paukahtaa kiinni takana.');
    }, 1200));
    t.push(setTimeout(() => setText('Kamina hehkuu hiljaa nurkassa.'), 3000));
    t.push(setTimeout(() => setText('Täällä voi hetken hengähtää.'), 4800));
    t.push(setTimeout(() => {
      setPhase('fading');
      setText('');
    }, 6000));
    t.push(setTimeout(() => onComplete(), 6700));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Tulen ritinän (firewood.mp3) toisto ja hiljennys
  useEffect(() => {
    const audio = new Audio('/assets/sfx/firewood.mp3');
    audio.volume = 0.6 * sfxVolume;
    audio.play().catch(() => {});
    firewoodRef.current = audio;

    let fadeInterval = null;

    // Aloitetaan hiljennys 4.2 s kohdalla
    const fadeTimer = setTimeout(() => {
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.015) {
          audio.volume -= 0.015; 
        } else {
          audio.volume = 0;
          clearInterval(fadeInterval);
        }
      }, 40); 
    }, 4200);

    return () => {
      clearTimeout(fadeTimer);
      if (fadeInterval) clearInterval(fadeInterval);
      if (firewoodRef.current) {
        firewoodRef.current.pause();
        firewoodRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`mokki mokki-${phase}`}>
      <div className="mokki-dark" />
      <div className="mokki-scene">
        <CabinInterior />
      </div>
      {text && (
        <div className="mokki-text-wrap">
          <p className="mokki-text">{text}</p>
        </div>
      )}
      <div className="mokki-vignette" />
    </div>
  );
}
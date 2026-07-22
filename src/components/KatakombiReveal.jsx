import { useState, useEffect, useRef } from 'react';
import './KatakombiReveal.css';

function CatacombInterior() {
  return (
    <svg className="kata-svg" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ktRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0c0e" />
          <stop offset="100%" stopColor="#030405" />
        </linearGradient>
        <radialGradient id="ktTorch" cx="0.5" cy="0.4">
          <stop offset="0%" stopColor="#ffcf7a" stopOpacity="0.9" />
          <stop offset="45%" stopColor="# d98a2b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ktStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b2a28" />
          <stop offset="100%" stopColor="#141312" />
        </linearGradient>
        <linearGradient id="ktArch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1b1a" />
          <stop offset="100%" stopColor="#0a0908" />
        </linearGradient>
      </defs>

      {/* Tunnelin pohja */}
      <rect x="0" y="0" width="640" height="400" fill="url(#ktRoom)" />

      {/* Kivilattia */}
      <g opacity="0.6">
        <rect x="0" y="270" width="640" height="130" fill="url(#ktStone)" />
        <line x1="0" y1="300" x2="640" y2="286" stroke="#0a0908" strokeWidth="2" />
        <line x1="0" y1="340" x2="640" y2="330" stroke="#0a0908" strokeWidth="2" />
        <line x1="120" y1="270" x2="90" y2="400" stroke="#0a0908" strokeWidth="1.5" opacity="0.5" />
        <line x1="320" y1="270" x2="320" y2="400" stroke="#0a0908" strokeWidth="1.5" opacity="0.5" />
        <line x1="520" y1="270" x2="550" y2="400" stroke="#0a0908" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* Holvikaari keskellä — käytävä syvenee pimeyteen */}
      <path d="M220 270 L220 150 Q220 90 320 90 Q420 90 420 150 L420 270 Z" fill="url(#ktArch)" />
      <path d="M245 270 L245 155 Q245 115 320 115 Q395 115 395 155 L395 270 Z" fill="#000000" />

      {/* Kivimuuraus holvin ympärillä */}
      <g stroke="#0a0908" strokeWidth="2" opacity="0.7" fill="none">
        <path d="M210 150 Q210 80 320 80 Q430 80 430 150" />
        <line x1="210" y1="180" x2="245" y2="180" />
        <line x1="210" y1="220" x2="245" y2="220" />
        <line x1="395" y1="180" x2="430" y2="180" />
        <line x1="395" y1="220" x2="430" y2="220" />
      </g>

      {/* Seinäkivet vasemmalla ja oikealla */}
      <g opacity="0.85">
        <rect x="0" y="0" width="200" height="270" fill="url(#ktStone)" />
        <rect x="440" y="0" width="200" height="270" fill="url(#ktStone)" />
        <g stroke="#0a0908" strokeWidth="1.5" opacity="0.6">
          <line x1="0" y1="60" x2="200" y2="60" />
          <line x1="0" y1="120" x2="200" y2="120" />
          <line x1="0" y1="180" x2="200" y2="180" />
          <line x1="440" y1="60" x2="640" y2="60" />
          <line x1="440" y1="120" x2="640" y2="120" />
          <line x1="440" y1="180" x2="640" y2="180" />
          <line x1="100" y1="0" x2="100" y2="60" />
          <line x1="60" y1="60" x2="60" y2="120" />
          <line x1="540" y1="0" x2="540" y2="60" />
          <line x1="580" y1="60" x2="580" y2="120" />
        </g>
      </g>

      {/* Soihdut seinillä */}
      <g className="kata-torch">
        <ellipse cx="130" cy="130" rx="90" ry="110" fill="url(#ktTorch)" />
        <rect x="126" y="130" width="8" height="40" fill="#241a10" />
        <path d="M118 130 Q124 100 130 118 Q136 102 142 130 Q138 122 130 126 Q122 122 118 130 Z"
          fill="#ffb347" opacity="0.9" />
      </g>
      <g className="kata-torch kata-torch-2">
        <ellipse cx="510" cy="130" rx="90" ry="110" fill="url(#ktTorch)" />
        <rect x="506" y="130" width="8" height="40" fill="#241a10" />
        <path d="M498 130 Q504 100 510 118 Q516 102 522 130 Q518 122 510 126 Q502 122 498 130 Z"
          fill="#ffb347" opacity="0.9" />
      </g>

      {/* Luita lattialla */}
      <g opacity="0.5" stroke="#8a8474" strokeWidth="2" strokeLinecap="round">
        <line x1="150" y1="350" x2="180" y2="358" />
        <line x1="160" y1="348" x2="158" y2="362" />
        <line x1="470" y1="360" x2="500" y2="352" />
        <circle cx="490" cy="368" r="5" fill="#8a8474" stroke="none" />
      </g>

      {/* Pölyhiukkaset */}
      <g className="kata-dust">
        <circle cx="200" cy="150" r="1.4" fill="#c8bfa0" opacity="0.5" />
        <circle cx="440" cy="130" r="1" fill="#c8bfa0" opacity="0.45" />
        <circle cx="320" cy="180" r="1.2" fill="#c8bfa0" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function KatakombiReveal({ onComplete }) {
  const [phase, setPhase] = useState('opening');
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const musicRef = useRef(null);

  // Tekstien ja vaiheiden ajastus
  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Portaat vievät alas pimeyteen.');
    }, 1200));
    t.push(setTimeout(() => setText('Kiviholvit kaikuvat askelistasi.'), 3000));
    t.push(setTimeout(() => setText('Katakombit nielevät valon.'), 4800));
    t.push(setTimeout(() => {
      setPhase('fading');
      setText('');
    }, 6000));
    t.push(setTimeout(() => onComplete(), 6700));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Sama taustamusiikki kuin introssa (intro.mp3), soi vain tämän
  // cutscenen ajan ja hiljenee kun cutscene poistuu.
  useEffect(() => {
    const audio = new Audio('/assets/audio/intro.mp3');
    audio.volume = 0.7;
    audio.loop = true;
    audio.play().catch(() => {});
    musicRef.current = audio;

    let fadeInterval = null;
    // Hiljennys alkaa 4.2 s kohdalla
    const fadeTimer = setTimeout(() => {
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume -= 0.02;
        } else {
          audio.volume = 0;
          clearInterval(fadeInterval);
        }
      }, 40);
    }, 4200);

    return () => {
      clearTimeout(fadeTimer);
      if (fadeInterval) clearInterval(fadeInterval);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`kata kata-${phase}`}>
      <div className="kata-dark" />
      <div className="kata-scene">
        <CatacombInterior />
      </div>
      {text && (
        <div className="kata-text-wrap">
          <p className="kata-text">{text}</p>
        </div>
      )}
      <div className="kata-vignette" />
    </div>
  );
}

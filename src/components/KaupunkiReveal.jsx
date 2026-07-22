import { useState, useEffect, useRef } from 'react';
import './KaupunkiReveal.css';

function ChaosCity() {
  return (
    <svg className="kaupunki-svg" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="krSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a14" />
          <stop offset="100%" stopColor="#1a0e12" />
        </linearGradient>
        <radialGradient id="krHeadlight" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#fff6d8" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#ffe08a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="krFire" cx="0.5" cy="0.6">
          <stop offset="0%" stopColor="#ffcc55" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ff6622" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff3311" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="krBuilding" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14141c" />
          <stop offset="100%" stopColor="#0a0a10" />
        </linearGradient>
      </defs>

      {/* Taivas */}
      <rect x="0" y="0" width="640" height="400" fill="url(#krSky)" />

      {/* Kaukaiset rakennukset (siluetit) */}
      <g className="kr-buildings">
        <rect x="20" y="120" width="70" height="200" fill="url(#krBuilding)" />
        <rect x="100" y="80" width="60" height="240" fill="url(#krBuilding)" />
        <rect x="170" y="140" width="80" height="180" fill="url(#krBuilding)" />
        <rect x="390" y="100" width="70" height="220" fill="url(#krBuilding)" />
        <rect x="470" y="60" width="65" height="260" fill="url(#krBuilding)" />
        <rect x="545" y="130" width="75" height="190" fill="url(#krBuilding)" />
        
        {/* Ikkunat */}
        <rect x="35" y="150" width="8" height="10" fill="#ffcc66" opacity="0.6" />
        <rect x="115" y="120" width="8" height="10" fill="#ffcc66" opacity="0.5" />
        <rect x="490" y="100" width="8" height="10" fill="#ffaa44" opacity="0.7" />
        <rect x="560" y="170" width="8" height="10" fill="#ffcc66" opacity="0.4" />
      </g>

      {/* Palava auto oikealla (tulen hehku) */}
      <ellipse className="kr-fire" cx="500" cy="330" rx="90" ry="50" fill="url(#krFire)" />

      {/* Katu */}
      <rect x="0" y="320" width="640" height="80" fill="#0c0c10" />
      <rect x="0" y="356" width="640" height="4" fill="#2a2a1a" opacity="0.5" />

      {/* Autojen ajovalot pyyhkivät */}
      <ellipse className="kr-beam kr-beam1" cx="180" cy="345" rx="120" ry="55" fill="url(#krHeadlight)" />
      <ellipse className="kr-beam kr-beam2" cx="420" cy="355" rx="110" ry="50" fill="url(#krHeadlight)" />

      {/* --- YKSITYISKOHTAISET AUTOT --- */}
      <g className="kr-cars">
        
        {/* AUTO 1: Vasemmanpuoleinen auto (nokka oikealle) */}
        <g id="car1">
          {/* Renkaat */}
          <circle cx="155" cy="358" r="8" fill="#050508" />
          <circle cx="155" cy="358" r="4" fill="#3a3a44" />
          <circle cx="205" cy="358" r="8" fill="#050508" />
          <circle cx="205" cy="358" r="4" fill="#3a3a44" />

          {/* Korimuotoilu (Sedan) */}
          <path 
            d="M 135 352 L 138 340 L 158 335 L 175 324 L 198 324 L 212 338 L 222 342 L 222 352 Z" 
            fill="#181822" 
            stroke="#282836" 
            strokeWidth="1.5"
          />

          {/* Ikkunat */}
          <path d="M 160 336 L 174 326 L 196 326 L 192 336 Z" fill="#354050" opacity="0.8" />
          <path d="M 195 336 L 198 326 L 208 338 L 195 338 Z" fill="#354050" opacity="0.6" />

          {/* Puskurit ja yksityiskohdat */}
          <rect x="133" y="348" width="5" height="5" rx="1" fill="#0d0d12" />
          <rect x="220" y="346" width="4" height="6" rx="1" fill="#0d0d12" />
          
          {/* Takavalo (Punainen) */}
          <rect x="135" y="342" width="2" height="5" fill="#ff2211" />

          {/* Kirkkaat etuvalot */}
          <circle cx="221" cy="344" r="3" fill="#ffffff" />
          <circle cx="221" cy="344" r="5" fill="#ffe08a" opacity="0.4" />
        </g>


        {/* AUTO 2: Oikeanpuoleinen viisto/kolaroinut auto (nokka vasemmalle) */}
        <g id="car2">
          {/* Renkaat */}
          <circle cx="395" cy="362" r="8" fill="#050508" />
          <circle cx="395" cy="362" r="4" fill="#3a3a44" />
          <circle cx="445" cy="362" r="8" fill="#050508" />
          <circle cx="445" cy="362" r="4" fill="#3a3a44" />

          {/* Korimuotoilu (Hatchback/Maasturi) */}
          <path 
            d="M 378 356 L 388 346 L 402 330 L 438 330 L 452 344 L 460 348 L 460 358 Z" 
            fill="#1c1c24" 
            stroke="#2d2d3c" 
            strokeWidth="1.5"
          />

          {/* Ikkunat */}
          <path d="M 405 332 L 418 332 L 418 344 L 392 344 Z" fill="#384558" opacity="0.75" />
          <path d="M 421 332 L 436 332 L 448 344 L 421 344 Z" fill="#384558" opacity="0.85" />

          {/* Puskurit ja takavalo */}
          <rect x="458" y="352" width="4" height="6" rx="1" fill="#0d0d12" />
          <rect x="458" y="348" width="2" height="5" fill="#ff2211" />

          {/* Rikkoutunut / Keltainen ajovalo nokassa */}
          <circle cx="380" cy="350" r="3.5" fill="#ffdd88" />
          <circle cx="380" cy="350" r="6" fill="#ffaa22" opacity="0.5" />
        </g>

      </g>

      {/* Zombiesiluetteja kadulla */}
      <g className="kr-zombies">
        {/* Zombi 1 */}
        <g className="kr-zombie kr-z1">
          <ellipse cx="280" cy="384" rx="12" ry="3" fill="#000" opacity="0.5" />
          <path d="M 276 364 L 274 382 M 281 364 L 283 382" stroke="#0e1410" strokeWidth="3" strokeLinecap="round" />
          <path d="M 273 352 Q 278 350 284 352 L 282 365 L 275 365 Z" fill="#0e1410" />
          <path d="M 273 353 L 267 358 L 263 357" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 284 353 L 290 357 L 295 356" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="278" cy="346" r="5" fill="#141a12" />
          <circle cx="276.5" cy="345.5" r="1.1" fill="#88ff66" />
          <circle cx="279.5" cy="345.5" r="1.1" fill="#88ff66" />
        </g>

        {/* Zombi 2 */}
        <g className="kr-zombie kr-z2">
          <ellipse cx="330" cy="386" rx="12" ry="3" fill="#000" opacity="0.5" />
          <path d="M 326 366 L 324 384 M 331 366 L 333 384" stroke="#0e1410" strokeWidth="3" strokeLinecap="round" />
          <path d="M 323 354 Q 328 352 334 354 L 332 367 L 325 367 Z" fill="#0e1410" />
          <path d="M 323 355 L 316 359" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 334 355 L 341 360 L 345 358" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="328" cy="348" r="5.5" fill="#141a12" />
          <circle cx="326.5" cy="347" r="1.2" fill="#88ff66" />
          <circle cx="329.5" cy="347" r="1.2" fill="#88ff66" />
        </g>

        {/* Zombi 3 */}
        <g className="kr-zombie kr-z3">
          <ellipse cx="235" cy="388" rx="11" ry="3" fill="#000" opacity="0.5" />
          <path d="M 232 370 L 230 386 M 237 370 L 239 386" stroke="#0e1410" strokeWidth="3" strokeLinecap="round" />
          <path d="M 229 358 Q 234 356 240 358 L 238 371 L 231 371 Z" fill="#0e1410" />
          <path d="M 229 359 L 222 363" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 240 359 L 246 362 L 250 360" stroke="#0e1410" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="234" cy="352" r="5" fill="#141a12" />
          <circle cx="232.5" cy="351" r="1.1" fill="#88ff66" />
          <circle cx="235.5" cy="351" r="1.1" fill="#88ff66" />
        </g>
      </g>

      {/* Vilkkuva varoitusvalo */}
      <circle className="kr-flash" cx="60" cy="300" r="6" fill="#ff4422" />

    </svg>
  );
}

export default function KaupunkiReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('opening');
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const sirenRef = useRef(null);

  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Kaupunki on vaipunut pimeyteen.');
    }, 1200));
    t.push(setTimeout(() => setText('Autojen valot repivät kaaosta.'), 3000));
    t.push(setTimeout(() => setText('Ne ovat kaikkialla.'), 4800));
    t.push(setTimeout(() => {
      setPhase('fading');
      setText('');
    }, 6000));
    t.push(setTimeout(() => onComplete(), 6700));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Sireeni-ääniefekti kohtauksen taustalle + pehmeä loppuhiljennys
  useEffect(() => {
    const audio = new Audio('/assets/sfx/siren.mp3');
    audio.volume = 0.5 * sfxVolume;
    audio.play().catch(() => {});
    sirenRef.current = audio;

    // Aloitetaan äänen vaimentaminen 5.2 sekunnin kohdalla
    const fadeTimer = setTimeout(() => {
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume -= 0.05; // Pienennetään volyymia pykälittäin
        } else {
          audio.volume = 0;
          clearInterval(fadeInterval);
        }
      }, 100); // Mieto hiljennys 100ms välein
    }, 5200);

    // Pysäytetään ääni ja siivotaan ajastimet kun kohtaus poistuu
    return () => {
      clearTimeout(fadeTimer);
      if (sirenRef.current) {
        sirenRef.current.pause();
        sirenRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`kaupunki kaupunki-${phase}`}>
      <div className="kaupunki-dark" />
      <div className="kaupunki-scene">
        <ChaosCity />
      </div>
      {text && (
        <div className="kaupunki-text-wrap">
          <p className="kaupunki-text">{text}</p>
        </div>
      )}
      <div className="kaupunki-vignette" />
    </div>
  );
}

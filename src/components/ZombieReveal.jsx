import { useState, useEffect, useRef } from 'react';
import './ZombieReveal.css';

function ZombieFigure() {
  return (
    <svg className="zombie-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="zSkin" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#e4dca0" />
          <stop offset="50%" stopColor="#cfc06a" />
          <stop offset="100%" stopColor="#8f8340" />
        </linearGradient>
        <linearGradient id="zSkinDark" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#b0a44f" />
          <stop offset="100%" stopColor="#6f6733" />
        </linearGradient>
        <linearGradient id="zLeather" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#31343e" />
          <stop offset="55%" stopColor="#16181f" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>
        <linearGradient id="zJeans" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2f6fc4" />
          <stop offset="55%" stopColor="#1d4c8e" />
          <stop offset="100%" stopColor="#122f57" />
        </linearGradient>
        <linearGradient id="zGloves" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#6a6f78" />
          <stop offset="100%" stopColor="#33373d" />
        </linearGradient>
        <linearGradient id="zHair" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#8bff5a" />
          <stop offset="55%" stopColor="#39c11f" />
          <stop offset="100%" stopColor="#1c7a10" />
        </linearGradient>
        <radialGradient id="zBloodStain" cx="0.4" cy="0.3">
          <stop offset="0%" stopColor="#a80c0c" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#6e0606" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4a0303" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zBloodRun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a0808" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#5a0404" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3a0202" stopOpacity="0" />
        </linearGradient>
        <filter id="zSoftShade">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id="zEyeBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ===== JALAT (siniset repaleiset farkut) ===== */}
      <g className="zg-leg-left">
        <path d="M62 250 L75 250 L74 306 L60 304 Z" fill="url(#zJeans)" />
        <path d="M60 304 L74 306 L75 360 L61 360 Z" fill="url(#zJeans)" />
        {/* repeämät */}
        <path d="M62 276 L70 272 L68 280 L61 283 Z" fill="#0e2340" opacity="0.8" />
        <path d="M63 322 L71 319 L69 328 L62 330 Z" fill="#0e2340" opacity="0.8" />
        {/* paljas jalka */}
        <path d="M59 360 L75 360 L77 374 L55 374 Q55 366 59 360 Z" fill="url(#zSkinDark)" />
      </g>

      <g className="zg-leg-right">
        <path d="M85 250 L98 250 L99 304 L87 306 Z" fill="url(#zJeans)" />
        <path d="M87 306 L99 304 L98 360 L86 360 Z" fill="url(#zJeans)" />
        <path d="M88 270 L96 274 L94 282 L87 279 Z" fill="#0e2340" opacity="0.8" />
        <path d="M87 320 L95 317 L96 327 L88 329 Z" fill="#0e2340" opacity="0.8" />
        <path d="M85 360 L101 360 L105 374 L83 374 Q83 366 85 360 Z" fill="url(#zSkinDark)" />
      </g>

      {/* ===== VARTALO ===== */}
      <g className="zg-torso">
        {/* lantio / vyötärö */}
        <path d="M58 232 L102 232 L99 256 Q80 262 61 256 Z" fill="url(#zJeans)" />

        {/* paljas keltainen torso liivin alla */}
        <path d="M64 120 L96 118 L98 232 L62 234 Z" fill="url(#zSkin)" />
        {/* kylkiluut */}
        <path d="M68 150 Q80 156 92 150 M68 166 Q80 172 92 166 M69 182 Q80 188 91 182"
          stroke="#8f8340" strokeWidth="1.4" fill="none" opacity="0.55" />

        {/* nahkaliivi vasen puoli */}
        <path
          d="M56 150 Q52 128 60 116 L80 116 L78 210 Q77 226 75 238 L60 240 Q58 210 56 178 Z"
          fill="url(#zLeather)"
        />
        {/* nahkaliivi oikea puoli */}
        <path
          d="M82 116 L100 116 Q108 128 104 152 L102 210 Q100 226 98 238 L83 239 Q83 200 82 116 Z"
          fill="url(#zLeather)"
        />
        {/* liivin varjostus */}
        <path d="M90 116 Q100 150 98 210 L98 238 L85 239 Q92 190 90 116 Z"
          fill="#000000" opacity="0.4" filter="url(#zSoftShade)" />

        {/* niitit liivissä */}
        <circle cx="64" cy="140" r="1.8" fill="#c8ccd4" />
        <circle cx="64" cy="158" r="1.8" fill="#c8ccd4" />
        <circle cx="64" cy="176" r="1.8" fill="#c8ccd4" />
        <circle cx="64" cy="194" r="1.8" fill="#c8ccd4" />
        <circle cx="96" cy="140" r="1.8" fill="#c8ccd4" />
        <circle cx="96" cy="158" r="1.8" fill="#c8ccd4" />
        <circle cx="96" cy="176" r="1.8" fill="#c8ccd4" />
        <circle cx="96" cy="194" r="1.8" fill="#c8ccd4" />

        {/* veriläiskä rinnassa */}
        <ellipse cx="78" cy="180" rx="15" ry="20" fill="url(#zBloodStain)" />
      </g>

      {/* ===== HARTIAT ===== */}
      <g className="zg-shoulders">
        <path d="M52 120 Q56 106 70 104 L92 103 Q106 105 110 122 Q80 112 52 120 Z" fill="url(#zLeather)" />
      </g>

      {/* ===== KÄDET (keltainen iho + harmaat hansikkaat) ===== */}
      <g className="zg-arm-left">
        <path d="M54 122 L64 120 L61 176 L49 174 Z" fill="url(#zSkin)" />
        <path d="M49 174 L61 176 L59 212 L46 210 Z" fill="url(#zSkinDark)" />
        {/* nastaranneke */}
        <path d="M46 206 L60 208 L60 214 L46 212 Z" fill="#2a2d33" />
        <circle cx="49" cy="210" r="1.3" fill="#c8ccd4" />
        <circle cx="53" cy="210.5" r="1.3" fill="#c8ccd4" />
        <circle cx="57" cy="211" r="1.3" fill="#c8ccd4" />
        {/* hansikas */}
        <path d="M46 212 L60 214 L61 228 Q53 234 46 227 Z" fill="url(#zGloves)" />
        <path d="M47 227 L49 238 M51 229 L52 240 M55 229 L56 239 M59 227 L61 236"
          stroke="url(#zGloves)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>

      <g className="zg-arm-right">
        <path d="M96 120 L106 122 L111 174 L99 176 Z" fill="url(#zSkin)" />
        <path d="M99 176 L111 174 L114 210 L101 212 Z" fill="url(#zSkinDark)" />
        <path d="M100 206 L114 204 L114 210 L100 212 Z" fill="#2a2d33" />
        <circle cx="103" cy="209" r="1.3" fill="#c8ccd4" />
        <circle cx="107" cy="208.5" r="1.3" fill="#c8ccd4" />
        <circle cx="111" cy="208" r="1.3" fill="#c8ccd4" />
        <path d="M100 212 L114 210 L114 224 Q107 231 100 224 Z" fill="url(#zGloves)" />
        <path d="M101 224 L100 235 M105 225 L105 237 M109 224 L110 235 M113 222 L115 232"
          stroke="url(#zGloves)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </g>

      {/* ===== KAULA ===== */}
      <path className="zg-neck" d="M72 96 L89 96 L90 114 L71 114 Z" fill="url(#zSkinDark)" />

      {/* ===== PÄÄ ===== */}
      <g className="zg-head">
        {/* vihreä irokeesi takana */}
        <g className="zg-hair">
          <path d="M64 44 L58 8 L68 34 Z" fill="url(#zHair)" />
          <path d="M72 38 L70 2 L80 32 Z" fill="url(#zHair)" />
          <path d="M82 36 L86 4 L90 34 Z" fill="url(#zHair)" />
          <path d="M90 40 L100 12 L96 42 Z" fill="url(#zHair)" />
          <path d="M96 48 L110 30 L101 50 Z" fill="url(#zHair)" />
        </g>

        {/* kallo / kasvot */}
        <path
          d="M60 62 Q58 40 70 30 Q80 23 91 29 Q101 36 100 60
             Q100 74 96 84 Q92 98 80 100 Q68 99 64 86 Q60 76 60 62 Z"
          fill="url(#zSkin)"
        />

        {/* pään yläosan harmaa "kypärä"-alue + tribaalikuvio */}
        <path d="M60 62 Q58 40 70 30 Q80 23 91 29 Q101 36 100 60 Q90 50 80 50 Q68 50 60 62 Z"
          fill="#6a6f78" opacity="0.85" />
        <path d="M66 44 Q72 40 74 48 Q70 52 66 48 Z M84 42 Q90 40 90 48 Q86 52 84 46 Z
                 M74 40 Q80 36 84 42 Q80 46 76 44 Z"
          fill="#2c8a1c" opacity="0.9" />
        <path d="M70 54 Q76 50 82 54" stroke="#2c8a1c" strokeWidth="1.6" fill="none" opacity="0.8" />

        {/* poskiluu-varjo */}
        <path d="M88 32 Q99 46 97 72 Q95 90 82 99 Q94 84 92 60 Q91 42 88 32 Z"
          fill="#000000" opacity="0.3" filter="url(#zSoftShade)" />

        {/* korvatulppa/laajennin */}
        <circle cx="63" cy="78" r="4" fill="#39c11f" />
        <circle cx="63" cy="78" r="1.8" fill="#0e2a08" />

        {/* silmäkuopat */}
        <path d="M63 60 Q70 54 78 59 Q74 68 65 66 Z" fill="#1a1810" />
        <path d="M84 58 Q92 53 98 60 Q95 68 87 66 Z" fill="#1a1810" />

        {/* hehkuvat silmät */}
        <ellipse className="zg-eye" cx="70" cy="61" rx="2.8" ry="2.1" fill="#fdf6d0" filter="url(#zEyeBloom)" />
        <ellipse className="zg-eye" cx="91" cy="60" rx="2.8" ry="2.1" fill="#fdf6d0" filter="url(#zEyeBloom)" />
        {/* punaiset verisuonet silmissä */}
        <path d="M67 61 L64 59 M67 62 L64 63 M94 60 L97 58 M94 61 L97 62"
          stroke="#c22" strokeWidth="0.7" opacity="0.7" />

        {/* nenäaukko */}
        <path d="M79 66 L83 66 L81 77 Z" fill="#5a5326" />

        {/* suu — auki, hampaat */}
        <g className="zg-mouth">
          <path d="M66 84 Q80 80 94 84 Q92 97 80 99 Q68 97 66 84 Z" fill="#3a1a10" />
          <path d="M68 84 L70 90 L72 84 L74 91 L76 84 L78 90 L80 84 L82 91 L84 84 L86 90 L88 84 L90 89"
            stroke="#d8d0a8" strokeWidth="1.6" fill="none" />
          <path d="M70 96 L71 91 M76 97 L76 92 M82 97 L82 91 M88 95 L88 90"
            stroke="#c0b890" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* veri leuasta */}
        <path className="zg-drool" d="M80 98 Q82 108 81 118 Q79 109 80 98 Z" fill="url(#zBloodRun)" />
        <path d="M86 96 Q88 103 86 110" stroke="#7a0606" strokeWidth="2" fill="none" opacity="0.8" />
      </g>
    </svg>
  );
}

export default function ZombieReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('opening'); // opening | revealed | lunging
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const roarRef = useRef(null);

  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Se seisoo oviaukossa.');
        // Zombien karjaisu kerran (ei loopia) juuri kun se paljastuu hirviöksi.
      const roar = new Audio('/assets/sfx/roar.mp3');
      roar.volume = 0.7 * sfxVolume;
      roar.play().catch(() => {});
      roarRef.current = roar;
    }, 1700));

    t.push(setTimeout(() => {
      setText('Se ei ole enää ihminen.');
    }, 3600));

    t.push(setTimeout(() => {
      setPhase('lunging');
      setText('');
    }, 5400));

    t.push(setTimeout(() => {
      onComplete();
    }, 6300));

    return () => {
      t.forEach(clearTimeout);
      // Pysäytä karjaisu jos cutscene ohitetaan/poistuu kesken.
      if (roarRef.current) {
        roarRef.current.pause();
        roarRef.current.currentTime = 0;
        roarRef.current = null;
      }
    };
  }, [onComplete]);

  const zombieClass = phase === 'lunging'
    ? 'reveal-zombie lunging'
    : phase === 'revealed'
      ? 'reveal-zombie entering'
      : 'reveal-zombie';

  return (
    <div className="reveal">
      <div className={`reveal-stage ${phase === 'lunging' ? 'shaking' : ''}`}>
        <div className="reveal-frame">
          <div className="reveal-hallway">
            <div className="reveal-hallway-light" />

            <div className={zombieClass}>
              <div className="zombie-figure">
                <ZombieFigure />
              </div>
            </div>
          </div>

          <div className="reveal-door">
            <div className="reveal-handle" />
          </div>
        </div>
      </div>

      <div className="reveal-vignette" />
      <div className={`reveal-flash ${phase === 'lunging' ? 'active' : ''}`} />

      {text && (
        <div className="reveal-text-wrap">
          <p className="reveal-text">{text}</p>
        </div>
      )}
    </div>
  );
}
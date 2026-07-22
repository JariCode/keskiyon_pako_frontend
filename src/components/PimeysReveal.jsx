import { useState, useEffect, useRef } from 'react';
import './PimeysReveal.css';

function FallenZombieWoman() {
  return (
    <svg className="pimeys-svg" viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pzSkin" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#eff06a" />
          <stop offset="50%" stopColor="#cdd44a" />
          <stop offset="100%" stopColor="#9aa632" />
        </linearGradient>
        <linearGradient id="pzSkinDark" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#aeb63a" />
          <stop offset="100%" stopColor="#7c8628" />
        </linearGradient>
        <linearGradient id="pzHair" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ff5cb8" />
          <stop offset="55%" stopColor="#ec1291" />
          <stop offset="100%" stopColor="#a80869" />
        </linearGradient>
        <linearGradient id="pzDress" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#93a8b3" />
          <stop offset="55%" stopColor="#637882" />
          <stop offset="100%" stopColor="#3d4c55" />
        </linearGradient>
        <linearGradient id="pzDressDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#556570" />
          <stop offset="100%" stopColor="#333f47" />
        </linearGradient>
        <radialGradient id="pzBloodStain" cx="0.45" cy="0.5">
          <stop offset="0%" stopColor="#a80c0c" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#6e0606" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3a0202" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pzBloodRun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a0808" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#5a0404" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3a0202" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pzBeam" cx="0.82" cy="0.5">
          <stop offset="0%" stopColor="#fff4c8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ffe08a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
        <filter id="pzSoft"><feGaussianBlur stdDeviation="1.4" /></filter>
        <filter id="pzEyeBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ===== VERILAMMIKKO ===== */}
      <g className="pz-blood">
        <ellipse cx="220" cy="188" rx="150" ry="44" fill="url(#pzBloodStain)" />
        <ellipse cx="180" cy="196" rx="70" ry="22" fill="#4a0000" opacity="0.7" />
        {/* roiskeet */}
        <ellipse cx="120" cy="180" rx="14" ry="6" fill="#5a0000" opacity="0.7" />
        <ellipse cx="330" cy="196" rx="18" ry="7" fill="#5a0000" opacity="0.6" />
        <ellipse cx="270" cy="210" rx="10" ry="4" fill="#6a0000" opacity="0.6" />
      </g>

      {/* ===== KAATUNUT ZOMBIE-NAINEN (makaa selällään, pää vasemmalla) ===== */}

      {/* takajalka */}
      <g>
        <path d="M250 158 Q290 150 328 150 L332 168 Q292 170 252 176 Z" fill="url(#pzDressDark)" />
        <path d="M326 150 L344 146 Q350 150 348 160 L330 166 Z" fill="url(#pzSkinDark)" />
        <ellipse cx="345" cy="154" rx="7" ry="6" fill="url(#pzSkinDark)" />
      </g>
      {/* etujalka (koukussa) */}
      <g>
        <path d="M252 168 Q286 168 316 178 L348 196 L342 208 L312 192 Q284 182 250 182 Z" fill="url(#pzDress)" />
        <path d="M344 196 L360 202 Q364 208 358 214 L342 208 Z" fill="url(#pzSkinDark)" />
        <ellipse cx="358" cy="206" rx="7" ry="6" fill="url(#pzSkinDark)" />
      </g>

      {/* mekon helma (revitty, siniharmaa) */}
      <g>
        <path d="M196 150 Q244 138 262 150 Q266 170 258 186 Q244 196 214 194 Q198 190 192 172 Z" fill="url(#pzDress)" />
        {/* helman revitty reuna */}
        <path d="M214 190 L220 198 L226 190 L232 199 L238 190 L244 198 L250 190"
          stroke="#3d4c55" strokeWidth="2" fill="none" />
        {/* varjostus */}
        <path d="M244 150 Q258 166 256 186 Q248 192 238 193 Q252 174 244 150 Z"
          fill="#000000" opacity="0.28" filter="url(#pzSoft)" />
      </g>

      {/* ylävartalo / mekon yläosa */}
      <g>
        <path d="M168 154 Q198 144 216 150 L214 182 Q196 188 172 184 Z" fill="url(#pzDress)" />
        {/* revitty kohta josta iho + veri näkyy */}
        <path d="M196 156 Q206 154 212 158 L210 172 Q200 174 194 170 Z" fill="url(#pzSkin)" />
        <path d="M198 160 Q204 158 208 162 Q204 166 199 165 Z" fill="#7a0000" opacity="0.65" />
      </g>

      {/* vasen käsivarsi (ylös levällään, kohti katsojaa) */}
      <g>
        <path d="M182 158 Q166 138 150 122 L160 114 Q178 132 192 152 Z" fill="url(#pzSkin)" />
        <path d="M150 122 Q144 116 148 110 L158 112 Q160 118 158 122 Z" fill="url(#pzSkinDark)" />
        {/* käsi */}
        <ellipse cx="150" cy="115" rx="8" ry="7" fill="url(#pzSkin)" />
        <path d="M144 112 L140 106 M148 110 L146 103 M152 110 L152 103 M156 112 L159 106"
          stroke="url(#pzSkinDark)" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* oikea käsivarsi (sivulle, veressä) */}
      <g>
        <path d="M186 176 Q166 188 150 200 L156 210 Q174 198 192 186 Z" fill="url(#pzSkinDark)" />
        <ellipse cx="150" cy="204" rx="7" ry="6" fill="url(#pzSkinDark)" />
      </g>

      {/* kaula */}
      <path d="M166 156 Q176 152 182 156 L180 168 Q172 170 166 166 Z" fill="url(#pzSkinDark)" />

      {/* ===== PÄÄ ===== */}
      <g>
        {/* pinkki tukka takana (leviää maahan) */}
        <path d="M132 150 Q120 128 138 126 Q128 140 138 152 Q124 150 132 168
                 Q120 166 126 180 Q116 172 122 158 Q112 150 122 138
                 Q116 128 130 126 Q124 138 132 150 Z" fill="url(#pzHair)" />
        <path d="M118 152 Q108 158 112 168 Q116 160 122 160 Z" fill="url(#pzHair)" />

        {/* kasvot (kallomainen zombie) */}
        <path d="M138 142 Q158 134 172 144 Q180 152 178 164
                 Q176 176 164 180 Q150 182 142 172 Q134 160 138 142 Z" fill="url(#pzSkin)" />
        {/* poskivarjo */}
        <path d="M168 142 Q180 152 177 168 Q174 178 164 180 Q174 166 170 150 Q168 144 168 142 Z"
          fill="#000000" opacity="0.25" filter="url(#pzSoft)" />

        {/* etutukka otsalla */}
        <path d="M138 144 Q142 132 156 132 Q170 133 174 144 Q164 138 152 140 Q142 142 138 150 Z" fill="url(#pzHair)" />
        <path d="M140 144 Q146 136 156 137 Q150 139 144 143 Z" fill="#ff8cd0" opacity="0.6" />

        {/* silmä kiinni (kuollut) - viiva */}
        <path d="M146 158 L156 157" stroke="#5a3a10" strokeWidth="1.8" strokeLinecap="round" />
        {/* toinen silmä raollaan, himmeä hehku */}
        <ellipse className="pz-eye" cx="166" cy="156" rx="3" ry="2.2" fill="#f4f0c0" filter="url(#pzEyeBloom)" opacity="0.85" />

        {/* nenäaukko */}
        <path d="M158 162 L162 162 L160 168 Z" fill="#6a5a20" opacity="0.7" />

        {/* suu auki (zombie), hampaat */}
        <path d="M146 170 Q156 174 168 170 Q164 178 156 179 Q149 178 146 170 Z" fill="#3a1010" />
        <path d="M149 171 L150 175 M154 172 L154 176 M159 172 L159 176 M164 171 L163 175"
          stroke="#d8d0a0" strokeWidth="1.2" />

        {/* veri suusta valuen maahan */}
        <path d="M156 179 Q159 190 156 200 Q153 190 156 179 Z" fill="url(#pzBloodRun)" />
      </g>

      {/* ===== TASKULAMPPU + VALOKEILA ===== */}
      <g className="pz-lamp">
        <ellipse className="pz-beam" cx="310" cy="214" rx="95" ry="42" fill="url(#pzBeam)" />
        <rect x="372" y="206" width="42" height="16" rx="3" fill="#2a2a30" stroke="#5a5a64" strokeWidth="1.2" />
        <rect x="364" y="204" width="11" height="20" rx="2" fill="#454550" />
        <circle cx="362" cy="214" r="7" fill="#ffe08a" />
        <circle cx="362" cy="214" r="3" fill="#fff6d8" />
      </g>
    </svg>
  );
}

export default function PimeysReveal({ onComplete, sfxVolume = 1 }) {
  const [phase, setPhase] = useState('darkening');
  const [text, setText] = useState('');
  const timersRef = useRef([]);
  const shortcircuitRef = useRef(null);

  useEffect(() => {
    const t = timersRef.current;

    t.push(setTimeout(() => setText('Valot sammuivat. Sähkö katkeaa.'), 900));
    t.push(setTimeout(() => {
      setPhase('revealed');
      setText('Se ei enää liiku.');
    }, 2000));
    t.push(setTimeout(() => setText('Vain taskulamppu valaisee pimeyttä.'), 3300));
    t.push(setTimeout(() => {
      setPhase('fading');
      setText('');
    }, 4400));
    t.push(setTimeout(() => onComplete(), 5000));

    return () => t.forEach(clearTimeout);
  }, [onComplete]);

  // Sähkökatko-efektin ääni
  useEffect(() => {
    const audio = new Audio('/assets/sfx/shortcircuit.mp3');
    audio.volume = 0.6 * sfxVolume;
    audio.play().catch(() => {});
    shortcircuitRef.current = audio;

    return () => {
      if (shortcircuitRef.current) {
        shortcircuitRef.current.pause();
        shortcircuitRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`pimeys pimeys-${phase}`}>
      <div className="pimeys-dark" />
      <div className="pimeys-scene">
        <FallenZombieWoman />
      </div>
      {text && (
        <div className="pimeys-text-wrap">
          <p className="pimeys-text">{text}</p>
        </div>
      )}
      <div className="pimeys-vignette" />
    </div>
  );
}
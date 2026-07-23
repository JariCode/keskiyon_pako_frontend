import { useState, useEffect, useRef } from 'react';
import './KirkkoReveal.css';

/* ============================================================
   Zombie-hahmot. Jokainen vastaa pelin omaa spritesheettiä:
   mies, nainen, cabinZombie, mohikaani, miniZombie.
   Kaikki piirretään samassa 160x400 koordinaatistossa, jotta
   niitä voi skaalata keskenään vertailukelpoisesti.
   ============================================================ */

// --- MIES: vihreä iho, ruskea paita, siniset repaleiset housut ---
function MiesZombie() {
  return (
    <svg className="kz-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mSkin" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#9db87a" />
          <stop offset="55%" stopColor="#7a9659" />
          <stop offset="100%" stopColor="#4e6437" />
        </linearGradient>
        <linearGradient id="mSkinDark" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#6c8a4c" />
          <stop offset="100%" stopColor="#3e5229" />
        </linearGradient>
        <linearGradient id="mShirt" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#8a6440" />
          <stop offset="55%" stopColor="#63462b" />
          <stop offset="100%" stopColor="#3a2818" />
        </linearGradient>
        <linearGradient id="mPants" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#3a5f9e" />
          <stop offset="55%" stopColor="#26437a" />
          <stop offset="100%" stopColor="#152744" />
        </linearGradient>
        <filter id="mShade"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="mBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* jalat + repaleiset housunlahkeet */}
      <g className="kz-leg-l">
        <path d="M62 250 L76 250 L74 320 L58 322 Z" fill="url(#mPants)" />
        <path d="M58 322 L74 320 L72 330 L66 326 L62 332 L57 328 Z" fill="url(#mPants)" />
        <path d="M60 330 L72 330 L70 352 L59 352 Z" fill="url(#mSkinDark)" />
        <path d="M56 352 L71 352 L75 364 L53 364 Q53 357 56 352 Z" fill="url(#mSkinDark)" />
      </g>
      <g className="kz-leg-r">
        <path d="M84 250 L98 250 L101 322 L86 320 Z" fill="url(#mPants)" />
        <path d="M86 320 L101 322 L102 330 L96 326 L92 332 L87 328 Z" fill="url(#mPants)" />
        <path d="M88 330 L100 330 L101 352 L90 352 Z" fill="url(#mSkinDark)" />
        <path d="M89 352 L104 352 L107 364 L85 364 Q86 357 89 352 Z" fill="url(#mSkinDark)" />
      </g>

      {/* torso: ruskea paita */}
      <g className="kz-torso">
        <path d="M58 124 L102 122 Q108 190 100 254 L60 256 Q52 190 58 124 Z" fill="url(#mShirt)" />
        <path d="M88 124 Q96 190 92 250 L100 252 Q108 190 102 124 Z" fill="#000" opacity="0.3" filter="url(#mShade)" />
        {/* repeämä paidassa */}
        <path d="M66 200 L74 194 L70 214 L62 210 Z" fill="url(#mSkinDark)" opacity="0.8" />
      </g>

      {/* hartiat */}
      <path d="M56 126 Q60 110 72 108 L90 107 Q102 109 106 128 Q80 118 56 126 Z" fill="url(#mShirt)" />

      {/* kädet ojossa eteenpäin */}
      <g className="kz-arm-l">
        <path d="M56 128 L68 126 L60 186 L46 184 Z" fill="url(#mShirt)" />
        <path d="M46 184 L60 186 L56 226 L42 224 Z" fill="url(#mSkin)" />
        <path d="M42 220 L56 224 Q50 234 42 230 Z" fill="url(#mSkin)" />
      </g>
      <g className="kz-arm-r">
        <path d="M92 126 L104 128 L114 184 L100 186 Z" fill="url(#mShirt)" />
        <path d="M100 186 L114 184 L118 224 L104 226 Z" fill="url(#mSkin)" />
        <path d="M104 220 L118 224 Q112 234 104 230 Z" fill="url(#mSkin)" />
      </g>

      {/* kaula */}
      <path d="M72 98 L89 98 L90 116 L71 116 Z" fill="url(#mSkinDark)" />

      {/* pää */}
      <g className="kz-head">
        <path d="M60 62 Q58 38 71 29 Q81 22 92 29 Q102 37 101 62 Q101 78 96 88 Q91 102 80 103 Q68 102 64 88 Q60 78 60 62 Z" fill="url(#mSkin)" />
        <path d="M89 31 Q100 46 98 74 Q96 92 83 102 Q95 86 93 60 Q92 42 89 31 Z" fill="#000" opacity="0.28" filter="url(#mShade)" />
        {/* ompeleet otsassa */}
        <path d="M66 42 L78 39" stroke="#3e5229" strokeWidth="1.6" />
        <path d="M68 39 L68 45 M72 38 L72 44 M76 38 L76 43" stroke="#3e5229" strokeWidth="1.2" />
        {/* silmäkuopat + hehkuvat silmät */}
        <path d="M63 60 Q70 54 79 59 Q75 69 65 67 Z" fill="#1d2414" />
        <path d="M85 58 Q93 53 99 60 Q96 69 88 67 Z" fill="#1d2414" />
        <ellipse className="kz-eye" cx="70" cy="61" rx="3" ry="2.2" fill="#eaf7c0" filter="url(#mBloom)" />
        <ellipse className="kz-eye" cx="92" cy="60" rx="3" ry="2.2" fill="#eaf7c0" filter="url(#mBloom)" />
        {/* nenä */}
        <path d="M79 66 L84 66 L81 78 Z" fill="#41552c" />
        {/* auki oleva suu, keltaiset hampaat */}
        <g className="kz-mouth">
          <path d="M66 85 Q80 81 95 85 Q93 100 80 102 Q68 100 66 85 Z" fill="#2e1a12" />
          <path d="M69 86 L71 92 L74 86 L77 93 L80 86 L83 92 L86 86 L89 92 L92 86"
            stroke="#cbbf6a" strokeWidth="1.8" fill="none" />
        </g>
      </g>
    </svg>
  );
}

// --- NAINEN: poninhäntä, punainen mekko, veriset tahrat ---
function NainenZombie() {
  return (
    <svg className="kz-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nSkin2" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#cfc9a4" />
          <stop offset="55%" stopColor="#b0a982" />
          <stop offset="100%" stopColor="#7a7455" />
        </linearGradient>
        <linearGradient id="nSkinD2" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#a8a17c" />
          <stop offset="100%" stopColor="#6b6549" />
        </linearGradient>
        <linearGradient id="nSkirt" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#9e2230" />
          <stop offset="55%" stopColor="#6f141f" />
          <stop offset="100%" stopColor="#3d0a10" />
        </linearGradient>
        <linearGradient id="nTop" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#b0a06a" />
          <stop offset="55%" stopColor="#8a7c4e" />
          <stop offset="100%" stopColor="#544b2c" />
        </linearGradient>
        <linearGradient id="nHair2" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#2a2118" />
          <stop offset="55%" stopColor="#171009" />
          <stop offset="100%" stopColor="#0a0603" />
        </linearGradient>
        <radialGradient id="nBlood2" cx="0.4" cy="0.3">
          <stop offset="0%" stopColor="#a80c0c" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#6e0606" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4a0303" stopOpacity="0" />
        </radialGradient>
        <filter id="nShade2"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="nBloom2" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* paljaat sääret */}
      <g className="kz-leg-l">
        <path d="M64 290 L76 290 L74 348 L60 350 Z" fill="url(#nSkinD2)" />
        <path d="M58 350 L74 348 L78 362 L55 362 Q55 356 58 350 Z" fill="url(#nSkinD2)" />
      </g>
      <g className="kz-leg-r">
        <path d="M84 290 L96 290 L100 350 L86 348 Z" fill="url(#nSkinD2)" />
        <path d="M86 348 L100 350 L104 362 L82 362 Q83 356 86 348 Z" fill="url(#nSkinD2)" />
      </g>

      {/* repaleinen punainen hame */}
      <g className="kz-torso">
        <path d="M56 218 L104 218 Q112 262 98 296 L62 296 Q48 262 56 218 Z" fill="url(#nSkirt)" />
        <path d="M64 288 L70 280 L68 296 L60 296 Z" fill="#3d0a10" />
        <path d="M96 286 L90 278 L92 296 L100 296 Z" fill="#3d0a10" />
        <path d="M78 292 L83 282 L85 296 L75 296 Z" fill="#3d0a10" />
        <path d="M92 218 Q102 258 94 292 L98 294 Q112 260 104 218 Z" fill="#000" opacity="0.25" filter="url(#nShade2)" />

        {/* yläosa, verinen paita */}
        <path d="M58 122 L102 120 Q106 172 102 220 L58 222 Q54 172 58 122 Z" fill="url(#nTop)" />
        <ellipse cx="74" cy="160" rx="13" ry="17" fill="url(#nBlood2)" />
        <ellipse cx="92" cy="188" rx="9" ry="12" fill="url(#nBlood2)" />
        <path d="M90 122 Q98 170 94 218 L102 220 Q106 172 102 120 Z" fill="#000" opacity="0.28" filter="url(#nShade2)" />
      </g>

      {/* hartiat */}
      <path d="M56 124 Q60 108 72 106 L90 105 Q102 107 106 126 Q80 116 56 124 Z" fill="url(#nTop)" />

      {/* paljaat kädet ojossa */}
      <g className="kz-arm-l">
        <path d="M56 126 L67 124 L61 182 L48 180 Z" fill="url(#nSkin2)" />
        <path d="M48 180 L61 182 L57 220 L44 218 Z" fill="url(#nSkinD2)" />
        <path d="M44 214 L57 218 Q51 227 44 224 Z" fill="url(#nSkinD2)" />
      </g>
      <g className="kz-arm-r">
        <path d="M93 124 L104 126 L112 180 L99 182 Z" fill="url(#nSkin2)" />
        <path d="M99 182 L112 180 L116 218 L103 220 Z" fill="url(#nSkinD2)" />
        <path d="M103 214 L116 218 Q110 227 103 224 Z" fill="url(#nSkinD2)" />
      </g>

      {/* kaula */}
      <path d="M72 96 L89 96 L90 114 L71 114 Z" fill="url(#nSkinD2)" />

      {/* pää + poninhäntä */}
      <g className="kz-head">
        {/* poninhäntä taakse */}
        <g className="kz-hair">
          <path d="M56 44 Q34 36 24 52 Q38 50 44 60 Q30 62 26 76 Q42 68 54 74 Q50 58 56 44 Z" fill="url(#nHair2)" />
          <circle cx="58" cy="42" r="4" fill="#c8a63a" />
        </g>
        {/* hiukset kallon päällä */}
        <path d="M59 56 Q58 30 72 24 Q84 19 94 27 Q102 34 101 54 Q92 36 76 38 Q64 40 59 56 Z" fill="url(#nHair2)" />

        <path d="M60 62 Q58 40 71 31 Q81 24 92 31 Q101 39 100 62 Q100 77 96 87 Q91 100 80 101 Q68 100 64 87 Q60 77 60 62 Z" fill="url(#nSkin2)" />
        <path d="M88 33 Q99 47 97 74 Q95 91 82 100 Q94 85 92 60 Q91 43 88 33 Z" fill="#000" opacity="0.28" filter="url(#nShade2)" />

        <path d="M63 60 Q70 54 78 59 Q74 68 65 66 Z" fill="#241f14" />
        <path d="M84 58 Q92 53 98 60 Q95 68 87 66 Z" fill="#241f14" />
        <ellipse className="kz-eye" cx="70" cy="61" rx="2.9" ry="2.2" fill="#fdf6d0" filter="url(#nBloom2)" />
        <ellipse className="kz-eye" cx="91" cy="60" rx="2.9" ry="2.2" fill="#fdf6d0" filter="url(#nBloom2)" />
        <path d="M79 66 L83 66 L81 77 Z" fill="#6b6549" />
        <g className="kz-mouth">
          <path d="M66 84 Q80 80 94 84 Q92 98 80 100 Q68 98 66 84 Z" fill="#3a1a12" />
          <path d="M69 85 L71 91 L74 85 L77 92 L80 85 L83 91 L86 85 L89 91 L92 85"
            stroke="#cbbf6a" strokeWidth="1.7" fill="none" />
        </g>
      </g>
    </svg>
  );
}

// --- CABIN ZOMBIE: vihreä iho, sinishortsit, paljas ylävartalo ---
function CabinZombie() {
  return (
    <svg className="kz-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cSkin" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#93b183" />
          <stop offset="55%" stopColor="#6f8f62" />
          <stop offset="100%" stopColor="#455c3c" />
        </linearGradient>
        <linearGradient id="cSkinD" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#63845a" />
          <stop offset="100%" stopColor="#374a2f" />
        </linearGradient>
        <linearGradient id="cShorts" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#2f6fbf" />
          <stop offset="55%" stopColor="#1f4c8a" />
          <stop offset="100%" stopColor="#112b4f" />
        </linearGradient>
        <filter id="cShade"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="cBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g className="kz-leg-l">
        <path d="M62 256 L78 256 L76 300 L58 302 Z" fill="url(#cShorts)" />
        <path d="M58 302 L76 300 L74 348 L60 350 Z" fill="url(#cSkinD)" />
        <path d="M56 350 L74 348 L78 362 L53 362 Q54 356 56 350 Z" fill="url(#cSkinD)" />
      </g>
      <g className="kz-leg-r">
        <path d="M82 256 L98 256 L102 302 L84 300 Z" fill="url(#cShorts)" />
        <path d="M84 300 L102 302 L100 350 L86 348 Z" fill="url(#cSkinD)" />
        <path d="M86 348 L104 350 L107 362 L82 362 Q83 356 86 348 Z" fill="url(#cSkinD)" />
      </g>

      {/* paljas vihreä torso, kylkiluut näkyvissä */}
      <g className="kz-torso">
        <path d="M58 122 L102 120 Q108 190 100 260 L60 262 Q52 190 58 122 Z" fill="url(#cSkin)" />
        <g stroke="#3c5133" strokeWidth="1.6" opacity="0.6" fill="none">
          <path d="M66 158 Q80 152 94 158" />
          <path d="M66 176 Q80 170 94 176" />
          <path d="M68 194 Q80 189 92 194" />
        </g>
        <path d="M88 122 Q96 190 92 256 L100 258 Q108 190 102 120 Z" fill="#000" opacity="0.28" filter="url(#cShade)" />
      </g>

      <path d="M56 124 Q60 108 72 106 L90 105 Q102 107 106 126 Q80 116 56 124 Z" fill="url(#cSkin)" />

      <g className="kz-arm-l">
        <path d="M56 126 L68 124 L60 184 L46 182 Z" fill="url(#cSkin)" />
        <path d="M46 182 L60 184 L56 224 L42 222 Z" fill="url(#cSkinD)" />
        <path d="M42 218 L56 222 Q50 232 42 228 Z" fill="url(#cSkinD)" />
      </g>
      <g className="kz-arm-r">
        <path d="M92 124 L104 126 L114 182 L100 184 Z" fill="url(#cSkin)" />
        <path d="M100 184 L114 182 L118 222 L104 224 Z" fill="url(#cSkinD)" />
        <path d="M104 218 L118 222 Q112 232 104 228 Z" fill="url(#cSkinD)" />
      </g>

      <path d="M72 98 L89 98 L90 116 L71 116 Z" fill="url(#cSkinD)" />

      <g className="kz-head">
        <path d="M60 62 Q58 38 71 29 Q81 22 92 29 Q102 37 101 62 Q101 78 96 88 Q91 102 80 103 Q68 102 64 88 Q60 78 60 62 Z" fill="url(#cSkin)" />
        <path d="M89 31 Q100 46 98 74 Q96 92 83 102 Q95 86 93 60 Q92 42 89 31 Z" fill="#000" opacity="0.28" filter="url(#cShade)" />
        {/* pistokset / karvatupsut päälaella */}
        <g stroke="#2e3f26" strokeWidth="1.4">
          <path d="M68 26 L66 20" /><path d="M76 23 L75 17" /><path d="M85 24 L87 18" /><path d="M93 30 L96 25" />
        </g>
        <path d="M63 60 Q70 54 79 59 Q75 69 65 67 Z" fill="#1d2414" />
        <path d="M85 58 Q93 53 99 60 Q96 69 88 67 Z" fill="#1d2414" />
        <ellipse className="kz-eye" cx="70" cy="61" rx="3" ry="2.2" fill="#eaf7c0" filter="url(#cBloom)" />
        <ellipse className="kz-eye" cx="92" cy="60" rx="3" ry="2.2" fill="#eaf7c0" filter="url(#cBloom)" />
        <path d="M79 66 L84 66 L81 78 Z" fill="#3c5133" />
        <g className="kz-mouth">
          <path d="M66 85 Q80 81 95 85 Q93 100 80 102 Q68 100 66 85 Z" fill="#2e1a12" />
          <path d="M69 86 L71 92 L74 86 L77 93 L80 86 L83 92 L86 86 L89 92 L92 86"
            stroke="#cbbf6a" strokeWidth="1.8" fill="none" />
        </g>
      </g>
    </svg>
  );
}

// --- MOHIKAANI: vaaleanpunainen mohikaani, raidallinen paita, luu kädessä ---
function MohikaaniZombie() {
  return (
    <svg className="kz-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moSkin" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#8fb0a6" />
          <stop offset="55%" stopColor="#6a8e84" />
          <stop offset="100%" stopColor="#425c55" />
        </linearGradient>
        <linearGradient id="moSkinD" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#5f8279" />
          <stop offset="100%" stopColor="#354a45" />
        </linearGradient>
        <linearGradient id="moPants" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#4a4f52" />
          <stop offset="55%" stopColor="#31363a" />
          <stop offset="100%" stopColor="#1b1e21" />
        </linearGradient>
        <linearGradient id="moHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a0a8" />
          <stop offset="60%" stopColor="#c67680" />
          <stop offset="100%" stopColor="#8e4a54" />
        </linearGradient>
        <filter id="moShade"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="moBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g className="kz-leg-l">
        <path d="M62 252 L78 252 L76 312 L58 314 Z" fill="url(#moPants)" />
        <path d="M58 314 L76 312 L74 348 L60 350 Z" fill="url(#moSkinD)" />
        <path d="M56 350 L74 348 L78 362 L53 362 Q54 356 56 350 Z" fill="#d8d4c0" />
      </g>
      <g className="kz-leg-r">
        <path d="M82 252 L98 252 L102 314 L84 312 Z" fill="url(#moPants)" />
        <path d="M84 312 L102 314 L100 350 L86 348 Z" fill="url(#moSkinD)" />
        <path d="M86 348 L104 350 L107 362 L82 362 Q83 356 86 348 Z" fill="#d8d4c0" />
      </g>

      {/* raidallinen paita */}
      <g className="kz-torso">
        <path d="M58 122 L102 120 Q108 190 100 254 L60 256 Q52 190 58 122 Z" fill="#e8e6dc" />
        <g fill="#123540">
          <path d="M57 136 L103 134 L103 148 L57 150 Z" />
          <path d="M57 162 L104 160 L104 174 L57 176 Z" />
          <path d="M58 188 L104 186 L104 200 L58 202 Z" />
          <path d="M59 214 L103 212 L103 226 L59 228 Z" />
        </g>
        <path d="M88 122 Q96 190 92 250 L100 252 Q108 190 102 120 Z" fill="#000" opacity="0.25" filter="url(#moShade)" />
      </g>

      <path d="M56 124 Q60 108 72 106 L90 105 Q102 107 106 126 Q80 116 56 124 Z" fill="#e8e6dc" />

      {/* vasen käsi: luu työntyy esiin kyynärvarresta */}
      <g className="kz-arm-l">
        <path d="M56 126 L68 124 L60 184 L46 182 Z" fill="url(#moSkin)" />
        <path d="M46 182 L60 184 L56 218 L42 216 Z" fill="url(#moSkinD)" />
        <g>
          <rect x="36" y="206" width="26" height="7" rx="3.5" fill="#efe9d6" transform="rotate(-12 49 209)" />
          <circle cx="36" cy="211" r="5" fill="#efe9d6" />
          <circle cx="61" cy="206" r="4.5" fill="#efe9d6" />
        </g>
      </g>
      <g className="kz-arm-r">
        <path d="M92 124 L104 126 L114 182 L100 184 Z" fill="url(#moSkin)" />
        <path d="M100 184 L114 182 L118 222 L104 224 Z" fill="url(#moSkinD)" />
        <path d="M104 218 L118 222 Q112 232 104 228 Z" fill="url(#moSkinD)" />
      </g>

      <path d="M72 98 L89 98 L90 116 L71 116 Z" fill="url(#moSkinD)" />

      <g className="kz-head">
        {/* mohikaani-harja */}
        <g className="kz-hair">
          <path d="M64 34 Q68 12 74 8 Q76 20 78 30 Q82 12 86 8 Q88 20 90 30 Q94 16 98 14 Q98 28 96 40 Q80 30 64 34 Z" fill="url(#moHair)" />
        </g>
        <path d="M60 62 Q58 40 71 31 Q81 24 92 31 Q101 39 100 62 Q100 77 96 87 Q91 100 80 101 Q68 100 64 87 Q60 77 60 62 Z" fill="url(#moSkin)" />
        <path d="M88 33 Q99 47 97 74 Q95 91 82 100 Q94 85 92 60 Q91 43 88 33 Z" fill="#000" opacity="0.26" filter="url(#moShade)" />

        <path d="M63 60 Q70 54 79 59 Q75 69 65 67 Z" fill="#1a2422" />
        <path d="M85 58 Q93 53 99 60 Q96 69 88 67 Z" fill="#1a2422" />
        <ellipse className="kz-eye" cx="70" cy="61" rx="3" ry="2.2" fill="#e6f4ff" filter="url(#moBloom)" />
        <ellipse className="kz-eye" cx="92" cy="60" rx="3" ry="2.2" fill="#e6f4ff" filter="url(#moBloom)" />
        <path d="M79 66 L84 66 L81 78 Z" fill="#3a5049" />
        <g className="kz-mouth">
          <path d="M66 85 Q80 81 95 85 Q93 100 80 102 Q68 100 66 85 Z" fill="#2b1712" />
          <path d="M69 86 L71 92 L74 86 L77 93 L80 86 L83 92 L86 86 L89 92 L92 86"
            stroke="#cbbf6a" strokeWidth="1.8" fill="none" />
        </g>
      </g>
    </svg>
  );
}

// --- MINI ZOMBIE: pienempi, kumarampi, tummempi ---
function MiniZombie() {
  return (
    <svg className="kz-svg" viewBox="0 0 160 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="miSkin" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#7d9668" />
          <stop offset="55%" stopColor="#5c7550" />
          <stop offset="100%" stopColor="#374a2f" />
        </linearGradient>
        <linearGradient id="miCloth" x1="0.15" y1="0" x2="0.95" y2="1">
          <stop offset="0%" stopColor="#4a4230" />
          <stop offset="55%" stopColor="#332d20" />
          <stop offset="100%" stopColor="#1a1710" />
        </linearGradient>
        <filter id="miShade"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="miBloom" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* lyhyemmät jalat, matalampi hahmo */}
      <g className="kz-leg-l">
        <path d="M64 268 L78 268 L76 330 L61 332 Z" fill="url(#miCloth)" />
        <path d="M59 332 L76 330 L79 344 L56 344 Q56 338 59 332 Z" fill="url(#miSkin)" />
      </g>
      <g className="kz-leg-r">
        <path d="M84 268 L98 268 L100 332 L85 330 Z" fill="url(#miCloth)" />
        <path d="M85 330 L100 332 L103 344 L81 344 Q82 338 85 330 Z" fill="url(#miSkin)" />
      </g>

      <g className="kz-torso">
        <path d="M60 150 L102 148 Q108 210 100 272 L62 274 Q54 210 60 150 Z" fill="url(#miCloth)" />
        <path d="M88 150 Q96 210 92 268 L100 270 Q108 210 102 148 Z" fill="#000" opacity="0.3" filter="url(#miShade)" />
        <path d="M68 220 L76 214 L72 234 L64 230 Z" fill="url(#miSkin)" opacity="0.7" />
      </g>

      <path d="M58 152 Q62 138 74 136 L90 135 Q102 137 106 154 Q82 145 58 152 Z" fill="url(#miCloth)" />

      {/* lyhyet kädet, roikkuvat */}
      <g className="kz-arm-l">
        <path d="M58 154 L69 152 L62 202 L50 200 Z" fill="url(#miCloth)" />
        <path d="M50 200 L62 202 L59 234 L47 232 Z" fill="url(#miSkin)" />
        <path d="M47 228 L59 232 Q54 240 47 237 Z" fill="url(#miSkin)" />
      </g>
      <g className="kz-arm-r">
        <path d="M92 152 L103 154 L111 200 L99 202 Z" fill="url(#miCloth)" />
        <path d="M99 202 L111 200 L114 232 L102 234 Z" fill="url(#miSkin)" />
        <path d="M102 228 L114 232 Q109 240 102 237 Z" fill="url(#miSkin)" />
      </g>

      <path d="M73 128 L88 128 L89 144 L72 144 Z" fill="url(#miSkin)" />

      {/* suhteessa isompi pää */}
      <g className="kz-head">
        <path d="M58 84 Q56 56 71 46 Q81 39 92 46 Q104 55 102 84 Q102 102 97 112 Q91 128 80 129 Q67 128 63 112 Q58 102 58 84 Z" fill="url(#miSkin)" />
        <path d="M89 48 Q101 64 99 96 Q97 116 83 128 Q96 110 94 82 Q93 62 89 48 Z" fill="#000" opacity="0.3" filter="url(#miShade)" />
        <path d="M61 82 Q69 74 79 80 Q74 92 63 90 Z" fill="#151c10" />
        <path d="M85 80 Q94 74 101 82 Q97 92 88 90 Z" fill="#151c10" />
        <ellipse className="kz-eye" cx="69" cy="83" rx="3.4" ry="2.6" fill="#dff2b8" filter="url(#miBloom)" />
        <ellipse className="kz-eye" cx="93" cy="82" rx="3.4" ry="2.6" fill="#dff2b8" filter="url(#miBloom)" />
        <path d="M78 89 L84 89 L81 102 Z" fill="#2e3f26" />
        <g className="kz-mouth">
          <path d="M64 110 Q80 105 96 110 Q94 126 80 128 Q66 126 64 110 Z" fill="#25130d" />
          <path d="M68 111 L70 118 L74 111 L77 119 L80 111 L84 118 L87 111 L90 118 L93 111"
            stroke="#cbbf6a" strokeWidth="1.9" fill="none" />
        </g>
      </g>
    </svg>
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

      {/* Ruusuikkuna takaseinällä */}
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

      {/* Gotiikkaholvi */}
      <path d="M225 300 L245 140 Q245 78 320 72 Q395 78 395 140 L415 300 Z" fill="#06060a" />
      <path d="M225 300 L245 140 Q245 78 320 72 Q395 78 395 140 L415 300"
        fill="none" stroke="#050508" strokeWidth="3" opacity="0.9" />

      <g stroke="#0a0a0d" strokeWidth="2" fill="none" opacity="0.7">
        <path d="M150 90 Q320 20 490 90" />
        <path d="M180 110 Q320 55 460 110" />
      </g>

      {/* Sivuikkunat */}
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

      {/* Kivilattia */}
      <rect x="0" y="300" width="640" height="120" fill="url(#kiFloor)" />
      <g stroke="#000000" strokeWidth="1.5" opacity="0.5">
        <line x1="0" y1="330" x2="640" y2="326" />
        <line x1="0" y1="365" x2="640" y2="362" />
        <line x1="0" y1="398" x2="640" y2="396" />
      </g>

      {/* Alttari + risti + kynttilät */}
      <g>
        <rect x="295" y="230" width="50" height="26" fill="#17171b" stroke="#0a0a0c" strokeWidth="1.5" />
        <rect x="303" y="215" width="34" height="10" fill="#1c1c21" />
        <rect x="316" y="150" width="8" height="60" fill="#2a2a2f" />
        <rect x="298" y="172" width="44" height="8" fill="#2a2a2f" />
        <circle cx="320" cy="150" r="5" fill="#8899cc" opacity="0.7" filter="url(#kiSoftGlow)" />
        <rect x="300" y="220" width="3" height="10" fill="#d8c896" />
        <rect x="337" y="220" width="3" height="10" fill="#d8c896" />
        <circle className="kirk-candle" cx="301.5" cy="219" r="2" fill="#ffcf7a" />
        <circle className="kirk-candle" cx="338.5" cy="219" r="2" fill="#ffcf7a" />
      </g>

      {/* Penkkirivit */}
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

      {/* Zombiet: yksi kutakin pelin spritesheet-tyyppiä */}
      <g className={`kirk-zombies ${phase === 'revealed' || phase === 'lunging' ? 'kirk-zombies-show' : ''}`}>
        <g transform="translate(196, 178) scale(0.33)"><g className="kirk-zfig kirk-zfig-1"><MiesZombie /></g></g>
        <g transform="translate(358, 184) scale(0.33)"><g className="kirk-zfig kirk-zfig-2"><NainenZombie /></g></g>
        <g transform="translate(280, 162) scale(0.36)"><g className="kirk-zfig kirk-zfig-3"><MohikaaniZombie /></g></g>
        <g transform="translate(232, 214) scale(0.3)"><g className="kirk-zfig kirk-zfig-4"><CabinZombie /></g></g>
        <g transform="translate(336, 220) scale(0.29)"><g className="kirk-zfig kirk-zfig-5"><MiniZombie /></g></g>
      </g>

      {/* Pölyhiukkaset */}
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

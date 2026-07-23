import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './game/GameCanvas';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import IntroCutscene from './components/IntroCutscene';
import ZombieReveal from './components/ZombieReveal';
import PimeysReveal from './components/PimeysReveal';
import KaupunkiReveal from './components/KaupunkiReveal';
import TiesulkuReveal from './components/TiesulkuReveal';
import MokkiReveal from './components/MokkiReveal';
import KatakombiReveal from './components/KatakombiReveal';
import KirkkoReveal from './components/KirkkoReveal';
import AdminPanel from './components/AdminPanel';
import DeathScreen from './components/DeathScreen';
import ProfilePanel from './components/ProfilePanel';
import SettingsPanel from './components/SettingsPanel';
import { getMe, logout, loadSave, saveGame } from './api/authApi';
import './App.css';

function SkullIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C7.6 2 4 5.4 4 9.6c0 2.5 1.2 4.7 3 6.1V19a1 1 0 0 0 1 1h1.5v-2h2v2h1v-2h2v2H18a1 1 0 0 0 1-1v-3.3c1.8-1.4 3-3.6 3-6.1C22 5.4 16.4 2 12 2z" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <circle cx="15" cy="10" r="1.6" fill="currentColor" />
      <path d="M11 14h2" />
    </svg>
  );
}

function DoorExitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8" />
      <circle cx="11" cy="12" r="1" fill="currentColor" />
      <path d="M17 8l4 4-4 4" />
      <path d="M21 12h-9" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6l7-3z" />
      <path d="M9.5 12l1.8 1.8 3.5-3.6" />
    </svg>
  );
}

function App() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [characterName, setCharacterName] = useState('Ukko');
  const [stats, setStats] = useState(null);
  const [hint, setHint] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    musicVolume: 0.7,
    sfxVolume: 0.5,
    musicMuted: false,
    sfxMuted: false,
  });
  const [zombieReveal, setZombieReveal] = useState(false);
  const [zombieFightStarted, setZombieFightStarted] = useState(false);
  const [darknessReveal, setDarknessReveal] = useState(false);
  const [cityReveal, setCityReveal] = useState(false);
  const [roadblockReveal, setRoadblockReveal] = useState(false);
  const [darknessDoneSignal, setDarknessDoneSignal] = useState(0);
  const [dead, setDead] = useState(false);
  const [deathStats, setDeathStats] = useState(null);
  const [restartKey, setRestartKey] = useState(0);
  const [checkpoint, setCheckpoint] = useState('asunto');
  const [gotoScene, setGotoScene] = useState(null);
  const [sceneNonce, setSceneNonce] = useState(0);
  const [sceneSpawn, setSceneSpawn] = useState('asunto');
  const [mokkiReveal, setMokkiReveal] = useState(false);
  const [katakombiReveal, setKatakombiReveal] = useState(false);
  const [kirkkoReveal, setKirkkoReveal] = useState(false);

  const saveRef = useRef(null);
  const savingRef = useRef(false);
  const pendingSaveRef = useRef(null);
  const characterNameRef = useRef('Ukko');
  const bgMusicRef = useRef(null);
  const currentTrackRef = useRef('');
  const fadeIntervalRef = useRef(null);

  const isAnyRevealActive = zombieReveal || darknessReveal || cityReveal || roadblockReveal || mokkiReveal || katakombiReveal || kirkkoReveal;

  // Efektiivinen ääniefektien voimakkuus (mykistys -> 0). Välitetään cutscene-
  // komponenteille jotka soittavat omia efektejään (koputus, karjaisu, siren jne.).
  const effectiveSfxVolume = audioSettings.sfxMuted ? 0 : audioSettings.sfxVolume;

  // Taustamusiikin hallinta (intro.mp3 -> Intro, Asunto, Käytävä, Aula, DeathScreen | bg-music.mp3 -> Kaupunki eteenpäin)
  useEffect(() => {
    let desiredTrack = '';
    const currentArea = checkpoint || saveRef.current?.currentArea || 'asunto';
    const introCheckpoints = ['asunto', 'kaytava', 'aula'];

    if (dead || view === 'intro' || (view === 'game' && introCheckpoints.includes(currentArea))) {
      desiredTrack = '/assets/audio/intro.mp3';
    } else if (view === 'game') {
      desiredTrack = '/assets/audio/bg-music.mp3';
    }

    // Tämän efektiajon oma musiikki-instanssi ja kuuntelijat. Näihin
    // viitataan cleanupissa (ei bgMusicRef.currentiin), koska React
    // StrictModen kehitystilan tuplakutsu (mount -> cleanup -> mount)
    // muuten jättäisi ensimmäisellä ajolla luodun Audio-olion soimaan
    // taustalle ikuisesti sen jälkeen kun ref on jo vaihtunut uuteen.
    let createdMusic = null;
    let playMusicListener = null;

    if (desiredTrack !== currentTrackRef.current) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }

      if (desiredTrack) {
        const music = new Audio(desiredTrack);
        music.loop = true;
        // Äänenvoimakkuus asetuksista (mykistys -> 0)
        music.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;

        const playMusic = () => {
          music.play().then(() => {
            window.removeEventListener('click', playMusic);
            window.removeEventListener('keydown', playMusic);
          }).catch(() => {});
        };

        playMusic();
        window.addEventListener('click', playMusic);
        window.addEventListener('keydown', playMusic);

        bgMusicRef.current = music;
        currentTrackRef.current = desiredTrack;
        createdMusic = music;
        playMusicListener = playMusic;
      } else {
        currentTrackRef.current = '';
      }
    }

    return () => {
      if (playMusicListener) {
        window.removeEventListener('click', playMusicListener);
        window.removeEventListener('keydown', playMusicListener);
      }
      if (createdMusic) {
        createdMusic.pause();
        // Jos ref osoittaa yhä tähän samaan instanssiin, nollataan sekin
        // ettei seuraava ajo luule musiikin olevan jo oikea.
        if (bgMusicRef.current === createdMusic) {
          bgMusicRef.current = null;
          currentTrackRef.current = '';
        }
      }
    };
  }, [view, checkpoint, audioSettings, dead]);

  // Musiikin vaimennus Reveal-animaatioiden ajaksi
  useEffect(() => {
    if (!bgMusicRef.current) return;

    const audio = bgMusicRef.current;
    // Cutscenen aikana vaimennetaan nollaan, muuten asetusten mukainen taso.
    const settingVolume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
    const targetVolume = isAnyRevealActive ? 0.0 : settingVolume;
    const step = 0.05;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      if (Math.abs(audio.volume - targetVolume) <= step) {
        audio.volume = targetVolume;
        clearInterval(fadeIntervalRef.current);
      } else if (audio.volume < targetVolume) {
        audio.volume = Math.min(1, audio.volume + step);
      } else {
        audio.volume = Math.max(0, audio.volume - step);
      }
    }, 40);

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isAnyRevealActive, audioSettings]);

  // Päivitä soivan musiikin äänenvoimakkuus heti kun asetukset muuttuvat
  // (ilman että raita luodaan uudelleen). Ei kosketa cutscenen aikana, jotta
  // vaimennuslogiikka hoitaa sen.
  useEffect(() => {
    if (!bgMusicRef.current || isAnyRevealActive) return;
    bgMusicRef.current.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
  }, [audioSettings, isAnyRevealActive]);

  useEffect(() => {
    getMe()
      .then(async (u) => {
        setUser(u);
        if (u?.audioSettings) {
          setAudioSettings(u.audioSettings);
        }
        try {
          const save = await loadSave();
          if (save) {
            saveRef.current = save;
            if (save.characterName) {
              setCharacterName(save.characterName);
              characterNameRef.current = save.characterName;
            }
          }
        } catch {
          // ei tallennusta
        }
        setView('game');
      })
      .catch(() => {
        setView('landing');
      });
  }, []);

  const persistSave = useCallback(async (saveData) => {
    // Päivitä muistissa oleva save HETI synkronisesti, jotta scene-vaihto
    // (esim. kaupunki<->metsä) saa tuoreet statsit vaikka palvelintallennus
    // olisi vielä kesken. Ilman tätä seuraava ruutu lataisi vanhat arvot.
    saveRef.current = {
      ...(saveRef.current || {}),
      characterName: characterNameRef.current,
      ...saveData,
    };
    if (savingRef.current) {
      // Tallennus on jo käynnissä: älä hylkää tätä pyyntöä (se hukkaisi esim.
      // katakombiin siirtymisen currentArea-päivityksen), vaan jonota tuorein
      // data ja lähetä se heti kun nykyinen verkkokutsu valmistuu.
      pendingSaveRef.current = saveData;
      return;
    }
    savingRef.current = true;
    try {
      const updated = await saveGame({
        characterName: characterNameRef.current,
        ...saveData,
      });
      // Yhdistä palvelimen vastaus paikalliseen saveen VAROVASTI: paikallinen
      // saveRef.current on jo synkronisesti ajan tasalla (ks. yllä), ja se voi
      // olla TUOREEMPI kuin tämä juuri valmistunut kutsu (esim. scene ehti
      // vaihtua kesken verkkokutsun). Siksi emme anna palvelimen vastauksen
      // ylikirjoittaa keskeisiä eteneviä kenttiä kuten currentArea/inventory —
      // muuten katakombiin siirtyminen palautuisi hautausmaaksi.
      if (updated) {
        saveRef.current = {
          ...(saveRef.current || {}),
          ...updated,
          currentArea: saveRef.current?.currentArea ?? updated.currentArea,
          inventory: saveRef.current?.inventory ?? updated.inventory,
          progress: saveRef.current?.progress ?? updated.progress,
        };
      }
    } catch {
      // hiljainen epäonnistuminen (muistissa oleva save on jo ajan tasalla)
    } finally {
      savingRef.current = false;
      // Jos jonossa on tuoreempi tallennus, lähetä se nyt.
      if (pendingSaveRef.current) {
        const next = pendingSaveRef.current;
        pendingSaveRef.current = null;
        persistSave(next);
      }
    }
  }, []);

  const changeScene = useCallback((name, spawn = 'asunto') => {
    setSceneSpawn(spawn);
    setGotoScene(name);
    setSceneNonce((n) => n + 1);
  }, []);

  const handleGameEvent = useCallback((event) => {
    if (event.type === 'stats-update') {
      setStats(event.stats);
    }
    if (event.type === 'hint') {
      setHint(event.text ? { text: event.text, kind: event.kind } : null);
    }
    if (event.type === 'door-opening') {
      setZombieReveal(true);
    }
    if (event.type === 'game-over') {
      setDeathStats(event.stats);
      setDead(true);
    }
    if (event.type === 'checkpoint-reached') {
      setCheckpoint(event.area);
    }
    if (event.type === 'request-save') {
      persistSave(event.save);
    }
    // Asunnosta käytävään
    if (event.type === 'leave-to-corridor') {
      setCheckpoint('kaytava');
      changeScene('KaytavaScene', 'asunto');
    }
    if (event.type === 'darkness-falling') {
      setDarknessReveal(true);
    }
    // Käytävän portaat (seuraava alue myöhemmin)
    if (event.type === 'stairs-reached') {
      setCheckpoint('aula');
      changeScene('AulaScene', 'kaytava');
    }
    if (event.type === 'aula-to-corridor') {
      setCheckpoint('kaytava');
      changeScene('KaytavaScene', 'aula');
    }
    if (event.type === 'aula-to-city') {
      setCityReveal(true);
    }
    if (event.type === 'city-to-forest') {
      setCheckpoint('metsa');
      changeScene('MetsaScene', 'kaupunki');
    }
    if (event.type === 'metsa-to-city') {
      setCheckpoint('kaupunki');
      changeScene('KaupunkiScene', 'metsa');
    }
    if (event.type === 'metsa-to-mokki') {
      setMokkiReveal(true);
    }
    if (event.type === 'mokki-to-hautausmaa') {
      setCheckpoint('hautausmaa');
      changeScene('HautausmaaScene', 'mokki');
    }
    if (event.type === 'hautausmaa-to-katakombi') {
      setKatakombiReveal(true);
    }
    if (event.type === 'katakombi-to-kirkko') {
      setKirkkoReveal(true);
    }
    if (event.type === 'city-to-roadblock') {
      setRoadblockReveal(true);
    }
    if (event.type === 'return-to-apartment') {
      setCheckpoint('asunto');
      changeScene('ApartmentScene', 'kaytava');
    }
  }, [persistSave, changeScene]);

  const getSave = useCallback(() => saveRef.current, []);

  // Admin-paneelin käyttämä suora save-asetus (kohtausten selailu).
  const adminSetSave = useCallback((save, area) => {
    saveRef.current = { ...(saveRef.current || {}), ...save };
    if (area) setCheckpoint(area);
    persistSave(save);
  }, [persistSave]);

  const handleRevealComplete = useCallback(() => {
    setZombieReveal(false);
    setZombieFightStarted(true);
  }, []);

  const handleCityRevealComplete = useCallback(() => {
    setCityReveal(false);
    setCheckpoint('kaupunki');
    changeScene('KaupunkiScene', 'aula');
  }, [changeScene]);

  const handleRoadblockRevealComplete = useCallback(() => {
    setRoadblockReveal(false);
  }, []);

  const handleMokkiRevealComplete = useCallback(() => {
    setMokkiReveal(false);
    setCheckpoint('mokki');
    changeScene('MokkiScene', 'metsa');
  }, [changeScene]);

  const handleKatakombiRevealComplete = useCallback(() => {
    setKatakombiReveal(false);
    setCheckpoint('katakombi');
    changeScene('KatakombiScene', 'hautausmaa');
  }, [changeScene]);

  const handleKirkkoRevealComplete = useCallback(() => {
    setKirkkoReveal(false);
    setCheckpoint('kirkko');
    changeScene('KirkkoScene', 'katakombi');
  }, [changeScene]);

  const handleDarknessComplete = useCallback(() => {
    setDarknessReveal(false);
    setDarknessDoneSignal((n) => n + 1);
  }, []);

  const handleRetry = useCallback(() => {
    setDead(false);
    setDeathStats(null);
    setStats(null);
    setHint(null);
    setZombieReveal(false);
    setZombieFightStarted(false);
    setDarknessReveal(false);
    setCityReveal(false);
    setRoadblockReveal(false);
    setMokkiReveal(false);
    setKatakombiReveal(false);
    setKirkkoReveal(false);
    setRestartKey((k) => k + 1);
  }, []);

  const handleAuthSuccess = async () => {
    let hasExistingSave = false;
    try {
      const u = await getMe();
      setUser(u);
      if (u?.audioSettings) {
        setAudioSettings(u.audioSettings);
      }
      try {
        const save = await loadSave();
        if (save) {
          saveRef.current = save;
          hasExistingSave = true;
          if (save.characterName) {
            setCharacterName(save.characterName);
            characterNameRef.current = save.characterName;
          }
        }
      } catch {
        // ei tallennusta (uusi käyttäjä)
      }
    } catch {
      // ohitetaan
    }
    // Intro näytetään vain uudelle pelaajalle; olemassa olevalla tallennuksella
    // mennään suoraan peliin oikeaan kohtaan.
    setView(hasExistingSave ? 'game' : 'intro');
  };

  const handleIntroComplete = useCallback(() => {
    setView('game');
  }, []);

  const resetGameState = () => {
    setStats(null);
    setHint(null);
    setProfileOpen(false);
    setZombieReveal(false);
    setZombieFightStarted(false);
    setDarknessReveal(false);
    setMokkiReveal(false);
    setKatakombiReveal(false);
    setKirkkoReveal(false);
    setDead(false);
    setDeathStats(null);
    setCheckpoint('asunto');
    setGotoScene(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ohitetaan
    }
    setUser(null);
    saveRef.current = null;
    resetGameState();
    setView('landing');
  };

  const handleQuitToMenu = () => {
    resetGameState();
    setView('landing');
  };

  const handleUsernameChanged = (newUsername) => {
    setUser((prev) => ({ ...prev, username: newUsername }));
  };

  const handleEmailChanged = (newEmail) => {
    setUser((prev) => ({ ...prev, email: newEmail }));
  };

  const handleAccountDeleted = () => {
    setUser(null);
    saveRef.current = null;
    resetGameState();
    setView('landing');
  };

  if (view === 'loading') {
    return <div className="App" />;
  }

  return (
    <div className="App">
      {view === 'landing' && <LandingPage onStart={() => setView('auth')} />}

      {view === 'auth' && <AuthForm onAuthSuccess={handleAuthSuccess} />}

      {view === 'intro' && <IntroCutscene onComplete={handleIntroComplete} sfxVolume={effectiveSfxVolume} />}

      {view === 'game' && (
        <>
          <GameCanvas
            onGameEvent={handleGameEvent}
            inputEnabled={!profileOpen && !settingsOpen && !adminOpen && !zombieReveal && !darknessReveal && !cityReveal && !roadblockReveal && !mokkiReveal && !katakombiReveal && !kirkkoReveal && !dead}
            triggerZombieFight={zombieFightStarted}
            restartKey={restartKey}
            gotoScene={gotoScene}
            sceneNonce={sceneNonce}
            sceneSpawn={sceneSpawn}
            darknessDoneSignal={darknessDoneSignal}
            getSave={getSave}
            sfxVolume={audioSettings.sfxVolume}
            sfxMuted={audioSettings.sfxMuted}
          />

          {stats && !dead && (
            <div className="hud">
              <div className="hud-row">
                <span className="character-name">{characterName}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">HP</span>
                <span className="hud-value">{stats.hp} / {stats.maxHP}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">Energia</span>
                <span className="hud-value">{stats.energy} / {stats.maxEnergy}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">Taso</span>
                <span className="hud-value">{stats.level}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">Tapetut</span>
                <span className="hud-value">{stats.zombiesKilled}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">Tavarat</span>
                <span className="hud-value">{stats.inventory.length ? stats.inventory.join(', ') : '-'}</span>
              </div>
            </div>
          )}

          {hint && !dead && (
            <div className={`hint-box ${hint.kind}`}>{hint.text}</div>
          )}

          {!dead && (
            <div className="hud-buttons">
              <button onClick={() => setProfileOpen(true)} title="Profiili" aria-label="Profiili">
                <SkullIcon />
              </button>
              <button onClick={() => setSettingsOpen(true)} title="Asetukset" aria-label="Asetukset">
                <GearIcon />
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => setAdminOpen(true)} title="Ylläpito" aria-label="Ylläpito">
                  <ShieldIcon />
                </button>
              )}
              <button onClick={handleLogout} title="Kirjaudu ulos" aria-label="Kirjaudu ulos">
                <DoorExitIcon />
              </button>
            </div>
          )}

          {profileOpen && (
            <ProfilePanel
              user={user}
              onClose={() => setProfileOpen(false)}
              onUsernameChanged={handleUsernameChanged}
              onEmailChanged={handleEmailChanged}
              onAccountDeleted={handleAccountDeleted}
            />
          )}

          {settingsOpen && (
            <SettingsPanel
              settings={audioSettings}
              onClose={() => setSettingsOpen(false)}
              onSettingsChanged={setAudioSettings}
            />
          )}

          {user?.role === 'admin' && (
            <AdminPanel
              open={adminOpen}
              onClose={() => setAdminOpen(false)}
              onJump={changeScene}
              onSetSave={adminSetSave}
              getSave={getSave}
            />
          )}

          {zombieReveal && <ZombieReveal onComplete={handleRevealComplete} sfxVolume={effectiveSfxVolume} />}

          {darknessReveal && <PimeysReveal onComplete={handleDarknessComplete} sfxVolume={effectiveSfxVolume} />}

          {cityReveal && <KaupunkiReveal onComplete={handleCityRevealComplete} sfxVolume={effectiveSfxVolume} />}
          
          {roadblockReveal && <TiesulkuReveal onComplete={handleRoadblockRevealComplete} sfxVolume={effectiveSfxVolume} />}

          {mokkiReveal && <MokkiReveal onComplete={handleMokkiRevealComplete} sfxVolume={effectiveSfxVolume} />}
          {katakombiReveal && <KatakombiReveal onComplete={handleKatakombiRevealComplete} sfxVolume={effectiveSfxVolume} />}
          {kirkkoReveal && <KirkkoReveal onComplete={handleKirkkoRevealComplete} sfxVolume={effectiveSfxVolume} />}

          {dead && (
            <DeathScreen
              stats={deathStats}
              checkpoint={checkpoint}
              onRetry={handleRetry}
              onQuit={handleQuitToMenu}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
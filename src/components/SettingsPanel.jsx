import { useState } from 'react';
import { updateAudioSettings } from '../api/authApi';
import './ProfilePanel.css';
import './SettingsPanel.css';

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export default function SettingsPanel({ settings, onClose, onSettingsChanged }) {
  const [musicVolume, setMusicVolume] = useState(settings?.musicVolume ?? 0.7);
  const [sfxVolume, setSfxVolume] = useState(settings?.sfxVolume ?? 0.5);
  const [musicMuted, setMusicMuted] = useState(settings?.musicMuted ?? false);
  const [sfxMuted, setSfxMuted] = useState(settings?.sfxMuted ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ilmoita muutokset heti ylös (jotta ääni reagoi reaaliajassa)
  const applyLive = (next) => {
    onSettingsChanged?.({
      musicVolume,
      sfxVolume,
      musicMuted,
      sfxMuted,
      ...next,
    });
  };

  const handleMusicVolume = (e) => {
    const v = Number(e.target.value);
    setMusicVolume(v);
    applyLive({ musicVolume: v });
  };

  const handleSfxVolume = (e) => {
    const v = Number(e.target.value);
    setSfxVolume(v);
    applyLive({ sfxVolume: v });
  };

  const toggleMusicMuted = () => {
    const v = !musicMuted;
    setMusicMuted(v);
    applyLive({ musicMuted: v });
  };

  const toggleSfxMuted = () => {
    const v = !sfxMuted;
    setSfxMuted(v);
    applyLive({ sfxMuted: v });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const result = await updateAudioSettings({ musicVolume, sfxVolume, musicMuted, sfxMuted });
      setSuccess('Asetukset tallennettu');
      onSettingsChanged?.(result.audioSettings || { musicVolume, sfxVolume, musicMuted, sfxMuted });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-box" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2 className="profile-title">Asetukset</h2>
          <button className="profile-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        {/* Taustamusiikki */}
        <div className="settings-row">
          <div className="settings-row-head">
            <label htmlFor="musicVol">Taustamusiikki</label>
            <button
              type="button"
              className={`settings-mute ${musicMuted ? 'muted' : ''}`}
              onClick={toggleMusicMuted}
              aria-label={musicMuted ? 'Poista mykistys' : 'Mykistä'}
              title={musicMuted ? 'Poista mykistys' : 'Mykistä'}
            >
              {musicMuted ? <MuteIcon /> : <SpeakerIcon />}
            </button>
          </div>
          <input
            id="musicVol"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={handleMusicVolume}
            disabled={musicMuted}
            className="settings-slider"
          />
          <div className="settings-value">{Math.round(musicVolume * 100)}%</div>
        </div>

        {/* Ääniefektit */}
        <div className="settings-row">
          <div className="settings-row-head">
            <label htmlFor="sfxVol">Ääniefektit</label>
            <button
              type="button"
              className={`settings-mute ${sfxMuted ? 'muted' : ''}`}
              onClick={toggleSfxMuted}
              aria-label={sfxMuted ? 'Poista mykistys' : 'Mykistä'}
              title={sfxMuted ? 'Poista mykistys' : 'Mykistä'}
            >
              {sfxMuted ? <MuteIcon /> : <SpeakerIcon />}
            </button>
          </div>
          <input
            id="sfxVol"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVolume}
            onChange={handleSfxVolume}
            disabled={sfxMuted}
            className="settings-slider"
          />
          <div className="settings-value">{Math.round(sfxVolume * 100)}%</div>
        </div>

        <button
          type="button"
          className="profile-submit"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Tallennetaan...' : 'Tallenna asetukset'}
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { updateUsername, updateEmail, updatePassword, deleteAccount } from '../api/authApi';
import './ProfilePanel.css';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function PasswordField({ id, label, value, onChange, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="profile-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          minLength={minLength}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Piilota salasana' : 'Näytä salasana'}
          title={visible ? 'Piilota salasana' : 'Näytä salasana'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePanel({ user, onClose, onUsernameChanged, onEmailChanged, onAccountDeleted }) {
  const [tab, setTab] = useState('username');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchTab = (next) => {
    setTab(next);
    resetMessages();
    setCurrentPassword('');
    setConfirmText('');
    setConfirmingDelete(false);
  };

  const handleUsername = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const result = await updateUsername({ username: newUsername, currentPassword });
      setSuccess('Käyttäjänimi vaihdettu');
      onUsernameChanged(result.username);
      setNewUsername('');
      setCurrentPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const result = await updateEmail({ email: newEmail, currentPassword });
      setSuccess('Sähköposti vaihdettu');
      onEmailChanged(result.email);
      setNewEmail('');
      setCurrentPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setSuccess('Salasana vaihdettu');
      setNewPassword('');
      setCurrentPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    resetMessages();
    setConfirmingDelete(true);
  };

  const handleDeleteConfirmed = async () => {
    resetMessages();
    setLoading(true);
    try {
      await deleteAccount({ currentPassword, confirmText });
      onAccountDeleted();
    } catch (err) {
      setError(err.message);
      setConfirmingDelete(false);
      setLoading(false);
    }
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-box" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2 className="profile-title">Profiili</h2>
          <button className="profile-close" onClick={onClose}>&times;</button>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === 'username' ? 'active' : ''}`}
            onClick={() => switchTab('username')}
          >
            Nimi
          </button>
          <button
            className={`profile-tab ${tab === 'email' ? 'active' : ''}`}
            onClick={() => switchTab('email')}
          >
            Sähköposti
          </button>
          <button
            className={`profile-tab ${tab === 'password' ? 'active' : ''}`}
            onClick={() => switchTab('password')}
          >
            Salasana
          </button>
          <button
            className={`profile-tab danger ${tab === 'delete' ? 'active' : ''}`}
            onClick={() => switchTab('delete')}
          >
            Poista
          </button>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        {tab === 'username' && (
          <form onSubmit={handleUsername}>
            <div className="profile-current">Nykyinen: {user?.username}</div>
            <div className="profile-field">
              <label htmlFor="new-username">Uusi käyttäjänimi</label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
            </div>
            <PasswordField
              id="pw-username"
              label="Nykyinen salasana"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button type="submit" className="profile-submit" disabled={loading}>
              {loading ? 'Tallennetaan...' : 'Vaihda käyttäjänimi'}
            </button>
          </form>
        )}

        {tab === 'email' && (
          <form onSubmit={handleEmail}>
            <div className="profile-current">Nykyinen: {user?.email}</div>
            <div className="profile-field">
              <label htmlFor="new-email">Uusi sähköposti</label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <PasswordField
              id="pw-email"
              label="Nykyinen salasana"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button type="submit" className="profile-submit" disabled={loading}>
              {loading ? 'Tallennetaan...' : 'Vaihda sähköposti'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePassword}>
            <PasswordField
              id="pw-current"
              label="Nykyinen salasana"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordField
              id="pw-new"
              label="Uusi salasana"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
            />
            <button type="submit" className="profile-submit" disabled={loading}>
              {loading ? 'Tallennetaan...' : 'Vaihda salasana'}
            </button>
          </form>
        )}

        {tab === 'delete' && !confirmingDelete && (
          <form onSubmit={handleDeleteSubmit}>
            <div className="profile-warning">
              Tämä poistaa tilisi ja kaikki pelitietosi pysyvästi.
              Toimintoa ei voi perua.
            </div>
            <PasswordField
              id="pw-delete"
              label="Nykyinen salasana"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="profile-field">
              <label htmlFor="confirm-text">Kirjoita POISTA vahvistaaksesi</label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="profile-submit danger">
              Poista tili pysyvästi
            </button>
          </form>
        )}

        {tab === 'delete' && confirmingDelete && (
          <div className="confirm-panel">
            <div className="confirm-title">Oletko aivan varma?</div>
            <p className="confirm-text">
              Tilisi <strong>{user?.username}</strong> ja kaikki pelitiedot
              poistetaan lopullisesti. Tätä ei voi perua.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setConfirmingDelete(false)}
                disabled={loading}
              >
                Peruuta
              </button>
              <button
                type="button"
                className="confirm-accept"
                onClick={handleDeleteConfirmed}
                disabled={loading}
              >
                {loading ? 'Poistetaan...' : 'Kyllä, poista'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
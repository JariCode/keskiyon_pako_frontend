import { useState, useEffect, useCallback } from 'react';
import {
  adminGetUsers,
  adminGetLogs,
  adminChangeRole,
  adminDeleteUser,
  adminUnlockUser,
} from '../api/authApi';
import './AdminPanel.css';

// Pelin kohtaukset: näyttönimi, scene-luokka, spawn-piste, alueen tunnus ja
// oletusvarustus (mitä pelaajalla kuuluisi siinä kohdassa peliä olla).
const SCENES = [
  { label: 'Asunto', scene: 'ApartmentScene', spawn: 'kaytava', area: 'asunto', items: [] },
  { label: 'Käytävä', scene: 'KaytavaScene', spawn: 'asunto', area: 'kaytava', items: ['maila'] },
  { label: 'Aula', scene: 'AulaScene', spawn: 'kaytava', area: 'aula', items: ['taskulamppu', 'maila'] },
  { label: 'Kaupunki', scene: 'KaupunkiScene', spawn: 'aula', area: 'kaupunki', items: ['taskulamppu', 'maila'] },
  { label: 'Metsä', scene: 'MetsaScene', spawn: 'kaupunki', area: 'metsa', items: ['taskulamppu', 'maila'] },
  { label: 'Mökki', scene: 'MokkiScene', spawn: 'metsa', area: 'mokki', items: ['taskulamppu', 'maila'] },
  { label: 'Hautausmaa', scene: 'HautausmaaScene', spawn: 'mokki', area: 'hautausmaa', items: ['taskulamppu', 'kirves'] },
  { label: 'Katakombi', scene: 'KatakombiScene', spawn: 'hautausmaa', area: 'katakombi', items: ['taskulamppu', 'kirves'] },
  { label: 'Kirkko', scene: 'KirkkoScene', spawn: 'katakombi', area: 'kirkko', items: ['taskulamppu', 'kirves'] },
];

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('fi-FI', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Vahvistusdialogi kaikille admin-toiminnoille
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="adm-confirm-overlay" onClick={onCancel}>
      <div className="adm-confirm" onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        <p>{message}</p>
        <div className="adm-confirm-buttons">
          <button className="adm-btn" onClick={onCancel}>Peruuta</button>
          <button
            className={`adm-btn ${danger ? 'adm-btn-danger' : 'adm-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ open, onClose, onJump, onSetSave, getSave }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState(null); // { id, username } | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async (userId = null) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminGetLogs(userId ? { userId, limit: 200 } : { limit: 200 });
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (tab === 'users') loadUsers();
    if (tab === 'logs') loadLogs(logFilter?.id || null);
  }, [open, tab, logFilter, loadUsers, loadLogs]);

  if (!open) return null;

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 4000);
  };

  const askChangeRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const roleText = newRole === 'admin' ? 'ylläpitäjäksi' : 'peruskäyttäjäksi';
    setConfirm({
      title: 'Vahvista roolin vaihto',
      message: `Muutetaanko käyttäjä ${user.username} ${roleText}?`,
      confirmLabel: 'Vaihda rooli',
      danger: false,
      action: async () => {
        try {
          await adminChangeRole({ userId: user._id, role: newRole });
          showNotice(`${user.username} on nyt ${roleText}.`);
          loadUsers();
        } catch (err) {
          setError(err.message);
        }
      },
    });
  };

  const unlockUser = async (user) => {
    try {
      await adminUnlockUser({ userId: user._id });
      showNotice(`${user.username} tili avattu.`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const askDeleteUser = (user) => {
    setConfirm({
      title: 'Vahvista poisto',
      message: `Poistetaanko käyttäjä ${user.username} ja hänen pelitietonsa pysyvästi? Tätä ei voi perua.`,
      confirmLabel: 'Poista käyttäjä',
      danger: true,
      action: async () => {
        try {
          await adminDeleteUser({ userId: user._id });
          showNotice(`Käyttäjä ${user.username} poistettu.`);
          loadUsers();
        } catch (err) {
          setError(err.message);
        }
      },
    });
  };

  const jumpToScene = (target) => {
    const current = getSave?.() || {};
    const save = {
      ...current,
      currentArea: target.area,
      // Kohtauksen oletusvarustus: se mitä pelaajalla kuuluisi siinä
      // kohdassa peliä olla, jotta hyökkääminen yms. toimii heti.
      inventory: [...target.items],
      progress: current.progress || {},
    };
    onSetSave(save, target.area);
    onJump(target.scene, target.spawn);
    onClose();
  };

  const currentSave = getSave?.() || {};

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="adm-head">
          <h3>Ylläpito</h3>
          <button className="adm-close" onClick={onClose} aria-label="Sulje">✕</button>
        </div>

        <div className="adm-tabs">
          <button
            className={`adm-tab ${tab === 'users' ? 'adm-tab-active' : ''}`}
            onClick={() => setTab('users')}
          >
            Käyttäjät
          </button>
          <button
            className={`adm-tab ${tab === 'logs' ? 'adm-tab-active' : ''}`}
            onClick={() => { setLogFilter(null); setTab('logs'); }}
          >
            Lokit
          </button>
          <button
            className={`adm-tab ${tab === 'scenes' ? 'adm-tab-active' : ''}`}
            onClick={() => setTab('scenes')}
          >
            Kohtaukset
          </button>
        </div>

        {error && <div className="adm-error">{error}</div>}
        {notice && <div className="adm-notice">{notice}</div>}

        <div className="adm-body">
          {loading && <div className="adm-loading">Ladataan…</div>}

          {/* ---------- KÄYTTÄJÄT ---------- */}
          {tab === 'users' && !loading && (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Käyttäjä</th>
                  <th>Sähköposti</th>
                  <th>Rooli</th>
                  <th>Liittynyt</th>
                  <th>Toiminnot</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={u.isSelf ? 'adm-row-self' : ''}>
                    <td>
                      {u.username}
                      {u.isSelf && <span className="adm-badge-self">sinä</span>}
                      {u.isLocked && <span className="adm-badge-locked">lukittu</span>}
                    </td>
                    <td className="adm-muted">{u.email}</td>
                    <td>
                      <span className={`adm-role adm-role-${u.role}`}>{u.role}</span>
                    </td>
                    <td className="adm-muted">{formatTime(u.createdAt)}</td>
                    <td className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm"
                        onClick={() => { setLogFilter({ id: u._id, username: u.username }); setTab('logs'); }}
                      >
                        Lokit
                      </button>
                      {u.isLocked && (
                        <button
                          className="adm-btn adm-btn-sm adm-btn-primary"
                          onClick={() => unlockUser(u)}
                        >
                          Avaa
                        </button>
                      )}
                      {/* Admin ei voi muuttaa omaa rooliaan eikä poistaa itseään */}
                      <button
                        className="adm-btn adm-btn-sm"
                        disabled={u.isSelf}
                        title={u.isSelf ? 'Et voi muuttaa omaa rooliasi' : ''}
                        onClick={() => askChangeRole(u)}
                      >
                        {u.role === 'admin' ? 'Alenna' : 'Ylennä'}
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        disabled={u.isSelf}
                        title={u.isSelf ? 'Et voi poistaa omaa tiliäsi täältä' : ''}
                        onClick={() => askDeleteUser(u)}
                      >
                        Poista
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="adm-muted">Ei käyttäjiä.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* ---------- LOKIT ---------- */}
          {tab === 'logs' && !loading && (
            <>
              {logFilter && (
                <div className="adm-filter">
                  Suodatin: <strong>{logFilter.username}</strong>
                  <button className="adm-btn adm-btn-sm" onClick={() => setLogFilter(null)}>
                    Näytä kaikki
                  </button>
                </div>
              )}
              <ul className="adm-logs">
                {logs.map((l) => (
                  <li key={l._id} className="adm-log">
                    <span className="adm-log-time">{formatTime(l.createdAt)}</span>
                    <span className={`adm-log-action adm-log-${l.action}`}>{l.action}</span>
                    <span className="adm-log-desc">{l.description}</span>
                  </li>
                ))}
                {logs.length === 0 && <li className="adm-muted">Ei lokitapahtumia.</li>}
              </ul>
            </>
          )}

          {/* ---------- KOHTAUKSET ---------- */}
          {tab === 'scenes' && (
            <div className="adm-scenes">
              <div className="adm-sub">Hyppää kohtaukseen</div>
              <div className="adm-muted adm-current">
                Kohtaus alkaa sen oletusvarustuksella.
              </div>
              <div className="adm-scene-grid">
                {SCENES.map((s) => (
                  <button
                    key={s.scene}
                    className={`adm-scene-btn ${currentSave.currentArea === s.area ? 'adm-scene-btn-active' : ''}`}
                    onClick={() => jumpToScene(s)}
                  >
                    <span className="adm-scene-name">{s.label}</span>
                    <span className="adm-scene-items">
                      {s.items.length ? s.items.join(' + ') : 'paljain käsin'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {confirm && (
          <ConfirmDialog
            title={confirm.title}
            message={confirm.message}
            confirmLabel={confirm.confirmLabel}
            danger={confirm.danger}
            onCancel={() => setConfirm(null)}
            onConfirm={async () => {
              const fn = confirm.action;
              setConfirm(null);
              await fn();
            }}
          />
        )}
      </div>
    </div>
  );
}

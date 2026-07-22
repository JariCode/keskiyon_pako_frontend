const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.details?.join(', ') || data?.error || 'Jokin meni pieleen';
    throw new Error(message);
  }

  return data;
}

export function register({ username, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request('/auth/me', { method: 'GET' });
}

export function updateUsername({ username, currentPassword }) {
  return request('/auth/username', {
    method: 'PATCH',
    body: JSON.stringify({ username, currentPassword }),
  });
}

export function updateEmail({ email, currentPassword }) {
  return request('/auth/email', {
    method: 'PATCH',
    body: JSON.stringify({ email, currentPassword }),
  });
}

export function updatePassword({ currentPassword, newPassword }) {
  return request('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount({ currentPassword, confirmText }) {
  return request('/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ currentPassword, confirmText }),
  });
}

// --- Pelin tallennus ---

export function loadSave() {
  return request('/save', { method: 'GET' });
}

export function saveGame({ characterName, hp, maxHP, level, currentArea, inventory, zombiesKilled, progress }) {
  return request('/save', {
    method: 'POST',
    body: JSON.stringify({ characterName, hp, maxHP, level, currentArea, inventory, zombiesKilled, progress }),
  });
}

export function updateAudioSettings({ musicVolume, sfxVolume, musicMuted, sfxMuted }) {
  return request('/auth/settings', {
    method: 'PATCH',
    body: JSON.stringify({ musicVolume, sfxVolume, musicMuted, sfxMuted }),
  });
}
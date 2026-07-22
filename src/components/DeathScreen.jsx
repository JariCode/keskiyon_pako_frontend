import './DeathScreen.css';

const AREA_NAMES = {
  asunto: 'Asunto',
  kaytava: 'Kerrostalon käytävä',
  aula: 'Aula',
  kaupunki: 'Kaupunki',
  metsa: 'Metsä',
  mokki: 'Mökki',
  kartano: 'Kartano',
  hautausmaa: 'Hautausmaa',
  kirkko: 'Kirkko',
};

function BloodDrips() {
  return (
    <div className="death-blood-bg" aria-hidden="true">
      {/* Kiinteät valuneet verinauhat */}
      <div className="blood-streak bs1" />
      <div className="blood-streak bs2" />
      <div className="blood-streak bs3" />
      <div className="blood-streak bs4" />
      <div className="blood-streak bs5" />
      <div className="blood-streak bs6" />

      {/* Tippuvat veripisarat */}
      <div className="blood-drop bd1" />
      <div className="blood-drop bd2" />
      <div className="blood-drop bd3" />
      <div className="blood-drop bd4" />
      <div className="blood-drop bd5" />
      <div className="blood-drop bd6" />
    </div>
  );
}

export default function DeathScreen({ stats, checkpoint, onRetry, onQuit }) {
  const areaLabel = AREA_NAMES[checkpoint] || 'Alku';

  return (
    <div className="death">
      <BloodDrips />

      <h1 className="death-title">Kuolit</h1>
      <p className="death-subtitle">Yö ei päästänyt sinua</p>

      {stats && (
        <div className="death-stats">
          <div className="death-stats-row">
            <span>Selvisit tasolle</span>
            <span className="death-stats-value">{stats.level}</span>
          </div>
          <div className="death-stats-row">
            <span>Tapetut</span>
            <span className="death-stats-value">{stats.zombiesKilled}</span>
          </div>
        </div>
      )}

      <div className="death-actions">
        <button className="death-button" onClick={onRetry}>
          Yritä uudelleen
        </button>
        <button className="death-button secondary" onClick={onQuit}>
          Lopeta
        </button>
      </div>

      <div className="death-checkpoint">
        Jatkat kohdasta: {areaLabel}
      </div>

      <div className="death-vignette" />
    </div>
  );
}
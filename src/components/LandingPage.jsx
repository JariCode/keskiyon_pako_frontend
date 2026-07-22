import './LandingPage.css';

export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="fog-layer" />
      
      {/* Hahmon pään yläosa ja mustat aurinkolasit otsikon yläpuolella */}
      <div className="landing-character-crop">
        <img src="/public/assets/landing-hahmo.png" alt="Hahmo" className="character-img" />
      </div>

      <h1 className="landing-title">KESKIYÖN PAKO</h1>
      <p className="landing-subtitle">Selviä hengissä yön yli</p>
      <button className="landing-button" onClick={onStart}>
        Aloita
      </button>
      <div className="landing-footer">JariCode &copy; 2026</div>
    </div>
  );
}
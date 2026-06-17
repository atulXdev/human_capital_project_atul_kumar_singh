import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const { theme, setTheme, preferences, updatePreferences } = useContext(AuthContext);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handlePreferenceChange = (key, value) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '32px' }}>Settings Panel</h2>

      <div className="grid grid-cols-2">
        {/* Theme Panel */}
        <div className="card card-lg" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Interface Theme</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Customize the visual aesthetic of the dashboard application.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleThemeChange('vercel-dark')}
              className={`btn ${theme === 'vercel-dark' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', height: '44px', justifyContent: 'flex-start', paddingLeft: '16px' }}
            >
              <span>🌑 Vercel Dark (Default)</span>
            </button>

            <button
              onClick={() => handleThemeChange('midnight-purple')}
              className={`btn ${theme === 'midnight-purple' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', height: '44px', justifyContent: 'flex-start', paddingLeft: '16px' }}
            >
              <span>🔮 Midnight Purple</span>
            </button>

            <button
              onClick={() => handleThemeChange('cyberpunk-green')}
              className={`btn ${theme === 'cyberpunk-green' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', height: '44px', justifyContent: 'flex-start', paddingLeft: '16px' }}
            >
              <span>🧪 Cyberpunk Green</span>
            </button>
          </div>
        </div>

        {/* Preferences Panel */}
        <div className="card card-lg" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Dashboard Preferences</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Configure defaults and display modes for your dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Default Country Code</label>
              <input
                type="text"
                className="form-control"
                maxLength={3}
                placeholder="e.g. IND"
                value={preferences.defaultCountry || ''}
                onChange={(e) => handlePreferenceChange('defaultCountry', e.target.value.toUpperCase())}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                Used as the default country for loading country-specific analytics.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
              <input
                type="checkbox"
                id="compactMode"
                checked={preferences.compactMode || false}
                onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="compactMode" style={{ fontSize: '14px', color: 'var(--color-text-primary)', cursor: 'pointer', userSelect: 'none' }}>
                Enable Compact Table Mode
              </label>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '30px' }}>
              Reduces padding on all price directory listing tables.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

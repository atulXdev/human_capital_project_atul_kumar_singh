import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [apiOnline, setApiOnline] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Basic check for API status
  useEffect(() => {
    fetch('https://human-capital-api.onrender.com/api/v1/health')
      .then(res => setApiOnline(res.ok))
      .catch(() => setApiOnline(false));
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-search" style={{ position: 'relative' }}>
        <input 
          type="text" 
          name="globalSearch"
          className="form-control" 
          placeholder="Search country, prices..." 
          value={query}
          aria-label="Search"
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          style={{ height: '36px', borderRadius: '18px', paddingLeft: '16px', background: 'rgba(255,255,255,0.03)' }}
        />
      </div>

      <div className="flex items-center gap-4">
        {/* API Health Indicator */}
        <div className="flex items-center gap-2">
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: apiOnline ? 'var(--color-success)' : 'var(--color-danger)',
            boxShadow: apiOnline ? '0 0 8px var(--color-success)' : '0 0 8px var(--color-danger)'
          }}></span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {apiOnline ? 'API Connected' : 'API Offline'}
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4" style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '16px' }}>
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ height: '32px', fontSize: '12px', borderRadius: '16px', padding: '0 12px' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
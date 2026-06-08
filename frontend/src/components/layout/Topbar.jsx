import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../services/api';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: countries } = useFetch(api.getCountries);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countries 
    ? countries.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="topbar">
      <div className="topbar-search" ref={wrapperRef} style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search country..." 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && query.length > 0 && (
          <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 100, padding: 0 }}>
            {filteredCountries.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                {filteredCountries.map(c => (
                  <li 
                    key={c.code}
                    style={{ padding: '10px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                      navigate(`/countries/${c.code}`);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                      <span className="text-mono text-muted" style={{ fontSize: 12 }}>{c.code}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center' }} className="text-muted">No countries found</div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Actions can go here in future */}
      </div>
    </header>
  );
}
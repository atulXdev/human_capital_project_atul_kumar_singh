import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const links = [
    { path: '/dashboard', label: 'Analytics' },
    { path: '/prices', label: 'Prices Directory' },
    { path: '/countries', label: 'Countries' },
    { path: '/stats', label: 'Global Stats' },
    { path: '/search', label: 'Search Engine' },
    { path: '/profile', label: 'My Profile' },
    { path: '/settings', label: 'Settings' }
  ];

  if (isAdmin) {
    links.push({ path: '/admin', label: 'Admin Panel' });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="mesh-gradient-bg" style={{ fontSize: '18px', fontWeight: 'bold' }}>HUMAN CAPITAL</span>
      </div>

      <nav className="sidebar-nav">
        <div style={{ textTransform: 'uppercase', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'bold', padding: '0 12px 8px 12px', letterSpacing: '0.05em' }}>
          Navigation
        </div>
        {links.map(l => (
          <NavLink 
            key={l.path} 
            to={l.path} 
            className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
            end={l.path === '/dashboard'}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-profile-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gradient-develop-start), var(--gradient-develop-end))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'var(--color-on-primary)' }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ width: '100%', height: '32px', fontSize: '12px', gap: '4px' }}
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
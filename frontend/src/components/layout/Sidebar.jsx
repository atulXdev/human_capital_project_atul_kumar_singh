import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { path: '/', label: 'Overview' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/prices', label: 'Prices Directory' },
    { path: '/countries', label: 'Countries' },
    { path: '/stats', label: 'Global Stats' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="mesh-gradient-bg" style={{ fontSize: '16px' }}>Human Capital</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink 
            key={l.path} 
            to={l.path} 
            className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '24px' }}>
        <div className="badge badge-secondary" style={{ width: '100%', justifyContent: 'center' }}>v1.0.0</div>
      </div>
    </aside>
  );
}
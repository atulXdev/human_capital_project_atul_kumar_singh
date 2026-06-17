import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
          <span className="text-sm text-mono" style={{ color: 'var(--color-text-secondary)' }}>Loading Session...</span>
        </div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isPublicPage = location.pathname === '/' || isAuthPage;

  if (!user && !isPublicPage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '20px' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
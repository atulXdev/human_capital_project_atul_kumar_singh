import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Call change-password API
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Double check current password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '32px' }}>Profile Management</h2>

      <div className="grid grid-cols-2">
        {/* Info Card */}
        <div className="card card-lg" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Personal Information</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Details about your authenticated account profile.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gradient-develop-start), var(--gradient-develop-end))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '24px',
              color: 'var(--color-on-primary)'
            }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{user.name}</h4>
              <span className="badge badge-secondary" style={{ marginTop: '4px' }}>
                {user.role === 'admin' ? '👑 Administrator' : '👤 Standard User'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email Address</span>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginTop: '4px', fontWeight: '500' }}>{user.email}</div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Account ID</span>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{user._id}</div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Account Created</span>
              <div style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Security / Password Card */}
        <div className="card card-lg" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Change Password</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Update your account password.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(255, 0, 128, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: 'rgba(80, 227, 194, 0.1)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="currPass">Current Password</label>
              <input
                type="password"
                id="currPass"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="newPass">New Password</label>
              <input
                type="password"
                id="newPass"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="confirmPass">Confirm New Password</label>
              <input
                type="password"
                id="confirmPass"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '40px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
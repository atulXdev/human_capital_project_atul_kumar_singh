import { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Stats States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [quickStats, setQuickStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // User Management States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Price Management States
  const [prices, setPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null); // null if creating
  const [priceForm, setPriceForm] = useState({
    country: '',
    countryLabel: '',
    indicator: '',
    indicatorLabel: '',
    value: '',
    year: new Date().getFullYear(),
    month: 1,
    freq: 'M'
  });
  const [priceError, priceSetError] = useState('');
  const [priceSuccess, priceSetSuccess] = useState('');
  const [pricePage, setPricePage] = useState(1);
  const [priceLimit] = useState(15);
  const [priceSearch, setPriceSearch] = useState('');

  // Load Overview Data
  useEffect(() => {
    if (activeTab === 'overview') {
      const fetchStats = async () => {
        setStatsLoading(true);
        try {
          const [dbData, quickData] = await Promise.all([
            api.adminGetDashboard(),
            api.adminGetStats()
          ]);
          setDashboardStats(dbData);
          setQuickStats(quickData);
        } catch (err) {
          console.error('Admin stats load failed:', err);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [activeTab]);

  // Load Users Data
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api.adminGetUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Load Prices Data
  const loadPrices = async () => {
    setPricesLoading(true);
    try {
      let query = `?page=${pricePage}&limit=${priceLimit}`;
      if (priceSearch) {
        query += `&search=${priceSearch}`;
      }
      const data = await api.adminGetPrices(query);
      setPrices(data || []);
    } catch (err) {
      console.error('Failed to load prices:', err);
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prices') {
      loadPrices();
    }
  }, [activeTab, pricePage, priceSearch]);

  // Handle User Submit (Create/Update)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    try {
      if (editingUser) {
        // Update user
        const updatePayload = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role
        };
        // Only include password if it's set
        if (userForm.password) {
          updatePayload.password = userForm.password;
        }
        await api.adminUpdateUser(editingUser._id, updatePayload);
        setUserSuccess('User updated successfully');
      } else {
        // Create user
        if (!userForm.password) {
          setUserError('Password is required for new users');
          return;
        }
        await api.adminCreateUser(userForm);
        setUserSuccess('User created successfully');
      }

      // Refresh list
      await loadUsers();
      setTimeout(() => {
        setUserModalOpen(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', password: '', role: 'user' });
      }, 1000);
    } catch (err) {
      setUserError(err.message || 'Action failed');
    }
  };

  // Handle User Edit Trigger
  const triggerUserEdit = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '', // blank by default
      role: u.role
    });
    setUserModalOpen(true);
  };

  // Handle User Delete
  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.adminDeleteUser(userId);
        await loadUsers();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  // Handle Price Submit (Create/Update)
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    priceSetError('');
    priceSetSuccess('');

    try {
      const payload = {
        ...priceForm,
        value: parseFloat(priceForm.value),
        year: parseInt(priceForm.year),
        month: parseInt(priceForm.month)
      };

      if (editingPrice) {
        await api.adminUpdatePrice(editingPrice._id, payload);
        priceSetSuccess('Price record updated');
      } else {
        await api.adminCreatePrice(payload);
        priceSetSuccess('Price record created');
      }

      await loadPrices();
      setTimeout(() => {
        setPriceModalOpen(false);
        setEditingPrice(null);
        setPriceForm({
          country: '',
          countryLabel: '',
          indicator: '',
          indicatorLabel: '',
          value: '',
          year: new Date().getFullYear(),
          month: 1,
          freq: 'M'
        });
      }, 1000);
    } catch (err) {
      priceSetError(err.message || 'Action failed');
    }
  };

  // Handle Price Edit Trigger
  const triggerPriceEdit = (p) => {
    setEditingPrice(p);
    setPriceForm({
      country: p.country,
      countryLabel: p.countryLabel,
      indicator: p.indicator,
      indicatorLabel: p.indicatorLabel,
      value: p.value,
      year: p.year,
      month: p.month || 1,
      freq: p.freq || 'M'
    });
    setPriceModalOpen(true);
  };

  // Handle Price Delete
  const handlePriceDelete = async (priceId) => {
    if (window.confirm('Are you sure you want to delete this price record?')) {
      try {
        await api.adminDeletePrice(priceId);
        await loadPrices();
      } catch (err) {
        alert(err.message || 'Failed to delete price record');
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8" style={{ marginBottom: '32px' }}>
        <div>
          <h2>👑 Administrative Console</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            System overview and CRUD databases directly from MongoDB.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Overview Statistics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          MongoDB Users CRUD
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`btn ${activeTab === 'prices' ? 'btn-primary' : 'btn-secondary'}`}
        >
          MongoDB Prices CRUD
        </button>
      </div>

      {/* TAB: OVERVIEW STATS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {statsLoading ? (
            <div className="grid grid-cols-3">
              <div className="skeleton" style={{ height: '140px' }}></div>
              <div className="skeleton" style={{ height: '140px' }}></div>
              <div className="skeleton" style={{ height: '140px' }}></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3">
                <div className="card">
                  <span className="text-mono text-muted" style={{ fontSize: '12px' }}>TOTAL MONGO PRICE RECORDS</span>
                  <h2 style={{ marginTop: '8px', fontSize: '36px' }}>{dashboardStats?.totalPrices?.toLocaleString()}</h2>
                </div>
                <div className="card">
                  <span className="text-mono text-muted" style={{ fontSize: '12px' }}>TOTAL COUNTRIES INDEXED</span>
                  <h2 style={{ marginTop: '8px', fontSize: '36px' }}>{dashboardStats?.totalCountries?.toLocaleString()}</h2>
                </div>
                <div className="card">
                  <span className="text-mono text-muted" style={{ fontSize: '12px' }}>TOTAL INDICATORS TRACKED</span>
                  <h2 style={{ marginTop: '8px', fontSize: '36px' }}>{dashboardStats?.totalIndicators?.toLocaleString()}</h2>
                </div>
              </div>

              <div className="card card-lg">
                <h3 style={{ marginBottom: '16px' }}>Aggregation Statistics</h3>
                <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>AVERAGE INDEX VALUE</span>
                    <h4 style={{ marginTop: '4px' }}>{quickStats?.avgValue?.toFixed(4)}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>MAX INDEX VALUE</span>
                    <h4 style={{ marginTop: '4px' }}>{quickStats?.maxValue?.toLocaleString()}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>MIN INDEX VALUE</span>
                    <h4 style={{ marginTop: '4px' }}>{quickStats?.minValue?.toLocaleString()}</h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>YEAR COVERAGE</span>
                    <h4 style={{ marginTop: '4px' }}>
                      {dashboardStats?.yearRange?.from} - {dashboardStats?.yearRange?.to}
                    </h4>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: USERS CRUD */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Users Directory</h4>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserForm({ name: '', email: '', password: '', role: 'user' });
                setUserModalOpen(true);
              }}
              className="btn btn-primary"
            >
              + Create User
            </button>
          </div>

          <div className="card p-0" style={{ padding: 0 }}>
            {usersLoading ? (
              <div style={{ padding: '24px' }}>
                <div className="skeleton" style={{ height: '40px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '40px' }}></div>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td className="text-mono">{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`} style={{
                            backgroundColor: u.role === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                            color: u.role === 'admin' ? '#fff' : 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            fontSize: '11px'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{new Date(u.createdAt).toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => triggerUserEdit(u)}
                            className="btn btn-secondary"
                            style={{ height: '28px', fontSize: '11px', marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleUserDelete(u._id)}
                            className="btn btn-secondary"
                            style={{ height: '28px', fontSize: '11px', color: 'var(--color-danger)' }}
                            disabled={u._id === user?._id}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PRICES CRUD */}
      {activeTab === 'prices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Price Index Records</h4>
            <div className="flex gap-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={priceSearch}
                onChange={(e) => {
                  setPriceSearch(e.target.value);
                  setPricePage(1);
                }}
                style={{ width: '200px', height: '32px' }}
              />
              <button
                onClick={() => {
                  setEditingPrice(null);
                  setPriceForm({
                    country: '',
                    countryLabel: '',
                    indicator: '',
                    indicatorLabel: '',
                    value: '',
                    year: new Date().getFullYear(),
                    month: 1,
                    freq: 'M'
                  });
                  setPriceModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ height: '32px' }}
              >
                + Add Record
              </button>
            </div>
          </div>

          <div className="card p-0" style={{ padding: 0 }}>
            {pricesLoading ? (
              <div style={{ padding: '24px' }}>
                <div className="skeleton" style={{ height: '40px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '40px' }}></div>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Indicator</th>
                      <th>Year/Month</th>
                      <th>Value</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(p => (
                      <tr key={p._id}>
                        <td>
                          {p.countryLabel} <span className="text-muted text-mono">({p.country})</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px' }}>{p.indicatorLabel}</span> <span className="text-muted text-mono text-sm">({p.indicator})</span>
                        </td>
                        <td className="text-mono">{p.year} - {p.month}</td>
                        <td className="text-mono font-semibold">{p.value}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => triggerPriceEdit(p)}
                            className="btn btn-secondary"
                            style={{ height: '28px', fontSize: '11px', marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePriceDelete(p._id)}
                            className="btn btn-secondary"
                            style={{ height: '28px', fontSize: '11px', color: 'var(--color-danger)' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center" style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Page {pricePage}</span>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary"
                style={{ height: '32px' }}
                disabled={pricePage === 1 || pricesLoading}
                onClick={() => setPricePage(p => Math.max(p - 1, 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-secondary"
                style={{ height: '32px' }}
                disabled={prices.length < priceLimit || pricesLoading}
                onClick={() => setPricePage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {userModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card card-lg" style={{ width: '450px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingUser ? 'Edit User' : 'Create User'}</h3>

            {userError && (
              <div style={{ backgroundColor: 'rgba(255,0,128,0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>
                {userError}
              </div>
            )}

            {userSuccess && (
              <div style={{ backgroundColor: 'rgba(80,227,194,0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>
                {userSuccess}
              </div>
            )}

            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password {editingUser && '(Leave blank to keep current)'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ background: 'var(--color-bg)' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE MODAL */}
      {priceModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card card-lg" style={{ width: '500px', border: '1px solid var(--color-border)', overflowY: 'auto', maxHeight: '90vh' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingPrice ? 'Edit Price Record' : 'Add Price Record'}</h3>

            {priceError && (
              <div style={{ backgroundColor: 'rgba(255,0,128,0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>
                {priceError}
              </div>
            )}

            {priceSuccess && (
              <div style={{ backgroundColor: 'rgba(80,227,194,0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px' }}>
                {priceSuccess}
              </div>
            )}

            <form onSubmit={handlePriceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Country Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. IND"
                    value={priceForm.country}
                    onChange={(e) => setPriceForm({ ...priceForm, country: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Country Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. India"
                    value={priceForm.countryLabel}
                    onChange={(e) => setPriceForm({ ...priceForm, countryLabel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Indicator Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CPI"
                    value={priceForm.indicator}
                    onChange={(e) => setPriceForm({ ...priceForm, indicator: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Indicator Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Consumer Price Index"
                    value={priceForm.indicatorLabel}
                    onChange={(e) => setPriceForm({ ...priceForm, indicatorLabel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={priceForm.year}
                    onChange={(e) => setPriceForm({ ...priceForm, year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Month</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="form-control"
                    value={priceForm.month}
                    onChange={(e) => setPriceForm({ ...priceForm, month: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Frequency</label>
                  <input
                    type="text"
                    className="form-control"
                    value={priceForm.freq}
                    onChange={(e) => setPriceForm({ ...priceForm, freq: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Index Value</label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 100.5"
                  value={priceForm.value}
                  onChange={(e) => setPriceForm({ ...priceForm, value: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
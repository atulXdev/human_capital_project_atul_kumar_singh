import { useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Prices() {
  const { preferences } = useContext(AuthContext);

  // States for pagination, filtering, sorting
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);

  const [countries, setCountries] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [years, setYears] = useState([]);

  const [filterCountry, setFilterCountry] = useState('');
  const [filterIndicator, setFilterIndicator] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortField, setSortField] = useState('-year');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch reference lists
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [countriesList, indicatorsList, yearsList] = await Promise.all([
          api.getCountries(),
          api.get('/indicators').catch(() => []), // fallback
          api.get('/years').catch(() => []) // fallback
        ]);
        setCountries(countriesList || []);
        setIndicators(indicatorsList || []);
        setYears(yearsList || []);
      } catch (err) {
        console.error('Refs load error:', err);
      }
    };
    fetchRefs();
  }, []);

  // Fetch prices based on state
  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query string
        let query = `?page=${page}&limit=${limit}`;
        if (filterCountry) query += `&country=${filterCountry}`;
        if (filterIndicator) query += `&indicator=${filterIndicator}`;
        if (filterYear) query += `&year=${filterYear}`;
        if (sortField) query += `&sort=${sortField}`;
        if (searchTerm) query += `&search=${searchTerm}`;

        const data = await api.getPrices(query);
        setPrices(data || []);

        // Also fetch total records count to simulate total pages
        // The backend `/stats/records-count` gives overall, but we can approximate or estimate
        // If the return is shorter than limit, we know it's the last page.
      } catch (err) {
        setError(err.message || 'Failed to fetch price data');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [page, limit, filterCountry, filterIndicator, filterYear, sortField, searchTerm]);

  // Reset pagination on filter change
  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const hasNextPage = prices.length === limit;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8" style={{ marginBottom: '32px' }}>
        <div>
          <h2>Data Listing Dashboard</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Explore and filter the live dataset collections directly from MongoDB.
          </p>
        </div>
        <button 
          onClick={() => {
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(prices, null, 2)
            )}`;
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', jsonString);
            downloadAnchor.setAttribute('download', `human_capital_prices_page_${page}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="btn btn-secondary"
        >
          Export Page JSON
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleSearchSubmit} className="flex gap-4 items-center">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search indicator text, country, labels..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => handleFilterChange(setSearchTerm, '')}
              style={{ height: '40px' }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="grid grid-cols-4" style={{ gap: '16px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Country</label>
            <select 
              className="form-control"
              value={filterCountry}
              onChange={(e) => handleFilterChange(setFilterCountry, e.target.value)}
              style={{ background: 'var(--color-bg)' }}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.code || c._id} value={c.code || c._id}>{c.name || c._id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Indicator Code</label>
            <select 
              className="form-control"
              value={filterIndicator}
              onChange={(e) => handleFilterChange(setFilterIndicator, e.target.value)}
              style={{ background: 'var(--color-bg)' }}
            >
              <option value="">All Indicators</option>
              {indicators.map(ind => {
                const code = typeof ind === 'string' ? ind : (ind.code || ind._id);
                return <option key={code} value={code}>{code}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Year</label>
            <select 
              className="form-control"
              value={filterYear}
              onChange={(e) => handleFilterChange(setFilterYear, e.target.value)}
              style={{ background: 'var(--color-bg)' }}
            >
              <option value="">All Years</option>
              {years.map(y => {
                const yearVal = typeof y === 'object' ? y.year || y._id : y;
                return <option key={yearVal} value={yearVal}>{yearVal}</option>;
              })}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px' }}>Sort By</label>
            <select 
              className="form-control"
              value={sortField}
              onChange={(e) => handleFilterChange(setSortField, e.target.value)}
              style={{ background: 'var(--color-bg)' }}
            >
              <option value="-year">Year (Recent First)</option>
              <option value="year">Year (Oldest First)</option>
              <option value="-value">Value (Highest First)</option>
              <option value="value">Value (Lowest First)</option>
              <option value="country">Country Name</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(255, 0, 128, 0.1)',
          border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="skeleton mb-2" style={{ height: '40px' }}></div>
            <div className="skeleton mb-2" style={{ height: '40px', animationDelay: '0.1s' }}></div>
            <div className="skeleton mb-2" style={{ height: '40px', animationDelay: '0.2s' }}></div>
            <div className="skeleton mb-2" style={{ height: '40px', animationDelay: '0.3s' }}></div>
            <div className="skeleton mb-2" style={{ height: '40px', animationDelay: '0.4s' }}></div>
          </div>
        ) : prices.length === 0 ? (
          <div className="text-center" style={{ padding: '48px', color: 'var(--color-text-secondary)' }}>
            No price records found matching your filters.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>Country</th>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>Indicator Code / Label</th>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>Year</th>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>Month</th>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>Frequency</th>
                  <th style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', textAlign: 'right' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, i) => (
                  <tr key={p._id || i}>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', fontWeight: 500 }}>
                      {p.countryLabel || p.country} <span className="text-muted text-mono text-sm">({p.country})</span>
                    </td>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px' }}>
                      <span className="badge badge-secondary" style={{ marginRight: '8px', fontSize: '10px', textTransform: 'none' }}>{p.indicator}</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{p.indicatorLabel}</span>
                    </td>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', fontFamily: 'var(--font-mono)' }}>{p.year}</td>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', fontFamily: 'var(--font-mono)' }}>{p.month || 'N/A'}</td>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', fontFamily: 'var(--font-mono)' }}>
                      <span className="badge badge-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '10px' }}>{p.freq || 'Y'}</span>
                    </td>
                    <td style={{ padding: preferences.compactMode ? '8px 12px' : '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-accent)', textAlign: 'right' }}>
                      {p.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Showing {prices.length} records on page {page}
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => Math.max(p - 1, 1))} 
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
            Page {page}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => p + 1)} 
            disabled={!hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
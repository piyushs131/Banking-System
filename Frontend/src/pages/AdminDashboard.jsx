import React, { useEffect, useState } from 'react';
import SecurityAlert from '../components/SecurityAlert';

const filterAccounts = (accounts, query) => {
  if (!query) return accounts;
  return accounts.filter(acc =>
    acc.email.toLowerCase().includes(query.toLowerCase()) ||
    acc.reason.toLowerCase().includes(query.toLowerCase()) ||
    acc.status.toLowerCase().includes(query.toLowerCase())
  );
};

const AdminDashboard = () => {
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Fetch flagged accounts and suspicious activity from backend
    fetch('/api/admin/flagged-accounts', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setFlaggedAccounts(data.accounts);
        else setError(data.message || 'Failed to load flagged accounts');
      })
      .catch(() => setError('Network error'));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>Admin Dashboard: Flagged Accounts</h2>
      {error && <SecurityAlert type="danger" message={error} />}
        <button
          style={{ marginBottom: 16, background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => {
            // Export flagged accounts as CSV
            const csvRows = [
              ['Email', 'Reason', 'Last Activity', 'Status'],
              ...filterAccounts(flaggedAccounts, search).map(acc => [
                acc.email,
                acc.reason,
                new Date(acc.lastActivity).toLocaleString(),
                acc.status
              ])
            ];
            const csvContent = csvRows.map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flagged_accounts.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
          Export Flagged Accounts (CSV)
        </button>
        <input
          type="text"
          placeholder="Search by email, reason, status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
      <ul style={{ listStyle: 'none', padding: 0 }}>
          {filterAccounts(flaggedAccounts, search).map((acc, idx) => (
            <li key={idx} style={{ marginBottom: 16, background: '#fffbe6', padding: 16, borderRadius: 8 }}>
              <div><b>User:</b> {acc.email}</div>
              <div><b>Reason:</b> {acc.reason}</div>
              <div><b>Last Activity:</b> {new Date(acc.lastActivity).toLocaleString()}</div>
              <div><b>Status:</b> {acc.status}</div>
              <button
                style={{ marginTop: 8, background: acc.status === 'Frozen' ? '#1890ff' : '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}
                disabled={freezeLoading}
                onClick={async () => {
                  setFreezeLoading(true);
                  setSelected(acc.email);
                  try {
                    const res = await fetch(`/api/admin/freeze-account`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ email: acc.email, freeze: acc.status !== 'Frozen' })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setFlaggedAccounts(prev => prev.map(a => a.email === acc.email ? { ...a, status: data.status } : a));
                    }
                  } catch {
                    setError('Failed to update account status');
                  } finally {
                    setFreezeLoading(false);
                    setSelected(null);
                  }
                }}
              >
                {freezeLoading && selected === acc.email ? 'Processing...' : acc.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
              </button>
              <button
                style={{ marginLeft: 8, background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setSelected(selected === acc.email ? null : acc.email)}
              >
                {selected === acc.email ? 'Hide Details' : 'View Details'}
              </button>
              {selected === acc.email && (
                <div style={{ marginTop: 12, background: '#e6f7ff', padding: 12, borderRadius: 6 }}>
                  <div><b>Profile:</b> {JSON.stringify(acc.profile, null, 2)}</div>
                  <div><b>Recent Activity:</b> {JSON.stringify(acc.activity, null, 2)}</div>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;

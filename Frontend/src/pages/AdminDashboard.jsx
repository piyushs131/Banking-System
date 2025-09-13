import React, { useEffect, useState } from 'react';
import SecurityAlert from '../components/SecurityAlert';

const AdminDashboard = () => {
  const [flaggedAccounts, setFlaggedAccounts] = useState([]);
  const [error, setError] = useState('');

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
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {flaggedAccounts.map((acc, idx) => (
          <li key={idx} style={{ marginBottom: 16, background: '#fffbe6', padding: 16, borderRadius: 8 }}>
            <div><b>User:</b> {acc.email}</div>
            <div><b>Reason:</b> {acc.reason}</div>
            <div><b>Last Activity:</b> {new Date(acc.lastActivity).toLocaleString()}</div>
            <div><b>Status:</b> {acc.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;

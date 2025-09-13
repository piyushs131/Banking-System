import React, { useEffect, useState } from 'react';
import SecurityAlert from '../components/SecurityAlert';

const LoginActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch login activity from backend
    fetch('/api/profile/login-activity', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setActivity(data.loginHistory);
        else setError(data.message || 'Failed to load activity');
      })
      .catch(() => setError('Network error'));
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Recent Login Activity</h2>
      {error && <SecurityAlert type="danger" message={error} />}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activity.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 16, background: '#fafafa', padding: 16, borderRadius: 8 }}>
            <div><b>Date:</b> {new Date(item.date).toLocaleString()}</div>
            <div><b>IP:</b> {item.ip}</div>
            <div><b>Device:</b> {item.userAgent}</div>
            <div><b>Location:</b> {item.location}</div>
            <div><b>Status:</b> {item.successful ? 'Successful' : 'Failed'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoginActivityPage;

import React from 'react';

const DownloadStatementButton = ({ userId }) => {
  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/account/statement?userId=${userId}`, {
        credentials: 'include',
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Account_Statement.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert('Failed to download statement');
    }
  };

  return (
    <button
      style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer' }}
      onClick={handleDownload}
    >
      Download Account Statement (PDF)
    </button>
  );
};

export default DownloadStatementButton;

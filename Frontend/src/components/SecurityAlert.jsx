import React from 'react';

const SecurityAlert = ({ type, message }) => {
  const getColor = () => {
    switch (type) {
      case 'danger': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'info': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  return (
    <div style={{
      background: getColor(),
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontWeight: 'bold',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {message}
    </div>
  );
};

export default SecurityAlert;

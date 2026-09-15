import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPlaceholder() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0d18',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#13192e',
        border: '1px solid rgba(0, 210, 255, 0.2)',
        borderRadius: '12px',
        padding: '2.5rem',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(0, 210, 255, 0.1)',
          color: '#00d2ff',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '1px',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          Protected Admin Workspace
        </div>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>
          Admin Dashboard
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Temporary admin placeholder for testing role-based access control.
        </p>

        <div style={{
          backgroundColor: '#0a0d18',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
          fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>Full Name: </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user?.fullName || 'N/A'}</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>User Email: </span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user?.email}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Role: </span>
            <span style={{
              color: '#00d2ff',
              fontWeight: 700,
              textTransform: 'uppercase',
              backgroundColor: 'rgba(0, 210, 255, 0.15)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>{user?.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            Go to Main App
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ff4757',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

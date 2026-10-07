
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * InstructorPortalPlaceholder
 * 
 * Provides a dedicated, secure landing placeholder for authenticated instructors.
 * The full Instructor Portal and Course Management Studio will be implemented in Phase 5.
 */
export default function InstructorPortalPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'rgba(20, 26, 40, 0.9)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#f59e0b',
            fontSize: '1.75rem',
          }}
        >
          <i className="fa-solid fa-chalkboard-user"></i>
        </div>

        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}
        >
          Instructor Portal
        </span>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>
          Welcome, {user?.fullName || 'Instructor'}
        </h2>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Your instructor credentials are verified. The dedicated Instructor Dashboard and Course Management studio are being initialized in Phase 5.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            className="btn"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <i className="fa-solid fa-house" style={{ marginRight: '8px' }}></i> Return Home
          </Link>

          <button
            onClick={logout}
            className="btn"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'rgba(255, 50, 50, 0.15)',
              border: '1px solid rgba(255, 50, 50, 0.3)',
              color: '#ff4757',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '8px' }}></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

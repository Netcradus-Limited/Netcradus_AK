import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function InstructorProfile() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>Faculty Profile</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          Official academic faculty credentials and session details.
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="admin-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--cyan-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '2px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <i className="fa-solid fa-chalkboard-user"></i>
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--white)', margin: 0 }}>
              {user?.fullName || 'Faculty Member'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--cyan-primary)',
                  textTransform: 'uppercase',
                }}
              >
                {user?.role || 'instructor'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Account Status: <strong style={{ color: '#2ed573' }}>{user?.status || 'active'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <div style={{ fontSize: '0.92rem', color: 'var(--white)', marginTop: '4px', fontWeight: 500 }}>
              {user?.email || 'N/A'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contact Phone
            </label>
            <div style={{ fontSize: '0.92rem', color: 'var(--white)', marginTop: '4px', fontWeight: 500 }}>
              {user?.phone || 'Not configured'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Member Since
            </label>
            <div style={{ fontSize: '0.92rem', color: 'var(--white)', marginTop: '4px', fontWeight: 500 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </div>
          </div>
        </div>
      </div>

      {/* Permissions & Security Scope */}
      <div
        className="admin-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
        }}
      >
        <h4 style={{ fontSize: '1rem', color: 'var(--white)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--cyan-primary)' }}></i>
          Faculty Permissions & Security Scope
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
          Your account is provisioned with <strong>Instructor</strong> privileges. You have authoritative permissions to author courses, design curriculum modules, configure multiple-choice quizzes, set practical lab assignments, review student code repositories, and award grades. All operations are strictly authenticated and scoped to your assigned teaching portfolio.
        </p>
      </div>
    </div>
  );
}

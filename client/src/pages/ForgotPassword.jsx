import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    setSubmitting(true);
    try {
      await authService.forgotPassword(trimmedEmail);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to submit request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your registered email to receive secure recovery instructions"
      singleCard={true}
    >
      {submitted ? (
        <div className="auth-success-state" style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 210, 255, 0.1)',
              border: '1px solid var(--cyan-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--cyan-primary)',
              fontSize: '1.4rem',
            }}
          >
            <i className="fa-solid fa-envelope-circle-check"></i>
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>Check Your Email</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Check your inbox. We've sent a link to reset your password if your email is registered.
          </p>
          <div style={{ marginTop: '24px' }}>
            <Link to="/login" className="btn btn-login-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
              RETURN TO LOGIN
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              style={{
                background: 'rgba(255, 50, 50, 0.1)',
                color: '#ff4757',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                marginBottom: '20px',
                border: '1px solid rgba(255,50,50,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="recoveryEmail">Registered Email Address *</label>
            <input
              type="email"
              id="recoveryEmail"
              name="email"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="e.g. student@netcradus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-login-submit"
            disabled={submitting}
            style={{ marginTop: '10px' }}
          >
            {submitting ? (
              <span>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> SENDING INSTRUCTIONS...
              </span>
            ) : (
              'SEND RESET LINK'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Remember your credentials?{' '}
            <Link to="/login" style={{ color: 'var(--cyan-primary)', fontWeight: 500, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

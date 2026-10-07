import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import { authService } from '../services/authService';
import { useApp } from '../App';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.password) {
      errs.password = 'New password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 128) {
      errs.password = 'Password cannot exceed 128 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!token) {
      setApiError('Invalid or missing password reset token.');
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, formData.password, formData.confirmPassword);
      setResetSuccess(true);
      showToast('Password reset successful! Please log in with your new password.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setApiError(err.message || 'Password reset token is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Ensure your new password is at least 8 characters and secure"
      singleCard={true}
    >
      {resetSuccess ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--cyan-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--cyan-primary)',
              fontSize: '1.4rem',
            }}
          >
            <i className="fa-solid fa-check"></i>
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>Password Updated!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Your password has been changed successfully. Redirecting to login in a moment...
          </p>
          <Link to="/login" className="btn btn-login-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
            GO TO LOGIN NOW
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {apiError && (
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
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{apiError}</span>
              </div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                Need a new link?{' '}
                <Link to="/forgot-password" style={{ color: '#f59e0b', textDecoration: 'underline' }}>
                  Request another password reset
                </Link>
              </div>
            </div>
          )}

          <PasswordInput
            id="newPassword"
            name="password"
            label="New Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="At least 8 characters"
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Re-enter your new password"
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="btn btn-login-submit"
            disabled={submitting}
            style={{ marginTop: '10px' }}
          >
            {submitting ? (
              <span>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> UPDATING PASSWORD...
              </span>
            ) : (
              'SAVE NEW PASSWORD'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Remembered your old password?{' '}
            <Link to="/login" style={{ color: 'var(--cyan-primary)', fontWeight: 500, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

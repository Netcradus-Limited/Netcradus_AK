import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { showToast } = useApp();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    const emailTrimmed = formData.email.trim();

    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      showToast(`Welcome back, ${user.fullName || 'User'}! Logged in successfully.`);
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.message || 'Login failed. Please verify your email and password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    showToast('Google OAuth authentication will be enabled when backend auth integration is configured.');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your Student Dashboard & Courses"
      singleCard={true}
    >
      {notice && (
        <div
          style={{
            background: notice.type === 'error' ? 'rgba(255, 50, 50, 0.1)' : 'rgba(0, 210, 255, 0.08)',
            color: notice.type === 'error' ? '#ff4757' : 'var(--cyan-primary)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            border: notice.type === 'error' ? '1px solid rgba(255,50,50,0.3)' : '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <i className={`fa-solid ${notice.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
          <span>{notice.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="loginEmail">Email Address *</label>
          <input
            type="email"
            id="loginEmail"
            name="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="e.g. rahul@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
            required
          />
          {errors.email && (
            <div
              className="field-error"
              style={{
                color: '#ff4757',
                fontSize: '0.8rem',
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <i className="fa-solid fa-circle-exclamation"></i> {errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <PasswordInput
          id="loginPassword"
          name="password"
          label="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
        />

        {/* Options Row: Remember Me & Forgot Password */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '22px',
            fontSize: '0.85rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px' }}
            />
            Remember Me
          </label>
          <button
            type="button"
            className="btn-link"
            style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', fontWeight: 500 }}
            onClick={() => showToast('Password reset link service will be enabled in future phase.')}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-login-submit" disabled={submitting}>
          {submitting ? (
            <span>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> VERIFYING...
            </span>
          ) : (
            'LOGIN TO DASHBOARD'
          )}
        </button>
      </form>

      {/* OR Divider */}
      <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '15px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          OR
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
      </div>

      {/* Google OAuth UI Button */}
      <button
        type="button"
        className="btn-google"
        onClick={handleGoogleSignIn}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'var(--transition)',
          cursor: 'pointer',
          marginBottom: '25px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Footer Navigation */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--cyan-primary)', fontWeight: 600 }}>
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
}

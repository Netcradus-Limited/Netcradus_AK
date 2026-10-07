import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { showToast } = useApp();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  // Password Strength Calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#ff4757' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: '#ffa502' };
    return { score: 3, label: 'Strong', color: '#f59e0b' };
  };

  const strength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions and Privacy Policy';
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
      const user = await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeTerms: formData.agreeTerms,
      });
      showToast(`Account created successfully! Welcome to Netcradus, ${user.fullName}.`);
      navigate('/', { replace: true });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.message || 'Registration failed. Please check your form details.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Student Account"
      subtitle="Start your learning journey with Netcradus Academia"
      badgeText="NEW STUDENT REGISTRATION"
      leftTagline="Join the Premier Cybersecurity & AI Community"
    >
      {notice && (
        <div
          style={{
            background: notice.type === 'error' ? 'rgba(255, 50, 50, 0.1)' : 'rgba(245, 158, 11, 0.08)',
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
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="signupName">Full Name *</label>
          <input
            type="text"
            id="signupName"
            name="fullName"
            className={`form-input ${errors.fullName ? 'input-error' : ''}`}
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            autoComplete="name"
            required
          />
          {errors.fullName && (
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
              <i className="fa-solid fa-circle-exclamation"></i> {errors.fullName}
            </div>
          )}
        </div>

        {/* Email & Phone Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="signupEmail">Email Address *</label>
            <input
              type="email"
              id="signupEmail"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="rahul@example.com"
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

          <div className="form-group">
            <label htmlFor="signupPhone">Phone Number *</label>
            <input
              type="tel"
              id="signupPhone"
              name="phone"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              autoComplete="tel"
              required
            />
            {errors.phone && (
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
                <i className="fa-solid fa-circle-exclamation"></i> {errors.phone}
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <PasswordInput
          id="signupPassword"
          name="password"
          label="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
          autoComplete="new-password"
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <div style={{ marginTop: '-10px', marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
              <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
            </div>
            <div
              style={{
                height: '4px',
                background: 'var(--bg-dark)',
                borderRadius: '2px',
                overflow: 'hidden',
                display: 'flex',
                gap: '4px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)',
                  transition: 'var(--transition)',
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  background: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)',
                  transition: 'var(--transition)',
                }}
              ></div>
              <div
                style={{
                  flex: 1,
                  background: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)',
                  transition: 'var(--transition)',
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <PasswordInput
          id="signupConfirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        {/* Terms Agreement Checkbox */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              style={{ accentColor: 'var(--cyan-primary)', width: '16px', height: '16px', marginTop: '2px' }}
            />
            <span>
              I agree to the{' '}
              <button
                type="button"
                className="btn-link"
                style={{ color: 'var(--cyan-primary)' }}
                onClick={() => showToast('Terms & Conditions document.')}
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="btn-link"
                style={{ color: 'var(--cyan-primary)' }}
                onClick={() => showToast('Privacy Policy document.')}
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>
          {errors.agreeTerms && (
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
              <i className="fa-solid fa-circle-exclamation"></i> {errors.agreeTerms}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-cyan btn-block" disabled={submitting}>
          {submitting ? (
            <span>
              <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> CREATING ACCOUNT...
            </span>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--cyan-primary)', fontWeight: 600 }}>
          Login
        </Link>
      </div>
    </AuthLayout>
  );
}

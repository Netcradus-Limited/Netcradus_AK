import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminCertificates() {
  const { showToast } = useApp();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);

  // Revocation Modal State
  const [selectedCert, setSelectedCert] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState(null);

  // Detail Modal State (inspecting full snapshot/audit metadata)
  const [detailCert, setDetailCert] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCertificates({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setCertificates(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalCertificates(res.total || 0);
    } catch (err) {
      console.error('[AdminCertificates] Fetch error:', err);
      setError(err.message || 'Failed to fetch certificate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, statusFilter, page]);

  const handleOpenRevokeModal = (cert) => {
    if (cert.status === 'revoked') {
      showToast('This certificate has already been revoked.');
      return;
    }
    setSelectedCert(cert);
    setRevocationReason('');
    setRevokeError(null);
    setShowRevokeModal(true);
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCert) return;

    const trimmedReason = revocationReason.trim();
    if (!trimmedReason || trimmedReason.length < 3) {
      setRevokeError('Please provide a meaningful revocation reason (at least 3 characters).');
      return;
    }

    setRevoking(true);
    setRevokeError(null);

    try {
      const res = await adminService.revokeCertificate(selectedCert._id, trimmedReason);
      showToast(res.message || `Certificate ${selectedCert.certificateId} revoked successfully.`);
      setShowRevokeModal(false);
      setSelectedCert(null);
      setRevocationReason('');
      fetchCertificates();
    } catch (err) {
      console.error('[AdminCertificates] Revocation error:', err);
      setRevokeError(err.message || 'Failed to revoke certificate.');
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Certificate Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Audit, verify, and administer student digital credentials and certificate revocations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search by certificate ID, student name, email, or course..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0 8px',
              }}
              title="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Certificates Registry{' '}
            <span className="admin-count-pill">{totalCertificates} Issued</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading certificate registry records...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchCertificates} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : certificates.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-award" style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--text-muted)' }}></i>
              <p>No certificates found matching your criteria.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Student</th>
                    <th>Course Track</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                    <th>Revocation Audit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert._id}>
                      {/* Certificate ID */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              color: 'var(--cyan-primary, #00ffc2)',
                              fontSize: '0.88rem',
                            }}
                          >
                            {cert.certificateId}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ID: {cert._id}
                        </div>
                      </td>

                      {/* Student Details */}
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {cert.studentName || cert.userId?.fullName || 'Anonymous / Removed'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {cert.userId?.email || 'N/A'}
                        </div>
                      </td>

                      {/* Course Track */}
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {cert.courseName || cert.courseId?.title || 'Course'}
                        </strong>
                        {cert.courseId?.category && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {cert.courseId.category}
                          </div>
                        )}
                      </td>

                      {/* Issue Date */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {formatDate(cert.issueDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-badge ${cert.status === 'active' ? 'success' : 'danger'}`}
                          style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                          {cert.status}
                        </span>
                      </td>

                      {/* Revocation Audit */}
                      <td>
                        {cert.status === 'revoked' ? (
                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#ff4757', fontWeight: 600 }}>
                              <i className="fa-solid fa-calendar-xmark" style={{ marginRight: '4px' }}></i>
                              {formatDate(cert.revokedAt)}
                            </div>
                            {cert.revocationReason ? (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginTop: '2px',
                                  maxWidth: '220px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={cert.revocationReason}
                              >
                                <em>"{cert.revocationReason}"</em>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Direct view link into existing verification portal */}
                          <a
                            href={`/certificate?id=${encodeURIComponent(cert.certificateId)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-admin-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
                            title="Open Certificate in Verification Portal"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i> View
                          </a>

                          {/* Quick Audit Snapshot Details */}
                          <button
                            type="button"
                            className="btn-admin-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            onClick={() => setDetailCert(cert)}
                            title="View Audit Metadata"
                          >
                            <i className="fa-solid fa-circle-info"></i>
                          </button>

                          {/* Revoke Action */}
                          {cert.status === 'active' ? (
                            <button
                              type="button"
                              className="btn-admin-danger"
                              style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleOpenRevokeModal(cert)}
                              title="Revoke Certificate"
                            >
                              <i className="fa-solid fa-ban"></i> Revoke
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#ff4757',
                                fontWeight: 600,
                                padding: '6px 8px',
                                background: 'rgba(255, 71, 87, 0.08)',
                                borderRadius: '4px',
                                border: '1px solid rgba(255, 71, 87, 0.2)',
                              }}
                              title="Certificate is already revoked and cannot be modified"
                            >
                              <i className="fa-solid fa-lock"></i> Revoked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-pagination"
              >
                <i className="fa-solid fa-chevron-left"></i> Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-pagination"
              >
                Next <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REVOKE CERTIFICATE MODAL */}
      {showRevokeModal && selectedCert && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#ff4757', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                Revoke Certificate
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRevokeModal(false)}
                disabled={revoking}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit}>
              <div className="modal-body">
                {revokeError && (
                  <div className="admin-alert danger" style={{ marginBottom: '16px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{revokeError}</span>
                  </div>
                )}

                <div
                  style={{
                    background: 'rgba(255, 71, 87, 0.08)',
                    border: '1px solid rgba(255, 71, 87, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '0.88rem',
                  }}
                >
                  <p style={{ color: '#ff4757', fontWeight: 600, margin: '0 0 6px 0' }}>
                    Warning: Irreversible Credential Revocation
                  </p>
                  <p style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    Revoking this certificate will invalidate the public verification entry. Anyone checking this Certificate ID will see that it has been revoked. This action cannot be undone.
                  </p>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <div><strong>Certificate:</strong> <code>{selectedCert.certificateId}</code></div>
                    <div><strong>Student:</strong> {selectedCert.studentName}</div>
                    <div><strong>Course:</strong> {selectedCert.courseName}</div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Revocation Reason *
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="form-control"
                    placeholder="Provide a mandatory reason (e.g. Academic dishonesty, enrollment cancellation, administrative audit)..."
                    value={revocationReason}
                    onChange={(e) => setRevocationReason(e.target.value)}
                    disabled={revoking}
                    style={{
                      width: '100%',
                      background: 'var(--bg-card, #111a2e)',
                      color: 'var(--text-main, #fff)',
                      border: '1px solid var(--border-color, #202b3c)',
                      borderRadius: '6px',
                      padding: '10px',
                      resize: 'vertical',
                    }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    This reason will be stored permanently in the certificate audit log.
                  </small>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setShowRevokeModal(false)}
                  disabled={revoking}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-danger"
                  disabled={revoking || !revocationReason.trim()}
                >
                  {revoking ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Revoking...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-ban"></i> Confirm Revocation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE AUDIT DETAILS MODAL */}
      {detailCert && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--cyan-primary, #00ffc2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-award"></i>
                Certificate Audit Details
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setDetailCert(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certificate ID</span>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--cyan-primary)' }}>
                    {detailCert.certificateId}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
                  <div>
                    <span className={`admin-badge ${detailCert.status === 'active' ? 'success' : 'danger'}`}>
                      {detailCert.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Snapshot</span>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{detailCert.studentName}</div>
                {detailCert.userId?.email && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{detailCert.userId.email}</div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Course Track Snapshot</span>
                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{detailCert.courseName}</div>
                {detailCert.courseId?.category && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{detailCert.courseId.category}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issued Date</span>
                  <div style={{ color: 'var(--text-main)' }}>{formatDate(detailCert.issueDate)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record Created</span>
                  <div style={{ color: 'var(--text-main)' }}>{formatDateTime(detailCert.createdAt)}</div>
                </div>
              </div>

              {detailCert.status === 'revoked' && (
                <div
                  style={{
                    background: 'rgba(255, 71, 87, 0.08)',
                    border: '1px solid rgba(255, 71, 87, 0.25)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px',
                  }}
                >
                  <div style={{ color: '#ff4757', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                    <i className="fa-solid fa-circle-xmark"></i> Revocation Record
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    <strong>Revoked At:</strong> {formatDateTime(detailCert.revokedAt)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <strong>Reason:</strong> <em>{detailCert.revocationReason || 'No reason specified'}</em>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href={`/certificate?id=${encodeURIComponent(detailCert.certificateId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-admin-primary"
                style={{ fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Verification Portal
              </a>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setDetailCert(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

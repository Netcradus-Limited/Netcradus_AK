import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPayments({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setPayments(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalPayments(res.total || 0);
    } catch (err) {
      console.error('[AdminPayments] Fetch error:', err);
      setError(err.message || 'Failed to fetch payment transaction records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
      case 'created':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatAmount = (amountInPaise, currency = 'INR') => {
    if (typeof amountInPaise !== 'number') return '—';
    const amountRupees = amountInPaise / 100;
    if (currency === 'INR') {
      return `₹${amountRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currency} ${amountRupees.toFixed(2)}`;
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            Payments
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            View payment transaction records and payment status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search by student name, email, order ID, or payment ID..."
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
            <option value="created">Created</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Payment Ledger <span className="admin-count-pill">{totalPayments} Transactions</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading payment ledger records...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchPayments} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-receipt" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No payment transactions found.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Provider</th>
                    <th>Transaction Details</th>
                    <th>Status</th>
                    <th>Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      {/* Student Details */}
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {p.userId?.fullName || 'Anonymous / Removed'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {p.userId?.email || 'N/A'}
                        </div>
                        {p.userId?.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {p.userId.phone}
                          </div>
                        )}
                      </td>

                      {/* Course Title */}
                      <td>
                        <strong style={{ color: 'var(--cyan-primary)' }}>
                          {p.courseId?.title || 'Unknown / Deleted Course'}
                        </strong>
                        {p.courseId?.category && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {p.courseId.category}
                          </div>
                        )}
                      </td>

                      {/* Amount & Currency */}
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {formatAmount(p.amount, p.currency)}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.currency || 'INR'}
                        </div>
                      </td>

                      {/* Payment Provider */}
                      <td>
                        <span
                          className="admin-badge info"
                          style={{ textTransform: 'capitalize', fontWeight: '600' }}
                        >
                          {p.provider || 'Razorpay'}
                        </span>
                        {p.paymentMethod && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {p.paymentMethod}
                          </div>
                        )}
                      </td>

                      {/* Order & Payment IDs */}
                      <td>
                        {p.razorpayPaymentId ? (
                          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Pay: </span>
                            {p.razorpayPaymentId}
                          </div>
                        ) : null}
                        {p.razorpayOrderId ? (
                          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            <span>Order: </span>
                            {p.razorpayOrderId}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            ID: {p._id}
                          </div>
                        )}
                        {p.failureReason && (
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>
                            Reason: {p.failureReason}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`admin-badge ${getStatusBadge(p.status)}`}
                          style={{ textTransform: 'uppercase' }}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Dates */}
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </div>
                        {p.paidAt && (
                          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                            Paid: {new Date(p.paidAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        )}
                        {p.refundedAt && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Refunded: {new Date(p.refundedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        )}
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
    </div>
  );
}

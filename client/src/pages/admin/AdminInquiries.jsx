import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminInquiries() {
  const { showToast } = useApp();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInquiries, setTotalInquiries] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getInquiries({
        search,
        status: statusFilter,
        source: sourceFilter,
        page,
        limit: 15,
      });
      setInquiries(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalInquiries(res.total || 0);
    } catch (err) {
      console.error('[AdminInquiries] Fetch error:', err);
      setError(err.message || 'Failed to fetch inquiries data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [search, statusFilter, sourceFilter, page]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminService.updateInquiryStatus(id, newStatus);
      showToast(`Inquiry status updated to '${newStatus}'`);
      fetchInquiries();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return 'warning';
      case 'contacted':
        return 'info';
      case 'converted':
        return 'success';
      case 'closed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="admin-page">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search leads by name, email, phone, course or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
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
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label>Source:</label>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Sources</option>
            <option value="contact_page">Contact Page</option>
            <option value="quick_enquiry">Quick Enquiry</option>
            <option value="callback_request">Callback Request</option>
            <option value="demo_request">Demo Request</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Leads & Inquiries <span className="admin-count-pill">{totalInquiries} Records</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading inquiries data...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchInquiries} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No inquiry leads match your search or filter criteria.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Contact Info</th>
                    <th>Course Interest</th>
                    <th>Source</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq._id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{inq.fullName}</strong>
                      </td>
                      <td>
                        {inq.email && <div>{inq.email}</div>}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inq.phone}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--cyan-primary)' }}>{inq.interestedCourse}</strong>
                      </td>
                      <td>
                        <span className="admin-badge secondary">{inq.source}</span>
                      </td>
                      <td style={{ maxWidth: '220px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {inq.message || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No message</span>}
                      </td>
                      <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-badge ${getStatusBadge(inq.status)}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-inline-select"
                          value={inq.status}
                          disabled={updatingId === inq._id}
                          onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
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

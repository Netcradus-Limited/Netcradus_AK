import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { certificateService } from '../services/certificateService';

export default function Certificate() {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const [certId, setCertId] = useState(queryId || '');
  const [verifying, setVerifying] = useState(false);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  const { showToast } = useApp();

  // Execute verification against real backend API
  const performVerification = async (targetId) => {
    const cleanId = (targetId || '').trim();
    if (!cleanId) {
      showToast('Please enter a Certificate ID.');
      return;
    }

    setVerifying(true);
    setError(null);
    setCertData(null);

    try {
      const data = await certificateService.verifyCertificate(cleanId);
      setCertData(data);
      if (data.status === 'revoked') {
        showToast('Notice: This credential has been revoked by administration.');
      } else {
        showToast('Official credential verified successfully!');
      }
    } catch (err) {
      const errorMsg = err.message || 'Credential Not Found. The specified Certificate ID is not in our verified registry.';
      setError(errorMsg);
      showToast(errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  // Auto-verify if id query parameter is provided in URL
  useEffect(() => {
    if (queryId && queryId.trim()) {
      setCertId(queryId.trim());
      performVerification(queryId.trim());
    }
  }, [queryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performVerification(certId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!certData) return;
    const shareUrl = `${window.location.origin}/certificate?id=${certData.certificateId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      showToast('Verification URL copied to clipboard!');
    } else {
      showToast(`Verification link: ${shareUrl}`);
    }
  };

  const formattedDate = certData?.issueDate
    ? new Date(certData.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="certificate-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge"><i className="fa-solid fa-award"></i> VERIFICATION PORTAL</span>
          <h1 className="page-title">Credential Verification Portal</h1>
          <p className="page-subtitle">Verify student certification status or download accredited digital certificates.</p>
        </div>
      </section>

      {/* CERTIFICATE & VERIFICATION SECTION */}
      <section className="section certificate-section" id="certificate">
        <div className="container">
          <div className="cert-grid-2col">
            
            {/* Verification Tool Box */}
            <div className="cert-verify-card">
              <div className="verify-header">
                <i className="fa-solid fa-shield-check verify-icon"></i>
                <h3>Credential Verification Portal</h3>
                <p>Enter the Certificate ID printed on the official certificate to verify authenticity.</p>
              </div>

              <form onSubmit={handleSubmit} className="verify-form">
                <div className="form-group">
                  <label htmlFor="certIdInput">Certificate ID Number *</label>
                  <div className="input-with-btn">
                    <input
                      type="text"
                      id="certIdInput"
                      className="form-input"
                      placeholder="e.g. NC-2026-XXXXXXXX"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-cyan" disabled={verifying}>
                      {verifying ? (
                        <span><i className="fa-solid fa-spinner fa-spin"></i> VERIFYING...</span>
                      ) : (
                        <span><i className="fa-solid fa-magnifying-glass"></i> VERIFY</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Verification Result Display Box */}
              {certData && (
                <div className="cert-result-box" style={{ display: 'block', animation: 'fadeIn 0.5s ease' }}>
                  {certData.status === 'revoked' ? (
                    <div className="result-status revoked" style={{ color: '#ff4757', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '15px' }}>
                      <i className="fa-solid fa-circle-xmark"></i> CREDENTIAL REVOKED
                    </div>
                  ) : (
                    <div className="result-status valid">
                      <i className="fa-solid fa-circle-check"></i> OFFICIAL CREDENTIAL VERIFIED
                    </div>
                  )}

                  <div className="result-details">
                    <div className="rd-row"><span>Student Name:</span><strong>{certData.studentName}</strong></div>
                    <div className="rd-row"><span>Program / Track:</span><strong>{certData.courseName}</strong></div>
                    <div className="rd-row"><span>Certificate ID:</span><code>{certData.certificateId}</code></div>
                    <div className="rd-row"><span>Issue Date:</span><strong>{formattedDate}</strong></div>
                    <div className="rd-row"><span>Status:</span><strong style={{ color: certData.status === 'active' ? '#2ed573' : '#ff4757', textTransform: 'uppercase' }}>{certData.status}</strong></div>
                    {certData.revokedAt && (
                      <div className="rd-row">
                        <span>Revocation Date:</span>
                        <strong style={{ color: '#ff4757' }}>
                          {new Date(certData.revokedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </strong>
                      </div>
                    )}
                    <div className="rd-row"><span>Accreditation:</span><strong>ISO 9001:2015 & Industry Aligned</strong></div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-cyan btn-block"
                    onClick={handlePrint}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    <i className="fa-solid fa-print"></i> Print / Save as PDF
                  </button>
                </div>
              )}

              {/* Error / Not Found Display Box */}
              {error && (
                <div className="cert-result-box" style={{ display: 'block', animation: 'fadeIn 0.5s ease', borderLeft: '3px solid #ff4757' }}>
                  <div style={{ color: '#ff4757', fontWeight: 800, fontSize: '0.92rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> Credential Not Found
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Live Digital Certificate Display */}
            <div className="sample-cert-card">
              <div className="cert-frame">
                {certData?.status === 'revoked' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-25deg)',
                      border: '6px solid #ff4757',
                      color: '#ff4757',
                      fontSize: '3.2rem',
                      fontWeight: '900',
                      letterSpacing: '8px',
                      textTransform: 'uppercase',
                      padding: '12px 36px',
                      borderRadius: '12px',
                      opacity: 0.9,
                      pointerEvents: 'none',
                      zIndex: 10,
                      backgroundColor: 'rgba(20, 25, 40, 0.85)',
                      boxShadow: '0 0 35px rgba(255, 71, 87, 0.5)',
                      backdropFilter: 'blur(3px)',
                    }}
                  >
                    REVOKED
                  </div>
                )}
                <div className="cert-inner-border">
                  <div className="cert-top-header">
                    <div className="cert-seal"><i className="fa-solid fa-award"></i></div>
                    <div className="cert-org">NETCRADUS ACADEMIA OF TECHNOLOGY</div>
                    <div className="cert-subtitle">CERTIFICATE OF EXCELLENCE</div>
                  </div>
                  <div className="cert-body-text">
                    <p>This is to certify that</p>
                    <h2 className="cert-holder-name">
                      {certData ? certData.studentName : 'Student Name'}
                    </h2>
                    <p>has successfully completed the Accredited Professional Program in</p>
                    <h3 className="cert-course-name">
                      {certData ? certData.courseName : 'Professional Program Track'}
                    </h3>
                    <p>and demonstrated high practical proficiency in laboratory assessments and curriculum benchmarks.</p>
                  </div>
                  <div className="cert-footer-row">
                    <div className="cert-sig">
                      <div className="sig-line">Dr. Vikram Singh</div>
                      <span>Chief Technical Officer</span>
                    </div>
                    <div className="cert-qr">
                      <i className="fa-solid fa-qrcode"></i>
                      <span>
                        {certData ? certData.certificateId : 'Scan / Verify ID'}
                      </span>
                    </div>
                    <div className="cert-sig">
                      <div className="sig-line">Academic Council</div>
                      <span>Netcradus Director</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cert-action-bar">
                <button
                  type="button"
                  className="btn btn-sm btn-cyan"
                  onClick={handlePrint}
                  disabled={certData?.status === 'revoked'}
                  title={certData?.status === 'revoked' ? 'Revoked credentials cannot be exported or printed' : 'Print / Save as PDF'}
                >
                  <i className="fa-solid fa-print"></i> {certData?.status === 'revoked' ? 'Credential Revoked (Void)' : 'Print / Save as PDF'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleCopyLink}
                  disabled={!certData}
                >
                  <i className="fa-solid fa-link"></i> Copy Verification Link
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

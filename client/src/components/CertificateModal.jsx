import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Printer, X, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';

export const CertificateModal = ({ isOpen, onClose, certificate }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = certificate.issueDate
    ? new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content glass-panel-heavy"
        style={{
          width: '100%',
          maxWidth: '840px',
          padding: '2.5rem',
          backgroundColor: '#0c0d1f',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={24} color="#fbbf24" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Official Course Completion Certificate</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn-icon" aria-label="Close">
              <X size={20} color="#fff" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Box */}
        <div className="certificate-card" id="printable-certificate">
          {/* Decorative Corner Accents */}
          <div className="cert-border-corner cert-tl" />
          <div className="cert-border-corner cert-tr" />
          <div className="cert-border-corner cert-bl" />
          <div className="cert-border-corner cert-br" />

          {/* Certificate Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#facc15',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={14} /> Verified Credential
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '2rem',
                fontWeight: '800',
                letterSpacing: '0.05em',
                color: '#f8fafc',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              Certificate of Completion
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
              THIS IS PROUDLY PRESENTED TO
            </p>
          </div>

          {/* Student Name */}
          <div style={{ margin: '1.5rem 0' }}>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '2.4rem',
                fontWeight: '700',
                color: '#d4af37',
                borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
                display: 'inline-block',
                paddingBottom: '0.4rem',
                minWidth: '280px',
              }}
            >
              {certificate.studentName || 'Student Name'}
            </h1>
          </div>

          {/* Course Details */}
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '580px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            for successfully demonstrating mastery and completing all lectures, practical assignments, and assessments for
          </p>

          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#38bdf8',
              marginBottom: '2rem',
            }}
          >
            {certificate.courseTitle || 'Mastering Modern Full-Stack Web Development'}
          </h3>

          {/* Bottom Signatures & QR / ID */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: '3rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Date */}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f1f5f9' }}>{formattedDate}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date Issued
              </p>
            </div>

            {/* Credential ID */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to={`/verify/${certificate.certificateId || 'CERT-SKILLFORGE-2026'}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ID: {certificate.certificateId || 'CERT-SKILLFORGE-2026'}
                <ExternalLink size={12} />
              </Link>
              <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                Verify online at /verify
              </p>
            </div>

            {/* Instructor Signature */}
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontFamily: 'cursive',
                  fontSize: '1.2rem',
                  color: '#d4af37',
                  marginBottom: '2px',
                }}
              >
                {certificate.instructorName || 'UAV X'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lead Instructor Signature
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-certificate, #printable-certificate * {
              visibility: visible;
            }
            #printable-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: 4px double #000;
              color: #000;
              background: #fff !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

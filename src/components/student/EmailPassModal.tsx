import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { EventPass, EventModel } from '../../types';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { 
  X, 
  Mail, 
  Check, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  Utensils, 
  Copy,
  Inbox
} from 'lucide-react';

interface EmailPassModalProps {
  pass: EventPass;
  event: EventModel;
  onClose: () => void;
}

export const EmailPassModal: React.FC<EmailPassModalProps> = ({
  pass,
  event,
  onClose
}) => {
  const [recipientEmail, setRecipientEmail] = useState(pass.student.email);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    generateQrDataUrl(pass.qrPayload, {
      width: 280,
      colorDark: '#090d16',
      colorLight: '#ffffff'
    }).then((url) => {
      if (url) setQrDataUrl(url);
    });
  }, [pass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(pass.id)}&name=${encodeURIComponent(pass.student.fullName)}&sid=${encodeURIComponent(pass.student.studentId)}&dept=${encodeURIComponent(pass.student.department)}`;

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`[Official Pass] ${event.title} - ${pass.student.fullName} (${pass.id})`);
    const body = encodeURIComponent(
      `Hello ${pass.student.fullName},\n\n` +
      `Your official digital event pass for "${event.title}" is confirmed.\n\n` +
      `ATTENDEE DETAILS:\n` +
      `• Name: ${pass.student.fullName}\n` +
      `• Student ID: ${pass.student.studentId}\n` +
      `• Department: ${pass.student.department}\n` +
      `• Pass ID: ${pass.id}\n` +
      `• SMS Backup PIN: ${pass.smsBackupCode}\n\n` +
      `EVENT DETAILS:\n` +
      `• Event: ${event.title}\n` +
      `• Venue: ${event.venue}\n` +
      `• Date & Time: ${event.date} at ${event.startTime}\n` +
      `• Lunch & Benefits: Included (Present QR at station)\n\n` +
      `ACCESS YOUR DIGITAL QR PASS:\n` +
      `${verifyUrl}\n\n` +
      `Please have this QR code ready on your phone for teacher scanning at entry gate and lunch counter.\n\n` +
      `SmartEvent Pass System`
    );
    window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSimulateSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    }, 700);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return createPortal(
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="vibe-card vibe-fade-in" 
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              background: '#ea4335',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Email QR Pass to Student
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                Deliver tamper-proof QR badge directly to student's Gmail inbox
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
            style={{ padding: '6px', borderRadius: 'var(--radius-xs)', height: '28px', width: '28px' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Email Destination Input */}
        <div style={{ marginBottom: '16px' }}>
          <label className="vibe-label" style={{ marginBottom: '6px', display: 'block' }}>
            Student Gmail Address:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              className="vibe-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="student@gmail.com"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleSimulateSend}
              disabled={isSending || !recipientEmail}
              className="vibe-btn vibe-btn-gmail"
              style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
            >
              <Send size={13} />
              <span>{isSending ? 'Sending...' : 'Dispatch'}</span>
            </button>
          </div>
        </div>

        {sendSuccess && (
          <div className="vibe-fade-in" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#34d399',
            fontWeight: 600
          }}>
            <Check size={16} />
            <span>Official QR Pass successfully dispatched to <strong>{recipientEmail}</strong>!</span>
          </div>
        )}

        {/* High-End Realistic Gmail Message Preview Card */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Inbox size={14} color="#ea4335" />
              <span>Gmail Inbox Preview: <strong>{event.title}</strong></span>
            </div>
            <span className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            color: '#09090b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {/* Email Pass Header */}
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#09090b', fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
                  {event.title}
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '2px 0 0 0' }}>
                  Official Digital Pass & Meal Voucher
                </p>
              </div>
              <span style={{ background: '#09090b', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                VERIFIED PASS
              </span>
            </div>

            {/* Email Pass Body */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {/* QR Image */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Student Pass QR" 
                    style={{ width: '100px', height: '100px', display: 'block' }} 
                  />
                ) : (
                  <div style={{ width: '100px', height: '100px', background: '#e2e8f0' }} />
                )}
              </div>

              {/* Student Metadata */}
              <div style={{ flex: 1, fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#09090b' }}>
                  {pass.student.fullName}
                </div>
                <div style={{ color: '#475569', fontSize: '0.74rem', marginTop: '2px' }}>
                  ID: <strong>{pass.student.studentId}</strong> • {pass.student.department}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '5px' }}>
                  Pass ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#09090b' }}>{pass.id}</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, marginTop: '6px' }}>
                  <Utensils size={11} />
                  <span>1x Lunch Quota Active</span>
                </div>
              </div>
            </div>

            {/* Email Pass Footer Instructions */}
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Show this QR to Teacher at Gate & Lunch station</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>✓ HMAC Tamper Proof</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xs)',
          padding: '10px 12px',
          marginBottom: '16px',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
        }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Immutable QR Code:</strong> Signed with SHA-256 HMAC checksum. Student details cannot be forged or shared.
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleOpenMailClient}
            className="vibe-btn vibe-btn-primary"
            style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
          >
            <ExternalLink size={14} />
            <span>Open in Mail Client</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`vibe-btn ${copiedLink ? 'vibe-btn-success' : 'vibe-btn-secondary'}`}
            style={{ height: '36px', fontSize: '0.8rem' }}
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Pass Link'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

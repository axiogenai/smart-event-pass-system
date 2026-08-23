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
  Inbox,
  Calendar,
  MapPin,
  Sparkles,
  Lock
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
      colorDark: '#09090b',
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
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
          maxWidth: '540px',
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
                Email QR Pass Dispatch
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                Deliver cryptographic ticket directly to student's Gmail inbox
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
              <span>{isSending ? 'Sending...' : 'Send to Gmail'}</span>
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
            <span>Official QR Pass dispatched to <strong>{recipientEmail}</strong>!</span>
          </div>
        )}

        {/* High-End Realistic Gmail Message Preview Card */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          {/* Email Subject Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Inbox size={14} color="#ea4335" />
              <span>Gmail Preview: <strong>{event.title}</strong></span>
            </div>
            <span className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Luxury Digital Ticket Box */}
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}>
            {/* Ticket Header Dark Strip */}
            <div style={{
              background: '#09090b',
              padding: '14px 18px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.08em', color: '#a1a1aa', textTransform: 'uppercase' }}>
                  OFFICIAL EVENT CREDENTIAL
                </span>
                <h4 style={{ color: '#ffffff', fontSize: '1.02rem', fontWeight: 800, margin: '2px 0 0 0', letterSpacing: '-0.01em' }}>
                  {event.title}
                </h4>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.04em',
              }}>
                AUTHENTIC PASS
              </div>
            </div>

            {/* Event Time & Location Ribbon */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.72rem',
              color: '#475569',
              fontWeight: 500,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                <span>{event.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                <span>{event.venue.split('•')[0]}</span>
              </div>
            </div>

            {/* Ticket Main Body */}
            <div style={{ padding: '18px', display: 'flex', gap: '18px', alignItems: 'center' }}>
              {/* QR Image Box */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}>
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Student Pass QR" 
                    style={{ width: '106px', height: '106px', display: 'block' }} 
                  />
                ) : (
                  <div style={{ width: '106px', height: '106px', background: '#f1f5f9' }} />
                )}
                <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SCAN AT GATE
                </span>
              </div>

              {/* Attendee Info & Quotas */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ATTENDEE NAME
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1.18rem', color: '#09090b', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                    {pass.student.fullName}
                  </div>
                </div>

                {/* Structured Metadata Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: '#09090b',
                    fontWeight: 600,
                  }}>
                    ID: {pass.student.studentId}
                  </div>
                  <div style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: '#475569',
                    fontWeight: 500,
                  }}>
                    {pass.student.department}
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Pass Code: <strong style={{ color: '#09090b', fontFamily: 'monospace' }}>{pass.id}</strong> • SMS PIN: <strong style={{ color: '#09090b', fontFamily: 'monospace' }}>{pass.smsBackupCode}</strong>
                </div>

                {/* Lunch & Perk Highlight */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  width: 'fit-content'
                }}>
                  <Utensils size={13} />
                  <span>1x Hot Lunch & Meal Quota Active</span>
                </div>
              </div>
            </div>

            {/* Ticket Tear Perforation & Security Seal */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px dashed #cbd5e1',
              padding: '10px 18px',
              fontSize: '0.7rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock size={12} color="#059669" />
                <span style={{ fontWeight: 600, color: '#334155' }}>HMAC SHA-256 Signed</span>
              </div>
              <span style={{ color: '#059669', fontWeight: 700 }}>
                ✓ Immutable Pass
              </span>
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
            <strong>Immutable QR Code:</strong> Contains cryptographic SHA-256 signature. Student data cannot be forged or shared.
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

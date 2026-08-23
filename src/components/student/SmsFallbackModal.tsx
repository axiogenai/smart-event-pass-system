import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { EventPass, EventModel } from '../../types';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface SmsFallbackModalProps {
  pass: EventPass;
  event: EventModel;
  onClose: () => void;
}

export const SmsFallbackModal: React.FC<SmsFallbackModalProps> = ({
  pass,
  event,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const smsText = `[SMARTPASS] Entry PIN for "${event.title}" is ${pass.smsBackupCode}. Pass ID: ${pass.id}. Present to staff at gate for instant verification.`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pass.smsBackupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendSms = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3500);
    }, 600);
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
        background: 'rgba(0, 0, 0, 0.85)',
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
          maxWidth: '430px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-xs)',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageSquare size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                SMS Backup Verification
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Offline Cell Network Gateway
              </span>
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

        {/* 6-Digit PIN Box */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '18px 16px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            6-DIGIT GATE PIN CODE
          </span>
          <div className="mono" style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.18em',
            margin: '6px 0',
          }}>
            {pass.smsBackupCode}
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
            Show this PIN to checkpoint staff for manual verification if scanner is offline.
          </p>
        </div>

        {/* Carrier Gateway Info */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Smartphone size={13} />
              <span>To: <strong style={{ color: '#fff' }}>{pass.student.phone}</strong></span>
            </div>
            <span className="vibe-badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              Gateway Active
            </span>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
          }}>
            {smsText}
          </div>
        </div>

        {/* Status Notification */}
        {resendSuccess && (
          <div className="vibe-fade-in" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-xs)',
            padding: '8px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.76rem',
            color: '#34d399',
            fontWeight: 600
          }}>
            <Check size={14} />
            <span>SMS message dispatched to {pass.student.phone}</span>
          </div>
        )}

        {/* Action Controls with Clear Distinctive Visual Hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`vibe-btn ${copied ? 'vibe-btn-success' : 'vibe-btn-primary'}`}
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'PIN Copied!' : 'Copy Gate PIN'}</span>
            </button>

            <button
              type="button"
              onClick={handleResendSms}
              disabled={isResending}
              className="vibe-btn vibe-btn-secondary"
              style={{ height: '38px', fontSize: '0.825rem' }}
            >
              <Send size={14} />
              <span>{isResending ? 'Sending...' : 'Resend SMS'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="vibe-btn vibe-btn-secondary"
            style={{ width: '100%', height: '34px', fontSize: '0.78rem', opacity: 0.85 }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

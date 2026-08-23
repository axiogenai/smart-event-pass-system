import React from 'react';
import { createPortal } from 'react-dom';
import type { EventPass, EventModel } from '../../types';
import { useEventContext } from '../../context/EventContext';
import { 
  CheckCircle2, 
  ShieldCheck, 
  X,
  IdCard,
  Utensils,
  Sparkles
} from 'lucide-react';

interface StudentDetailsModalProps {
  pass: EventPass;
  event?: EventModel;
  onClose: () => void;
  onGrantEntry?: () => void;
  onRedeemToken?: (tokenId: string) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  pass,
  event,
  onClose,
  onGrantEntry,
  onRedeemToken
}) => {
  const { currentEvent, verifyTokenRedemption, verifyEntryScan } = useEventContext();
  const activeEvent = event || currentEvent;

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleQuickEntry = () => {
    if (onGrantEntry) {
      onGrantEntry();
    } else {
      verifyEntryScan(pass.id);
    }
  };

  const handleQuickRedeem = (tokenId: string) => {
    if (onRedeemToken) {
      onRedeemToken(tokenId);
    } else {
      verifyTokenRedemption(pass.id, tokenId);
    }
  };

  const isEntered = pass.entryCount > 0;
  const isBlacklisted = pass.isBlacklisted;
  const isRevoked = pass.status === 'Revoked';

  return createPortal(
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
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
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IdCard size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                Attendee Pass Record
              </h3>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {pass.id}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
            style={{ padding: '6px', borderRadius: 'var(--radius-xs)', height: '28px', width: '28px' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Profile Info */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {pass.student.fullName}
            </h4>
            {isBlacklisted ? (
              <span className="vibe-badge badge-rose">Blacklisted</span>
            ) : isRevoked ? (
              <span className="vibe-badge badge-rose">Revoked</span>
            ) : isEntered ? (
              <span className="vibe-badge badge-indigo">Checked-In</span>
            ) : (
              <span className="vibe-badge badge-emerald">Active Pass</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pass.student.studentId}</span> • {pass.student.department}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '0.75rem',
        }}>
          <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>EMAIL</span>
            <div style={{ color: '#fff', fontWeight: 500, wordBreak: 'break-all' }}>{pass.student.email}</div>
          </div>

          <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>PHONE</span>
            <div style={{ color: '#fff', fontWeight: 500 }}>{pass.student.phone}</div>
          </div>

          <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>SMS PIN</span>
            <div className="mono" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>{pass.smsBackupCode}</div>
          </div>

          <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>GATE ENTRIES</span>
            <div style={{ color: isEntered ? 'var(--accent-emerald)' : 'var(--text-secondary)', fontWeight: 600 }}>
              {pass.entryCount} Recorded
            </div>
          </div>
        </div>

        {/* Cryptographic Signature */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          padding: '10px',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
              HMAC Signature Verified
            </span>
          </div>
          <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
            {pass.qrSignature}
          </div>
        </div>

        {/* Benefit Tokens */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            Benefit Quotas & Vouchers
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pass.tokens.map((t) => {
              const isUsed = t.redeemedCount >= t.maxAllocated;
              return (
                <div
                  key={t.tokenId}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.type === 'food' ? <Utensils size={14} color="var(--accent-amber)" /> : <Sparkles size={14} color="#ffffff" />}
                    <span style={{ fontSize: '0.8rem', color: isUsed ? 'var(--text-disabled)' : '#fff', textDecoration: isUsed ? 'line-through' : 'none' }}>
                      {t.tokenName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`vibe-badge ${isUsed ? 'badge-rose' : 'badge-emerald'}`}>
                      {t.redeemedCount}/{t.maxAllocated}
                    </span>

                    {!isUsed && (
                      <button
                        type="button"
                        onClick={() => handleQuickRedeem(t.tokenId)}
                        className="vibe-btn vibe-btn-primary vibe-btn-sm"
                        style={{ padding: '3px 10px', fontSize: '0.72rem', height: '24px' }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleQuickEntry}
            className="vibe-btn vibe-btn-success"
            style={{ flex: 1, padding: '9px 14px' }}
          >
            <CheckCircle2 size={15} />
            <span>{isEntered ? 'Log Additional Entry' : 'Verify & Grant Entry'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="vibe-btn vibe-btn-secondary"
            style={{ padding: '9px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

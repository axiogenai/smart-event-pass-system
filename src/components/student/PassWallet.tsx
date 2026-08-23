import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { DigitalPassCard } from './DigitalPassCard';
import { downloadPassPdf } from '../../utils/exportPdf';
import { MobileWalletModal } from './MobileWalletModal';
import { SmsFallbackModal } from './SmsFallbackModal';
import { EmailPassModal } from './EmailPassModal';
import { CustomDropdown } from '../common/CustomDropdown';
import { 
  Download, 
  Share2, 
  CreditCard, 
  Check, 
  MessageSquare, 
  Smartphone,
  Mail,
  ShieldCheck,
  Utensils,
  Sparkles,
  User,
  Copy,
  Gift,
  Award
} from 'lucide-react';

interface PassWalletProps {
  onRegisterClick?: () => void;
}

export const PassWallet: React.FC<PassWalletProps> = ({ onRegisterClick }) => {
  const { passes, currentPass, setCurrentPass, currentEvent } = useEventContext();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!currentEvent) {
    return <div className="vibe-card">No active event selected.</div>;
  }

  const activeEventPasses = passes.filter(p => p.eventId === currentEvent.id);
  const activePass = currentPass && currentPass.eventId === currentEvent.id ? currentPass : activeEventPasses[0];

  const handleDownloadPdf = async () => {
    if (!activePass) return;
    setIsDownloadingPdf(true);
    try {
      await downloadPassPdf(activePass, currentEvent);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShareLink = () => {
    const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(activePass?.id || '')}&name=${encodeURIComponent(activePass?.student.fullName || '')}&sid=${encodeURIComponent(activePass?.student.studentId || '')}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const attendeeOptions = activeEventPasses.map(p => ({
    value: p.id,
    label: p.student.fullName,
    sublabel: `${p.student.studentId} • ${p.id}`,
    badge: p.status,
    icon: <User size={13} />
  }));

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'food':
      case 'MEAL': return <Utensils size={14} />;
      case 'merchandise':
      case 'SWAG': return <Gift size={14} />;
      case 'certificate': return <Award size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Banner Toolbar */}
      <div className="vibe-card" style={{
        padding: '14px 18px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            color: '#ffffff',
            display: 'flex',
          }}>
            <Smartphone size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              Digital Event Pass & Benefit Wallet
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Official QR credential for checkpoint entry & voucher redemptions
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeEventPasses.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Attendee:</span>
              <CustomDropdown
                options={attendeeOptions}
                value={activePass?.id || ''}
                onChange={(newPassId) => {
                  const found = passes.find(p => p.id === newPassId);
                  if (found) setCurrentPass(found);
                }}
                width={220}
                searchable={true}
              />
            </div>
          )}

          {onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="vibe-btn vibe-btn-secondary vibe-btn-sm"
              style={{ height: '34px' }}
            >
              + Register Another
            </button>
          )}
        </div>
      </div>

      {activePass ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 360px) 1fr',
          gap: '18px',
          alignItems: 'start',
        }}>
          {/* Left Column: Digital Pass Card */}
          <div>
            <DigitalPassCard pass={activePass} event={currentEvent} />
          </div>

          {/* Right Column: Multi-Channel Delivery & Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 1. Pass Delivery & Multi-Channel Dispatch */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--accent-emerald)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Pass Delivery & Offline Access
                  </h3>
                </div>
                <span className="vibe-badge badge-emerald">
                  Tamper-Proof
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Send credential to Gmail inbox, export print-ready PDF badge, or use offline SMS PIN.
              </p>

              {/* 4 Action Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {/* 1: Send to Gmail */}
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="vibe-card-raised"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                    background: 'var(--bg-surface-raised)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea4335', fontWeight: 600, fontSize: '0.8rem' }}>
                    <Mail size={14} />
                    <span>Send to Gmail</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    Dispatch QR to inbox
                  </span>
                </button>

                {/* 2: Download PDF Badge */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="vibe-card-raised"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                    background: 'var(--bg-surface-raised)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                    <Download size={14} />
                    <span>{isDownloadingPdf ? 'Exporting...' : 'PDF Badge'}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    Print-ready vector pass
                  </span>
                </button>

                {/* 3: SMS Backup PIN */}
                <button
                  type="button"
                  onClick={() => setShowSmsModal(true)}
                  className="vibe-card-raised"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                    background: 'var(--bg-surface-raised)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600, fontSize: '0.8rem' }}>
                    <MessageSquare size={14} />
                    <span>SMS Gate PIN</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    Offline cellular fallback
                  </span>
                </button>

                {/* 4: Apple / Google Wallet */}
                <button
                  type="button"
                  onClick={() => setShowWalletModal(true)}
                  className="vibe-card-raised"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                    background: 'var(--bg-surface-raised)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                    <CreditCard size={14} />
                    <span>Mobile Wallet</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    Apple & Google PKPass
                  </span>
                </button>
              </div>

              {/* Share URL Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 12px',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden' }}>
                  <Share2 size={13} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {window.location.origin}?verify={activePass.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className={`vibe-btn ${copiedLink ? 'vibe-btn-success' : 'vibe-btn-secondary'} vibe-btn-sm`}
                  style={{ height: '28px', flexShrink: 0 }}
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* 2. Benefit Vouchers & Quotas */}
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Event Quotas & Benefits
                </h3>
                <span className="vibe-badge badge-neutral">
                  {activePass.tokens.length} Allocated
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activePass.tokens.map((tok) => {
                  const isRedeemed = tok.redeemedCount >= tok.maxAllocated;
                  return (
                    <div
                      key={tok.tokenId}
                      className="vibe-card-raised"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: 'var(--radius-xs)',
                          background: isRedeemed ? 'var(--bg-surface)' : 'rgba(16, 185, 129, 0.12)',
                          color: isRedeemed ? 'var(--text-disabled)' : 'var(--accent-emerald)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {getTokenIcon(tok.type)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: isRedeemed ? 'var(--text-secondary)' : '#fff', fontSize: '0.82rem', textDecoration: isRedeemed ? 'line-through' : 'none' }}>
                            {tok.tokenName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                            Station: {tok.redeemedCounter || 'Checkpoint Counter'}
                          </div>
                        </div>
                      </div>

                      <span className={`vibe-badge ${isRedeemed ? 'badge-rose' : 'badge-emerald'}`}>
                        {isRedeemed ? 'Redeemed' : 'Claimable'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="vibe-card" style={{ textAlign: 'center', padding: '36px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
            No passes registered for this event yet.
          </p>
          {onRegisterClick && (
            <button type="button" onClick={onRegisterClick} className="vibe-btn vibe-btn-primary">
              Register First Attendee
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showWalletModal && activePass && (
        <MobileWalletModal
          pass={activePass}
          event={currentEvent}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {showSmsModal && activePass && (
        <SmsFallbackModal
          pass={activePass}
          event={currentEvent}
          onClose={() => setShowSmsModal(false)}
        />
      )}

      {showEmailModal && activePass && (
        <EmailPassModal
          pass={activePass}
          event={currentEvent}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

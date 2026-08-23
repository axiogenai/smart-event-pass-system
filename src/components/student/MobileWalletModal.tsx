import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { EventPass, EventModel } from '../../types';
import { 
  X, 
  Download, 
  Check, 
  Smartphone, 
  CreditCard, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';

interface MobileWalletModalProps {
  pass: EventPass;
  event: EventModel;
  onClose: () => void;
}

export const MobileWalletModal: React.FC<MobileWalletModalProps> = ({
  pass,
  event,
  onClose
}) => {
  const [walletType, setWalletType] = useState<'apple' | 'google'>('apple');
  const [downloaded, setDownloaded] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  const handleDownloadWalletPass = () => {
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.org.smartevent.credential",
      serialNumber: pass.id,
      teamIdentifier: "SMARTPASS-ORG",
      organizationName: "SmartEvent Pass",
      description: `${event.title} Official Event Pass`,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(18, 18, 21)",
      labelColor: "rgb(161, 161, 170)",
      eventTicket: {
        primaryFields: [
          {
            key: "event",
            label: "EVENT",
            value: event.title
          }
        ],
        secondaryFields: [
          {
            key: "attendee",
            label: "ATTENDEE",
            value: pass.student.fullName
          },
          {
            key: "studentId",
            label: "STUDENT ID",
            value: pass.student.studentId
          }
        ],
        auxiliaryFields: [
          {
            key: "venue",
            label: "VENUE",
            value: event.venue
          },
          {
            key: "date",
            label: "DATE",
            value: `${event.date} ${event.startTime}`
          },
          {
            key: "smsCode",
            label: "SMS PIN",
            value: pass.smsBackupCode
          }
        ]
      },
      barcode: {
        message: pass.qrPayload,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      },
      authenticationToken: pass.qrSignature
    };

    const blob = new Blob([JSON.stringify(passData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${walletType === 'apple' ? 'apple-wallet' : 'google-wallet'}-${pass.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const triggerNfcSimulation = () => {
    setIsNfcActive(true);
    setTimeout(() => setIsNfcActive(false), 2500);
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
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-medium)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CreditCard size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                Mobile Wallet Pass
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Apple Wallet & Google Pay Pass
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

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          padding: '3px',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => setWalletType('apple')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: walletType === 'apple' ? 'var(--bg-surface)' : 'transparent',
              color: walletType === 'apple' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.12s ease',
            }}
          >
            <span>Apple Wallet</span>
          </button>
          <button
            onClick={() => setWalletType('google')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: walletType === 'google' ? 'var(--bg-surface)' : 'transparent',
              color: walletType === 'google' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.12s ease',
            }}
          >
            <span>Google Wallet</span>
          </button>
        </div>

        {/* Realistic Mobile Pass Preview Card */}
        <div style={{
          background: '#0a0a0c',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                EVENT TICKET
              </span>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                {event.title}
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {walletType === 'apple' ? ' Pass' : 'Google Pay'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>ATTENDEE</span>
              <div style={{ color: '#fff', fontWeight: 600 }}>{pass.student.fullName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>STUDENT ID</span>
              <div className="mono" style={{ color: '#fff', fontWeight: 600 }}>{pass.student.studentId}</div>
            </div>
          </div>

          {/* NFC Turnstile Tap Simulator Box */}
          <div style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Radio size={20} color={isNfcActive ? '#10b981' : 'var(--text-secondary)'} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isNfcActive ? '#34d399' : '#fff' }}>
              {isNfcActive ? '✓ NFC Turnstile Validated!' : 'Hold Near Gate Reader'}
            </div>
            <button
              onClick={triggerNfcSimulation}
              disabled={isNfcActive}
              className="vibe-btn vibe-btn-secondary vibe-btn-sm"
              style={{ fontSize: '0.7rem', height: '26px', marginTop: '2px' }}
            >
              {isNfcActive ? 'Simulating...' : 'Simulate NFC Tap'}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleDownloadWalletPass}
            className="vibe-btn vibe-btn-primary"
            style={{ width: '100%', height: '36px', fontSize: '0.8rem' }}
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{downloaded ? 'Pass File Downloaded!' : `Add to ${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'}`}</span>
          </button>

          <button
            onClick={onClose}
            className="vibe-btn vibe-btn-secondary"
            style={{ width: '100%', height: '34px', fontSize: '0.8rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

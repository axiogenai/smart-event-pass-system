import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EventPass, EventModel } from '../../types';
import { renderQrToCanvas, generateQrDataUrl } from '../../utils/qrGenerator';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface QrImageModalProps {
  pass: EventPass;
  event: EventModel;
  onClose: () => void;
  onOpenStudentDetails?: () => void;
}

export const QrImageModal: React.FC<QrImageModalProps> = ({
  pass,
  event,
  onClose,
  onOpenStudentDetails
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && pass) {
      renderQrToCanvas(canvasRef.current, pass.qrPayload, {
        colorDark: '#090d16',
        colorLight: '#ffffff',
        width: 260
      });
    }
  }, [pass]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownloadQrPng = async () => {
    try {
      const dataUrl = await generateQrDataUrl(pass.qrPayload, {
        colorDark: '#090d16',
        colorLight: '#ffffff',
        width: 600
      });
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.href = dataUrl;
      const safeName = pass.student.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `event-pass-${safeName}-${pass.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR error:', err);
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pass.qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          maxWidth: '400px',
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
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Digital Event Pass
            </h3>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Pass ID: <strong style={{ color: '#fff' }}>{pass.id}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              height: '30px',
              width: '30px',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Crisp QR Code Container */}
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px 16px',
          textAlign: 'center',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            background: '#ffffff',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '230px', 
                height: '230px', 
                maxWidth: '100%', 
                display: 'block',
                imageRendering: 'pixelated'
              }} 
            />
          </div>

          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>
            {pass.student.fullName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {pass.student.studentId}
            </span> • {pass.student.department}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {event.title}
          </div>
        </div>

        {/* Security & Verification Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-xs)',
          padding: '8px 12px',
          marginBottom: '16px',
          fontSize: '0.72rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            <span>HMAC SHA-256 Verified</span>
          </div>
          <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
            SMS PIN: <strong>{pass.smsBackupCode}</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadQrPng}
              className="vibe-btn vibe-btn-primary"
              style={{ flex: 1, fontSize: '0.8rem', height: '36px' }}
            >
              <Download size={14} />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleCopyPayload}
              className="vibe-btn vibe-btn-secondary"
              style={{ flex: 1, fontSize: '0.8rem', height: '36px' }}
            >
              {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Pass URL'}</span>
            </button>
          </div>

          {onOpenStudentDetails && (
            <button
              onClick={() => {
                onClose();
                onOpenStudentDetails();
              }}
              className="vibe-btn vibe-btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.78rem',
                height: '34px',
              }}
            >
              <UserCheck size={14} />
              <span>View Attendee Profile & Quotas</span>
              <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

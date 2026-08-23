import React, { useState, useEffect, useRef } from 'react';
import type { EventPass, EventModel } from '../../types';
import { renderQrToCanvas } from '../../utils/qrGenerator';
import { StudentDetailsModal } from '../common/StudentDetailsModal';
import { QrImageModal } from '../common/QrImageModal';
import { 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Gift, 
  Award, 
  Sparkles,
  AlertOctagon,
  Scan,
  MapPin,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface DigitalPassCardProps {
  pass: EventPass;
  event: EventModel;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({ pass, event }) => {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && pass) {
      renderQrToCanvas(canvasRef.current, pass.qrPayload, {
        colorDark: '#09090b',
        colorLight: '#ffffff',
        width: 110
      });
    }
  }, [pass]);

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'food':
      case 'MEAL': return <Utensils size={11} />;
      case 'merchandise':
      case 'SWAG': return <Gift size={11} />;
      case 'certificate': return <Award size={11} />;
      default: return <Sparkles size={11} />;
    }
  };

  const getStatusBadge = () => {
    if (pass.isBlacklisted) {
      return <span className="vibe-badge badge-rose"><AlertOctagon size={11} /> Blacklisted</span>;
    }
    switch (pass.status) {
      case 'Active':
        return <span className="vibe-badge badge-emerald"><CheckCircle2 size={11} /> Valid Pass</span>;
      case 'Used':
        return <span className="vibe-badge badge-neutral"><CheckCircle2 size={11} /> Checked In</span>;
      case 'Revoked':
        return <span className="vibe-badge badge-rose"><AlertOctagon size={11} /> Revoked</span>;
      case 'Expired':
        return <span className="vibe-badge badge-amber"><Clock size={11} /> Expired</span>;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
      }}>
        {/* Top Accent Strip */}
        <div style={{ height: '3px', width: '100%', background: '#ffffff' }} />

        {/* Card Content with Generous Breathing Gaps */}
        <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              OFFICIAL EVENT CREDENTIAL
            </span>
            {getStatusBadge()}
          </div>

          {/* Event Details */}
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25, margin: 0 }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '5px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                <span>{event.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                <span>{event.venue.split('•')[0]}</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Centered QR Viewfinder */}
          <div
            onClick={() => setShowQrModal(true)}
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 12px 14px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            title="Click to enlarge QR code for scanning"
          >
            <div style={{
              background: '#ffffff',
              padding: '6px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '112px',
              height: '112px',
              overflow: 'hidden'
            }}>
              <canvas 
                ref={canvasRef} 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  maxWidth: '100%', 
                  display: 'block' 
                }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '8px' }}>
              <Scan size={12} />
              <span>Tap to Enlarge QR</span>
            </div>

            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.96rem', marginTop: '4px' }}>
              {pass.student.fullName}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              <span className="mono" style={{ color: '#ffffff', fontWeight: 600 }}>{pass.student.studentId}</span> • {pass.student.department}
            </div>
          </div>

          {/* Pass Metadata Grid with Generous Gaps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>PASS SERIAL</span>
              <div className="mono" style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.78rem', marginTop: '2px' }}>{pass.id}</div>
            </div>
            <div className="vibe-card-raised" style={{ padding: '8px 10px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>SMS GATE PIN</span>
              <div className="mono" style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.78rem', marginTop: '2px' }}>{pass.smsBackupCode}</div>
            </div>
          </div>

          {/* Benefits Quota Chips */}
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.04em', marginBottom: '6px' }}>
              ALLOCATED BENEFITS ({pass.tokens.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {pass.tokens.map((t) => {
                const isRedeemed = t.redeemedCount >= t.maxAllocated;
                return (
                  <div
                    key={t.tokenId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      background: isRedeemed ? 'var(--bg-surface)' : 'var(--bg-surface-raised)',
                      color: isRedeemed ? 'var(--text-disabled)' : 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: isRedeemed ? 'line-through' : 'none',
                    }}
                  >
                    {getTokenIcon(t.type)}
                    <span>{t.tokenName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '10px',
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={13} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--text-secondary)' }}>HMAC SHA-256 Verified</span>
            </div>
            <span
              onClick={() => setShowStudentModal(true)}
              style={{ color: '#ffffff', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Full Profile →
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStudentModal && (
        <StudentDetailsModal
          pass={pass}
          event={event}
          onClose={() => setShowStudentModal(false)}
        />
      )}

      {showQrModal && (
        <QrImageModal
          pass={pass}
          event={event}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

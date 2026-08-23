import React from 'react';
import { useEventContext } from '../../context/EventContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Check } from 'lucide-react';

export const SecurityAuditFeed: React.FC = () => {
  const { incidents, resolveIncident, currentEventId } = useEventContext();
  const eventIncidents = incidents.filter(i => i.eventId === currentEventId);

  return (
    <div className="vibe-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-xs)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldAlert size={15} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            Security Audit Stream
          </h3>
        </div>

        <span className="vibe-badge badge-rose">
          {eventIncidents.filter(i => !i.resolved).length} Alerts
        </span>
      </div>

      {eventIncidents.length === 0 ? (
        <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.825rem' }}>
          <CheckCircle size={24} color="#10b981" style={{ marginBottom: '6px' }} />
          <div>Clean Verification Stream • Zero Breaches</div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '340px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          {eventIncidents.map((inc) => (
            <div
              key={inc.id}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: '180px' }}>
                <AlertTriangle size={15} color="var(--accent-rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="vibe-badge badge-rose" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                      {inc.severity}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff' }}>
                      {inc.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {inc.details}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {inc.studentName} • {new Date(inc.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div>
                {!inc.resolved && (
                  <button
                    type="button"
                    onClick={() => resolveIncident(inc.id)}
                    className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                    style={{ fontSize: '0.72rem', height: '26px' }}
                  >
                    <Check size={11} /> Clear
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

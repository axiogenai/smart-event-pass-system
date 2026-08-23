import React from 'react';
import { useEventContext } from '../../context/EventContext';
import { Users, Smartphone } from 'lucide-react';

export const VolunteerMonitor: React.FC = () => {
  const { volunteers } = useEventContext();

  return (
    <div className="vibe-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-medium)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Smartphone size={15} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            Gate Staff Terminals
          </h3>
        </div>

        <span className="vibe-badge badge-emerald">
          {volunteers.filter(v => v.active).length} Online
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {volunteers.map((v) => (
          <div
            key={v.id}
            className="vibe-card-raised"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>{v.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{v.checkpointName}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#fff' }}>{v.scansCount} scans</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{(v.avgScanTimeMs / 1000).toFixed(1)}s avg speed</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

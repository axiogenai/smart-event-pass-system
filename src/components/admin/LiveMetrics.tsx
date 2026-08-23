import React from 'react';
import { useEventContext } from '../../context/EventContext';
import { 
  Users, 
  UserCheck, 
  Ticket, 
  ShieldAlert 
} from 'lucide-react';

export const LiveMetrics: React.FC = () => {
  const { currentEvent, passes, incidents } = useEventContext();

  if (!currentEvent) return null;

  const eventPasses = passes.filter(p => p.eventId === currentEvent.id);
  const totalRegistered = eventPasses.length;
  const attendedPasses = eventPasses.filter(p => p.entryCount > 0);
  const totalAttended = attendedPasses.length;
  const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : '0';

  let totalAllocatedTokens = 0;
  let totalRedeemedTokens = 0;
  eventPasses.forEach(p => {
    p.tokens.forEach(t => {
      totalAllocatedTokens += t.maxAllocated;
      totalRedeemedTokens += t.redeemedCount;
    });
  });
  const tokenRedemptionRate = totalAllocatedTokens > 0 
    ? ((totalRedeemedTokens / totalAllocatedTokens) * 100).toFixed(1) 
    : '0';

  const unresolvedIncidents = incidents.filter(i => !i.resolved).length;

  return (
    <div className="vibe-grid-auto" style={{ marginBottom: '20px' }}>
      {/* 1: Registrations */}
      <div className="vibe-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            REGISTRATIONS
          </span>
          <div style={{
            padding: '5px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}>
            <Users size={14} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '8px 0 4px' }}>
          {totalRegistered}
          <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
            {' '}/ {currentEvent.capacity}
          </span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          {((totalRegistered / currentEvent.capacity) * 100).toFixed(0)}% capacity allocated
        </div>
      </div>

      {/* 2: Live Entries */}
      <div className="vibe-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            ATTENDANCE CHECK-IN
          </span>
          <div style={{
            padding: '5px',
            borderRadius: 'var(--radius-xs)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--accent-emerald)',
            display: 'flex'
          }}>
            <UserCheck size={14} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#34d399', margin: '8px 0 4px' }}>
          {totalAttended}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#fff' }}>{attendanceRate}%</strong> gate verified
        </div>
      </div>

      {/* 3: Tokens */}
      <div className="vibe-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            BENEFITS CLAIMED
          </span>
          <div style={{
            padding: '5px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex'
          }}>
            <Ticket size={14} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: '8px 0 4px' }}>
          {totalRedeemedTokens}
          <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
            {' '}/ {totalAllocatedTokens}
          </span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          {tokenRedemptionRate}% vouchers fulfilled
        </div>
      </div>

      {/* 4: Security Alerts */}
      <div className="vibe-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            SECURITY AUDIT
          </span>
          <div style={{
            padding: '5px',
            borderRadius: 'var(--radius-xs)',
            background: unresolvedIncidents > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${unresolvedIncidents > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)'}`,
            color: unresolvedIncidents > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
            display: 'flex'
          }}>
            <ShieldAlert size={14} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: unresolvedIncidents > 0 ? '#f87171' : '#ffffff', margin: '8px 0 4px' }}>
          {incidents.length}
        </div>
        <div style={{ fontSize: '0.74rem', color: unresolvedIncidents > 0 ? '#f87171' : '#34d399' }}>
          {unresolvedIncidents > 0 ? `${unresolvedIncidents} flagged incidents` : '0 Breaches • Clean Audit'}
        </div>
      </div>
    </div>
  );
};

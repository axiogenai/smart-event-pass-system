import React from 'react';
import { useEventContext } from '../../context/EventContext';
import type { AppPersona } from '../../types';
import { CustomDropdown } from '../common/CustomDropdown';
import { 
  ShieldCheck, 
  UserCheck, 
  CalendarPlus, 
  Scan, 
  Ticket, 
  ShieldAlert, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    persona, 
    setPersona, 
    events, 
    currentEventId, 
    setCurrentEventId, 
    isOfflineMode, 
    setIsOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    incidents
  } = useEventContext();

  const unresolvedIncidents = incidents.filter(i => !i.resolved).length;

  const personas: { id: AppPersona; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'STUDENT_PORTAL', label: 'Attendee Pass', icon: <UserCheck size={14} /> },
    { id: 'ENTRY_SCANNER', label: 'Gate Scanner', icon: <Scan size={14} /> },
    { id: 'TOKEN_COUNTER', label: 'Token Station', icon: <Ticket size={14} /> },
    { id: 'ADMIN_COMMAND', label: 'Admin Control', icon: <ShieldAlert size={14} />, badge: unresolvedIncidents },
    { id: 'ORGANIZER_STUDIO', label: 'Event Manager', icon: <CalendarPlus size={14} /> },
    { id: 'ANALYTICS_REPORTS', label: 'Analytics & Audit', icon: <BarChart3 size={14} /> },
  ];

  const eventOptions = events.map(e => ({
    value: e.id,
    label: e.title,
    sublabel: `${e.date} • ${e.venue.split('•')[0]}`,
    badge: e.status,
    icon: <Calendar size={13} />
  }));

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8, 9, 11, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      width: '100%',
    }}>
      <div style={{
        width: '100%',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '58px',
        gap: '16px',
        boxSizing: 'border-box',
      }}>
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                SmartEvent Pass
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontSize: '0.625rem',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}>
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Segmented Pill Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '3px',
          gap: '2px',
          overflowX: 'auto',
          maxWidth: '100%',
        }}>
          {personas.map((p) => {
            const isActive = persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                  background: isActive ? 'var(--bg-surface-raised)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.12s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: isActive ? '#ffffff' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                  {p.icon}
                </span>
                <span>{p.label}</span>
                {typeof p.badge === 'number' && p.badge > 0 && (
                  <span style={{
                    background: 'var(--accent-rose)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    padding: '0 5px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    height: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <CustomDropdown
            options={eventOptions}
            value={currentEventId}
            onChange={(newId) => setCurrentEventId(newId)}
            width={200}
            searchable={true}
          />

          <button
            type="button"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`vibe-btn vibe-btn-sm ${isOfflineMode ? 'vibe-btn-danger' : 'vibe-btn-secondary'}`}
            style={{ height: '34px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Toggle network offline mode"
          >
            {isOfflineMode ? (
              <>
                <WifiOff size={13} />
                <span>Offline</span>
              </>
            ) : (
              <>
                <span className="status-dot status-dot-green" />
                <span style={{ fontSize: '0.74rem' }}>Live</span>
              </>
            )}
          </button>

          {isOfflineMode && offlineQueueCount > 0 && (
            <button
              type="button"
              onClick={syncOfflineQueue}
              className="vibe-btn vibe-btn-sm vibe-btn-primary"
              style={{ height: '34px' }}
            >
              <RefreshCw size={12} />
              <span>Sync {offlineQueueCount}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

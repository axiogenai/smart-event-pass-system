import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { ScanResult, EventPass, TokenConfig } from '../../types';
import { CustomDropdown } from '../common/CustomDropdown';
import { 
  Ticket, 
  Utensils, 
  Gift, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  PackageCheck,
  Clock,
  MapPin,
  Check,
  User,
  History,
  ShieldCheck
} from 'lucide-react';

export const TokenRedemption: React.FC = () => {
  const { 
    currentEvent, 
    passes, 
    verifyTokenRedemption, 
    selectedCounterTokenId, 
    setSelectedCounterTokenId 
  } = useEventContext();

  const [manualInput, setManualInput] = useState('');
  const [lastRedemptionResult, setLastRedemptionResult] = useState<{
    result: ScanResult;
    message: string;
    pass?: EventPass;
    reason?: string;
    timestamp: string;
  } | null>(null);

  if (!currentEvent || currentEvent.tokens.length === 0) {
    return <div className="vibe-card">No tokens configured for active event.</div>;
  }

  const selectedTokenConfig: TokenConfig = 
    currentEvent.tokens.find(t => t.id === selectedCounterTokenId) || currentEvent.tokens[0];

  let totalAllocatedForToken = 0;
  let totalRedeemedForToken = 0;

  const eventPasses = passes.filter(p => p.eventId === currentEvent.id);

  eventPasses.forEach(p => {
    const t = p.tokens.find(tok => tok.tokenId === selectedTokenConfig.id);
    if (t) {
      totalAllocatedForToken += t.maxAllocated;
      totalRedeemedForToken += t.redeemedCount;
    }
  });

  const remainingTokens = Math.max(0, totalAllocatedForToken - totalRedeemedForToken);

  const handleProcessScan = (rawText: string) => {
    if (!rawText.trim()) return;

    const res = verifyTokenRedemption(
      rawText,
      selectedTokenConfig.id,
      'VOL-STAFF-01',
      selectedTokenConfig.locationCounter
    );

    setLastRedemptionResult({
      result: res.result,
      message: res.message,
      pass: res.pass,
      reason: res.reason,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
      setManualInput('');
    }
  };

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'food': return <Utensils size={15} />;
      case 'merchandise': return <Gift size={15} />;
      case 'certificate': return <Award size={15} />;
      default: return <Sparkles size={15} />;
    }
  };

  const tokenOptions = currentEvent.tokens.map(t => ({
    value: t.id,
    label: t.name,
    sublabel: `Station: ${t.locationCounter}`,
    badge: `${t.maxRedemptions} max`,
    icon: getTokenIcon(t.type)
  }));

  // Find recently fulfilled passes for this station
  const fulfilledPasses = eventPasses.filter(p => {
    const tok = p.tokens.find(t => t.tokenId === selectedTokenConfig.id);
    return tok && tok.redeemedCount > 0;
  });

  return (
    <div style={{ width: '100%' }}>
      {/* Top Banner Header */}
      <div className="vibe-card" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
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
            <Ticket size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Token Fulfillment Terminal
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Dispense benefit tokens with single-redemption protection & audit logging
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CustomDropdown
            options={tokenOptions}
            value={selectedCounterTokenId || currentEvent.tokens[0].id}
            onChange={(val) => setSelectedCounterTokenId(val)}
            width={240}
          />

          <span className="vibe-badge badge-emerald">
            {remainingTokens} / {totalAllocatedForToken} Available
          </span>
        </div>
      </div>

      {/* Balanced 2-Column Terminal Layout */}
      <div className="vibe-split-layout">
        {/* Left Column: Station Controls & Manual Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Active Station Card */}
          <div className="vibe-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-medium)',
                color: '#ffffff',
                padding: '8px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
              }}>
                {getTokenIcon(selectedTokenConfig.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {selectedTokenConfig.name}
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {selectedTokenConfig.description}
                </span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <div className="vibe-card-raised">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '3px' }}>
                  <MapPin size={11} />
                  <span>LOCATION</span>
                </div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                  {selectedTokenConfig.locationCounter}
                </div>
              </div>

              <div className="vibe-card-raised">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '3px' }}>
                  <Clock size={11} />
                  <span>WINDOW</span>
                </div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem' }}>
                  {selectedTokenConfig.validWindow || 'All Day'}
                </div>
              </div>
            </div>

            {/* Manual Scan Input */}
            <form onSubmit={handleManualSubmit}>
              <label className="vibe-label" style={{ marginBottom: '6px', display: 'block' }}>
                Scan QR Code or Enter Student / Pass ID:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="vibe-input mono"
                  placeholder="Scan pass QR or type STU-XXXXX..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="vibe-btn vibe-btn-primary" style={{ padding: '0 18px' }}>
                  Fulfill Token
                </button>
              </div>
            </form>
          </div>

          {/* Quick Simulation Attendees */}
          <div className="vibe-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                Quick Attendee Simulation
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Click to simulate scan
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {eventPasses.slice(0, 4).map((p) => {
                const tok = p.tokens.find(t => t.tokenId === selectedTokenConfig.id);
                const isClaimed = tok ? tok.redeemedCount >= tok.maxAllocated : false;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProcessScan(p.id)}
                    className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                    style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', padding: '8px 12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={13} color="var(--text-tertiary)" />
                      <span>{p.student.fullName} ({p.student.studentId})</span>
                    </div>
                    <span className={`vibe-badge ${isClaimed ? 'badge-rose' : 'badge-emerald'}`}>
                      {isClaimed ? 'Redeemed' : 'Claimable'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Fulfillment Result or Station Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {lastRedemptionResult ? (
            /* Active Scan Result Card */
            <div className="vibe-card" style={{
              border: `1px solid ${lastRedemptionResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              background: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-xs)',
                  background: lastRedemptionResult.result === 'ACCEPTED' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {lastRedemptionResult.result === 'ACCEPTED' ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                </div>

                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: lastRedemptionResult.result === 'ACCEPTED' ? '#34d399' : '#fca5a5',
                    margin: 0
                  }}>
                    {lastRedemptionResult.message}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                    {lastRedemptionResult.timestamp} • Station: {selectedTokenConfig.locationCounter}
                  </div>
                </div>
              </div>

              <div style={{
                background: lastRedemptionResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${lastRedemptionResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '10px 12px',
                fontSize: '0.825rem',
                color: '#fff',
                marginBottom: '14px',
              }}>
                {lastRedemptionResult.reason}
              </div>

              {lastRedemptionResult.pass && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>ATTENDEE NAME</span>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{lastRedemptionResult.pass.student.fullName}</div>
                    </div>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>STUDENT ID</span>
                      <div className="mono" style={{ fontWeight: 600, color: '#ffffff' }}>{lastRedemptionResult.pass.student.studentId}</div>
                    </div>
                  </div>

                  <div className="vibe-card-raised" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>DEPARTMENT</span>
                      <div style={{ color: '#fff', fontSize: '0.78rem' }}>{lastRedemptionResult.pass.student.department}</div>
                    </div>
                    <span className="vibe-badge badge-emerald">
                      <ShieldCheck size={11} /> Verified Token
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standby State + Live Fulfillment Stream */
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={15} color="var(--text-secondary)" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                    Station Fulfillment Activity ({fulfilledPasses.length})
                  </h4>
                </div>
                <span className="vibe-badge badge-neutral">Live Feed</span>
              </div>

              {fulfilledPasses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fulfilledPasses.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="vibe-card-raised"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#34d399',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check size={13} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                            {p.student.fullName}
                          </div>
                          <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            {p.student.studentId} • Pass #{p.id}
                          </div>
                        </div>
                      </div>

                      <span className="vibe-badge badge-emerald">
                        Redeemed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <PackageCheck size={36} color="var(--text-tertiary)" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>
                    Ready to Dispense
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
                    Scan a student pass QR or enter roll number to verify voucher eligibility in real-time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEventContext } from '../../context/EventContext';
import type { ScanResult, EventPass } from '../../types';
import { StudentDetailsModal } from '../common/StudentDetailsModal';
import { 
  Scan, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UploadCloud, 
  Check, 
  ShieldCheck, 
  Utensils, 
  History, 
  User,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';

export const EntryScanner: React.FC = () => {
  const { 
    verifyPassEntry, 
    passes, 
    scanLogs, 
    currentEvent,
    fulfillToken 
  } = useEventContext();

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [selectedPassModal, setSelectedPassModal] = useState<EventPass | null>(null);
  const [lunchFulfillmentSuccess, setLunchFulfillmentSuccess] = useState<string | null>(null);

  const [lastScanResult, setLastScanResult] = useState<{
    result: ScanResult;
    message: string;
    pass?: EventPass;
    reason?: string;
    timestamp: string;
  } | null>(null);

  const [sessionStats, setSessionStats] = useState({ total: 0, accepted: 0, rejected: 0 });

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePasses = passes.filter(p => p.eventId === currentEvent?.id && p.status === 'Active');
  const usedPasses = passes.filter(p => p.eventId === currentEvent?.id && p.entryCount > 0);

  // Initialize camera scanner
  useEffect(() => {
    if (cameraActive) {
      const qrRegionId = 'qr-reader-container';
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleProcessScan(decodedText);
          setCameraActive(false);
        },
        () => {}
      ).catch((err) => {
        console.error('Camera start error:', err);
        setCameraActive(false);
      });

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [cameraActive]);

  const handleProcessScan = (rawText: string) => {
    if (!rawText.trim()) return;

    const res = verifyPassEntry(rawText, 'VOL-GATE-01', 'Main Gate Alpha');

    setLastScanResult({
      result: res.result,
      message: res.message,
      pass: res.pass,
      reason: res.reason,
      timestamp: new Date().toLocaleTimeString(),
    });

    setSessionStats(prev => ({
      total: prev.total + 1,
      accepted: res.result === 'ACCEPTED' ? prev.accepted + 1 : prev.accepted,
      rejected: res.result !== 'ACCEPTED' ? prev.rejected + 1 : prev.rejected,
    }));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new Html5Qrcode('entry-temp-file-reader');
    reader.scanFile(file, true)
      .then((decodedText) => {
        handleProcessScan(decodedText);
      })
      .catch((err) => {
        setLastScanResult({
          result: 'INVALID_SIGNATURE',
          message: 'No Valid QR Code Detected',
          reason: 'Unable to decode QR matrix from uploaded image. Ensure image is clear and well-lit.',
          timestamp: new Date().toLocaleTimeString(),
        });
      });
  };

  const handleQuickLunchRedeem = (passId: string, tokenId: string) => {
    const res = fulfillToken(passId, tokenId, 'VOL-GATE-01', 'Gate Dining Counter');
    if (res.success) {
      setLunchFulfillmentSuccess(tokenId);
      setTimeout(() => setLunchFulfillmentSuccess(null), 3000);
      if (lastScanResult?.pass) {
        const updated = passes.find(p => p.id === passId);
        if (updated) {
          setLastScanResult(prev => prev ? { ...prev, pass: updated } : null);
        }
      }
    }
  };

  // Recent scans list from global scanLogs
  const recentLogs = scanLogs.filter(l => l.eventId === currentEvent?.id).slice(0, 6);

  return (
    <div style={{ width: '100%' }}>
      <div id="entry-temp-file-reader" style={{ display: 'none' }} />

      {/* Top Banner Header */}
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
            <Scan size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              Teacher & Staff Gate Scanner
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Scan student QR for event entry check-in & meal voucher fulfillment
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Total: </span>
            <strong style={{ color: '#fff' }}>{sessionStats.total}</strong>
          </div>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--accent-emerald)' }}>Verified: </span>
            <strong style={{ color: 'var(--accent-emerald)' }}>{sessionStats.accepted}</strong>
          </div>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--accent-rose)' }}>Blocked: </span>
            <strong style={{ color: 'var(--accent-rose)' }}>{sessionStats.rejected}</strong>
          </div>
        </div>
      </div>

      {/* Balanced 2-Column Terminal Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '18px',
        alignItems: 'start',
      }}>
        {/* Left Column: Viewfinder & Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Optical Camera Viewport Card */}
          <div className="vibe-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                OPTICAL SCANNER TERMINAL
              </span>
              <span className="vibe-badge badge-neutral">
                {cameraActive ? 'Camera Live' : 'Viewfinder Standby'}
              </span>
            </div>

            {cameraActive ? (
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', minHeight: '230px', border: '1px solid var(--border-medium)' }}>
                <div id="qr-reader-container" style={{ width: '100%' }} />
                <div style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-surface-raised)' }}>
                  <button
                    type="button"
                    onClick={() => setCameraActive(false)}
                    className="vibe-btn vibe-btn-danger vibe-btn-sm"
                    style={{ width: '100%' }}
                  >
                    <CameraOff size={13} />
                    <span>Stop Camera</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '210px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                textAlign: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                }}>
                  <Scan size={24} />
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>
                    Optical QR Code Scanner Ready
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', maxWidth: '280px' }}>
                    Scan student QR from mobile screen, Gmail pass, or printed badge.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setCameraActive(true)}
                    className="vibe-btn vibe-btn-success vibe-btn-sm"
                  >
                    <Camera size={13} />
                    <span>Open Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  >
                    <UploadCloud size={13} />
                    <span>Upload Image</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>
            )}

            {/* Manual ID Verification */}
            <form onSubmit={handleManualSubmit} style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="vibe-input mono"
                style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                placeholder="Pass ID / Student ID / SMS PIN..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <button type="submit" className="vibe-btn vibe-btn-primary vibe-btn-sm" style={{ padding: '0 16px', whiteSpace: 'nowrap' }}>
                Verify Pass
              </button>
            </form>
          </div>

          {/* Quick Simulation Scenarios */}
          <div className="vibe-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Zap size={14} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                Quick Test Scenarios (Teacher Simulation)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activePasses.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleProcessScan(activePasses[0].qrPayload)}
                  className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
                >
                  <span>1. Valid Student Pass ({activePasses[0].student.fullName})</span>
                  <span className="vibe-badge badge-emerald">Valid</span>
                </button>
              )}

              {usedPasses.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleProcessScan(usedPasses[0].qrPayload)}
                  className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
                >
                  <span>2. Duplicate Pass Scan (Sharing Attempt)</span>
                  <span className="vibe-badge badge-rose">Duplicate</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleProcessScan('PASS-UNKNOWN-999')}
                className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
              >
                <span>3. Unregistered Pass</span>
                <span className="vibe-badge badge-amber">Invalid</span>
              </button>

              <button
                type="button"
                onClick={() => handleProcessScan('{"v":1,"pid":"TAMPERED","eid":"EVT","sid":"1","sig":"FAKE_SIG"}')}
                className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
              >
                <span>4. Tampered QR Signature (Forged)</span>
                <span className="vibe-badge badge-rose">Tampered</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Gate Activity Feed & Student Dossier */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {lastScanResult ? (
            /* Active Scan Result Dossier */
            <div className="vibe-card" style={{
              border: `1px solid ${lastScanResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              background: 'var(--bg-surface)',
            }}>
              {/* Scan Result Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-xs)',
                    background: lastScanResult.result === 'ACCEPTED' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {lastScanResult.result === 'ACCEPTED' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: lastScanResult.result === 'ACCEPTED' ? '#34d399' : '#fca5a5',
                      margin: 0
                    }}>
                      {lastScanResult.message}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      Scanned at {lastScanResult.timestamp} • Main Gate Alpha
                    </div>
                  </div>
                </div>

                {lastScanResult.pass && (
                  <button
                    type="button"
                    onClick={() => setSelectedPassModal(lastScanResult.pass || null)}
                    className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  >
                    <Maximize2 size={12} />
                    <span>Full Profile</span>
                  </button>
                )}
              </div>

              {/* Status Reason Banner */}
              <div style={{
                background: lastScanResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${lastScanResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '10px 12px',
                fontSize: '0.8rem',
                color: '#fff',
                marginBottom: '14px',
              }}>
                {lastScanResult.reason}
              </div>

              {/* Verified Student Details & Benefits */}
              {lastScanResult.pass && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>STUDENT NAME</span>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                        {lastScanResult.pass.student.fullName}
                      </div>
                    </div>

                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>STUDENT ID / ROLL NO</span>
                      <div className="mono" style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>
                        {lastScanResult.pass.student.studentId}
                      </div>
                    </div>
                  </div>

                  <div className="vibe-card-raised" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>DEPARTMENT</span>
                      <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
                        {lastScanResult.pass.student.department}
                      </div>
                    </div>
                    <span className="vibe-badge badge-emerald">
                      <ShieldCheck size={12} /> HMAC Verified
                    </span>
                  </div>

                  {/* Lunch Voucher Fulfill Quick Action */}
                  <div style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#fff' }}>
                        Lunch & Meal Quota
                      </span>
                      <span className="vibe-badge badge-neutral">Teacher Dispense</span>
                    </div>

                    {lastScanResult.pass.tokens.map((tok) => {
                      const isClaimed = tok.redeemedCount >= tok.maxAllocated;
                      return (
                        <div key={tok.tokenId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                            <Utensils size={13} color="var(--accent-amber)" />
                            <span style={{ color: '#fff' }}>{tok.tokenName}</span>
                          </div>

                          {isClaimed ? (
                            <span className="vibe-badge badge-neutral">Fulfilled ({tok.redeemedCount}/{tok.maxAllocated})</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickLunchRedeem(lastScanResult.pass!.id, tok.tokenId)}
                              className="vibe-btn vibe-btn-primary vibe-btn-sm"
                            >
                              <Check size={12} />
                              <span>Dispense Lunch</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standby Gate Telemetry & Check-in Feed */
            <div className="vibe-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={15} color="var(--text-secondary)" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                    Gate Check-in Stream ({recentLogs.length})
                  </h4>
                </div>
                <span className="vibe-badge badge-neutral">Main Gate Alpha</span>
              </div>

              {recentLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="vibe-card-raised"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
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
                            {log.studentName}
                          </div>
                          <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            {log.studentId} • {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <span className="vibe-badge badge-emerald">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <Activity size={36} color="var(--text-tertiary)" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>
                    Scanner Armed & Operational
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
                    Open the camera or scan a student pass QR to verify enrollment and dispense lunch tokens in real-time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedPassModal && (
        <StudentDetailsModal
          pass={selectedPassModal}
          event={currentEvent}
          onClose={() => setSelectedPassModal(null)}
        />
      )}
    </div>
  );
};

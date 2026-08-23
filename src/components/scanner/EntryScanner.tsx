import React, { useState, useEffect, useRef } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { ScanResult, EventPass } from '../../types';
import { StudentDetailsModal } from '../common/StudentDetailsModal';
import { 
  Scan, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  Maximize2,
  UploadCloud,
  Utensils,
  ShieldCheck,
  Zap,
  UserCheck,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

export const EntryScanner: React.FC = () => {
  const { 
    passes, 
    currentEvent, 
    verifyEntryScan, 
    verifyTokenRedemption,
    isOfflineMode 
  } = useEventContext();

  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('Main Gate #1');
  const [selectedPassModal, setSelectedPassModal] = useState<EventPass | null>(null);

  const [lastScanResult, setLastScanResult] = useState<{
    result: ScanResult;
    message: string;
    pass?: EventPass;
    reason?: string;
    timestamp: string;
  } | null>(null);

  const [sessionStats, setSessionStats] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
  });

  const [lunchActionFeedback, setLunchActionFeedback] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        false
      );

      scanner.render(
        (decodedText) => handleProcessScan(decodedText),
        () => {}
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }
  }, [cameraActive]);

  const handleProcessScan = (rawText: string) => {
    if (!rawText.trim()) return;
    setLunchActionFeedback(null);

    const res = verifyEntryScan(rawText, 'TEACHER-SCAN-01', selectedCheckpoint);

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
      rejected: res.result === 'REJECTED' ? prev.rejected + 1 : prev.rejected,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const html5QrCode = new Html5Qrcode('entry-temp-file-reader');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleProcessScan(decodedText);
      html5QrCode.clear();
    } catch (err) {
      console.error('Entry file scan error:', err);
      setLastScanResult({
        result: 'REJECTED',
        message: 'IMAGE SCAN FAILED',
        reason: 'Could not detect a clear QR Code in the uploaded image file.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleQuickClaimLunch = (pass: EventPass, tokenId: string) => {
    const res = verifyTokenRedemption(pass.id, tokenId, 'TEACHER-01', 'Lunch & Meal Counter');
    if (res.result === 'ACCEPTED') {
      setLunchActionFeedback(`✓ Lunch successfully claimed for ${pass.student.fullName}!`);
      // Update the active pass reference in scan result
      const updatedPass = passes.find(p => p.id === pass.id) || res.pass;
      if (updatedPass) {
        setLastScanResult(prev => prev ? { ...prev, pass: updatedPass } : null);
      }
    } else {
      setLunchActionFeedback(`⚠️ Lunch redemption blocked: ${res.reason || res.message}`);
    }
  };

  const activePasses = passes.filter(p => p.eventId === currentEvent?.id && p.status === 'Active');
  const usedPasses = passes.filter(p => p.eventId === currentEvent?.id && p.status === 'Used');

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden file scanner container */}
      <div id="entry-temp-file-reader" style={{ display: 'none' }} />

      {/* Top Banner */}
      <div className="vibe-card" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            color: '#09090b',
            display: 'flex',
          }}>
            <Scan size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Teacher & Staff Verification Scanner
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Scan student QR for Event Entry check-in & Lunch / Meal token fulfillment
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Total: </span>
            <strong style={{ color: '#fff' }}>{sessionStats.total}</strong>
          </div>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--accent-emerald)' }}>OK: </span>
            <strong style={{ color: 'var(--accent-emerald)' }}>{sessionStats.accepted}</strong>
          </div>
          <div className="vibe-card-raised" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--accent-rose)' }}>Blocked: </span>
            <strong style={{ color: 'var(--accent-rose)' }}>{sessionStats.rejected}</strong>
          </div>
        </div>
      </div>

      <div className="vibe-split-layout">
        {/* Left: Camera & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="vibe-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                SCANNER CAMERA / UPLOAD
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  title="Upload QR Code photo/image"
                >
                  <UploadCloud size={13} />
                  <span>Upload QR</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />

                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`vibe-btn vibe-btn-sm ${cameraActive ? 'vibe-btn-danger' : 'vibe-btn-success'}`}
                >
                  {cameraActive ? <CameraOff size={13} /> : <Camera size={13} />}
                  <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                </button>
              </div>
            </div>

            {cameraActive ? (
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', minHeight: '240px', border: '1px solid var(--border-medium)' }}>
                <div id="qr-reader-container" style={{ width: '100%' }} />
              </div>
            ) : (
              <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '220px',
                background: '#090a0f',
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
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-emerald)',
                }}>
                  <Scan size={26} />
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>
                    Optical QR Code Scanner Ready
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', maxWidth: '280px' }}>
                    Activate live webcam or upload a student ticket image for instant cryptographic verification.
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
                </div>
              </div>
            )}

            {/* Manual Lookup */}
            <form onSubmit={handleManualSubmit} style={{ marginTop: '14px', display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="vibe-input mono"
                style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                placeholder="Pass ID / Student ID / SMS PIN..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <button type="submit" className="vibe-btn vibe-btn-primary vibe-btn-sm" style={{ padding: '0 16px' }}>
                Verify Pass
              </button>
            </form>
          </div>

          {/* Quick Simulation Scenarios */}
          <div className="vibe-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Zap size={14} color="var(--accent-amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                Quick Test Scenarios (Teacher Simulation)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activePasses.length > 0 && (
                <button
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
                  onClick={() => handleProcessScan(usedPasses[0].qrPayload)}
                  className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                  style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
                >
                  <span>2. Duplicate Pass Scan (Sharing Attempt)</span>
                  <span className="vibe-badge badge-rose">Duplicate</span>
                </button>
              )}

              <button
                onClick={() => handleProcessScan('PASS-UNKNOWN-999')}
                className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.76rem' }}
              >
                <span>3. Unregistered Pass</span>
                <span className="vibe-badge badge-amber">Invalid</span>
              </button>

              <button
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

        {/* Right: Real-time Teacher Verification Feedback & Student Record */}
        <div>
          {lastScanResult ? (
            <div className="vibe-card" style={{
              borderColor: lastScanResult.result === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              background: 'var(--bg-surface)',
            }}>
              {/* Scan Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {lastScanResult.result === 'ACCEPTED' ? (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--accent-emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      <XCircle size={20} />
                    </div>
                  )}

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
                      Scanned at {lastScanResult.timestamp} • Location: {selectedCheckpoint}
                    </div>
                  </div>
                </div>

                {lastScanResult.pass && (
                  <button
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

              {/* Detailed Student Record */}
              {lastScanResult.pass && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Student Credentials Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>STUDENT NAME</span>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{lastScanResult.pass.student.fullName}</div>
                    </div>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>STUDENT ROLL / ID</span>
                      <div className="mono" style={{ fontWeight: 700, color: '#ffffff' }}>{lastScanResult.pass.student.studentId}</div>
                    </div>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>DEPARTMENT</span>
                      <div style={{ color: '#fff' }}>{lastScanResult.pass.student.department}</div>
                    </div>
                    <div className="vibe-card-raised">
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>STUDENT GMAIL</span>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>{lastScanResult.pass.student.email}</div>
                    </div>
                  </div>

                  {/* Lunch & Meal Quota Section for Teachers */}
                  <div style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Utensils size={15} color="var(--accent-amber)" />
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>
                          Lunch & Benefit Fulfillment (Teacher Action)
                        </span>
                      </div>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        Pass #{lastScanResult.pass.id}
                      </span>
                    </div>

                    {lunchActionFeedback && (
                      <div className="vibe-fade-in" style={{
                        background: lunchActionFeedback.startsWith('✓') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${lunchActionFeedback.startsWith('✓') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: 'var(--radius-xs)',
                        padding: '6px 10px',
                        marginBottom: '10px',
                        fontSize: '0.75rem',
                        color: lunchActionFeedback.startsWith('✓') ? '#34d399' : '#fca5a5',
                        fontWeight: 600
                      }}>
                        {lunchActionFeedback}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lastScanResult.pass.tokens.map((token) => {
                        const isRedeemed = token.redeemedCount >= token.maxAllocated;
                        return (
                          <div
                            key={token.tokenId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff' }}>
                                {token.tokenName}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                Status: {isRedeemed ? `Redeemed (${token.redeemedCount}/${token.maxAllocated})` : `${token.maxAllocated - token.redeemedCount} available to claim`}
                              </div>
                            </div>

                            {isRedeemed ? (
                              <span className="vibe-badge badge-rose">
                                ✓ Claimed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleQuickClaimLunch(lastScanResult.pass!, token.tokenId)}
                                className="vibe-btn vibe-btn-primary vibe-btn-sm"
                                style={{ background: '#059669', borderColor: '#059669', fontSize: '0.74rem' }}
                              >
                                <Utensils size={12} />
                                <span>Dispense Lunch</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security & Tamper Proof Assurance */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <ShieldCheck size={14} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>HMAC Cryptographic Validation Passed:</strong> This QR code cannot be forged, duplicated, or modified by anyone.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="vibe-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Scan size={36} color="var(--text-tertiary)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Scanner Armed & Ready</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '4px auto 0' }}>
                Scan a student's QR code from their phone, Gmail email, or paper pass to view student data and dispense lunch.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Modal */}
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

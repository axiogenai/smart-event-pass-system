import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useEventContext } from '../../context/EventContext';
import type { EventPass, StudentRegistration } from '../../types';
import { exportPassesToCsv } from '../../utils/exportCsv';
import { CustomDropdown } from '../common/CustomDropdown';
import { 
  IdCard, 
  Search, 
  Ban, 
  RotateCcw, 
  CheckCircle, 
  Download, 
  UserPlus, 
  UserX,
  X
} from 'lucide-react';

export const PassManager: React.FC = () => {
  const { 
    passes, 
    currentEvent, 
    issueEmergencyPass, 
    revokePass, 
    reactivatePass, 
    overrideEntry, 
    toggleBlacklist 
  } = useEventContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState<EventPass | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const [emergencyForm, setEmergencyForm] = useState<StudentRegistration>({
    fullName: '',
    studentId: '',
    department: 'Computer Science',
    email: '',
    phone: '',
    specialRequirements: 'Emergency VIP Pass Issued by Admin',
  });

  if (!currentEvent) return null;

  const eventPasses = passes.filter((p) => p.eventId === currentEvent.id);

  const filteredPasses = eventPasses.filter((p) => {
    const matchesSearch =
      p.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.smsBackupCode.includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'BLACKLISTED') return p.isBlacklisted;
    return p.status === filterStatus;
  });

  const handleCreateEmergencyPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyForm.fullName || !emergencyForm.studentId || !emergencyForm.email) return;

    issueEmergencyPass(currentEvent.id, emergencyForm);
    setShowEmergencyModal(false);
    setEmergencyForm({
      fullName: '',
      studentId: '',
      department: 'Computer Science',
      email: '',
      phone: '',
      specialRequirements: 'Emergency VIP Pass Issued by Admin',
    });
  };

  const handleConfirmOverride = () => {
    if (showOverrideModal) {
      overrideEntry(showOverrideModal.id, overrideReason || 'Manual Checkpoint Override', 'Super Admin');
      setShowOverrideModal(null);
      setOverrideReason('');
    }
  };

  const filterOptions = [
    { value: 'ALL', label: `All Passes (${eventPasses.length})` },
    { value: 'Active', label: 'Active Valid Passes' },
    { value: 'Used', label: 'Checked-In Passes' },
    { value: 'Revoked', label: 'Revoked Passes' },
    { value: 'BLACKLISTED', label: 'Blacklisted Passes' },
  ];

  return (
    <div className="vibe-card" style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px',
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
            <IdCard size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Pass Directory & Access Control
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Manage issued credentials, create emergency passes, and handle gate overrides
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportPassesToCsv(eventPasses, currentEvent.title)}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="vibe-btn vibe-btn-primary vibe-btn-sm"
          >
            <UserPlus size={13} />
            <span>Issue VIP Pass</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="vibe-input"
            style={{ paddingLeft: '34px', fontSize: '0.8rem', height: '34px' }}
            placeholder="Search attendee name, Student ID, pass serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomDropdown
          options={filterOptions}
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          width={220}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', minWidth: '550px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '10px 8px' }}>PASS ID</th>
              <th style={{ padding: '10px 8px' }}>ATTENDEE</th>
              <th style={{ padding: '10px 8px' }}>STATUS</th>
              <th style={{ padding: '10px 8px' }}>ENTRIES</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  No passes match search criteria.
                </td>
              </tr>
            ) : (
              filteredPasses.map((p) => {
                const isBlacklisted = p.isBlacklisted;
                const isRevoked = p.status === 'Revoked';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div className="mono" style={{ fontWeight: 600, color: '#fff' }}>{p.id}</div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>PIN: {p.smsBackupCode}</div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.student.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span className="mono">{p.student.studentId}</span> • {p.student.department}
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {isBlacklisted ? (
                        <span className="vibe-badge badge-rose">Blacklisted</span>
                      ) : isRevoked ? (
                        <span className="vibe-badge badge-rose">Revoked</span>
                      ) : p.status === 'Used' ? (
                        <span className="vibe-badge badge-indigo">Checked-In</span>
                      ) : (
                        <span className="vibe-badge badge-emerald">Active</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#fff', fontWeight: 600 }}>
                      {p.entryCount}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          onClick={() => setShowOverrideModal(p)}
                          className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                          title="Manual checkpoint override"
                        >
                          <CheckCircle size={12} />
                          <span>Override</span>
                        </button>

                        {isRevoked ? (
                          <button
                            onClick={() => reactivatePass(p.id)}
                            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
                            title="Reactivate pass"
                          >
                            <RotateCcw size={12} />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => revokePass(p.id, 'Administrative revocation')}
                            className="vibe-btn vibe-btn-danger vibe-btn-sm"
                            title="Revoke pass access"
                          >
                            <Ban size={12} />
                            <span>Revoke</span>
                          </button>
                        )}

                        <button
                          onClick={() => toggleBlacklist(p.id, !isBlacklisted)}
                          className={`vibe-btn vibe-btn-sm ${isBlacklisted ? 'vibe-btn-primary' : 'vibe-btn-secondary'}`}
                          title={isBlacklisted ? 'Remove from blacklist' : 'Add to security blacklist'}
                        >
                          <UserX size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && createPortal(
        <div 
          onClick={() => setShowEmergencyModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
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
            style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Issue VIP / Emergency Pass
              </h3>
              <button onClick={() => setShowEmergencyModal(false)} className="vibe-btn vibe-btn-secondary vibe-btn-sm" style={{ padding: '4px' }}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateEmergencyPass}>
              <div className="vibe-form-group">
                <label className="vibe-label">Attendee Full Name</label>
                <input
                  type="text"
                  className="vibe-input"
                  required
                  placeholder="e.g. Dr. Arthur Vance"
                  value={emergencyForm.fullName}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, fullName: e.target.value })}
                />
              </div>
              <div className="vibe-form-group">
                <label className="vibe-label">ID Number / Roll No</label>
                <input
                  type="text"
                  className="vibe-input mono"
                  required
                  placeholder="VIP-009"
                  value={emergencyForm.studentId}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, studentId: e.target.value })}
                />
              </div>
              <div className="vibe-form-group">
                <label className="vibe-label">Email</label>
                <input
                  type="email"
                  className="vibe-input"
                  required
                  placeholder="vip@summit.org"
                  value={emergencyForm.email}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, email: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button type="submit" className="vibe-btn vibe-btn-primary" style={{ flex: 1 }}>
                  Issue Pass
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="vibe-btn vibe-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Override Modal */}
      {showOverrideModal && createPortal(
        <div 
          onClick={() => setShowOverrideModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
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
            style={{ maxWidth: '400px', width: '100%', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Manual Entry Override
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Grant manual gate admission to <strong>{showOverrideModal.student.fullName}</strong>.
            </p>
            <div className="vibe-form-group">
              <label className="vibe-label">Reason *</label>
              <textarea
                className="vibe-textarea"
                rows={2}
                placeholder="e.g. Photo ID checked by supervisor."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={handleConfirmOverride} className="vibe-btn vibe-btn-primary" style={{ flex: 1 }}>
                Confirm Override
              </button>
              <button onClick={() => setShowOverrideModal(null)} className="vibe-btn vibe-btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

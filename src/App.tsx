import React, { useState, useEffect } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { Navbar } from './components/layout/Navbar';
import { RegistrationForm } from './components/student/RegistrationForm';
import { PassWallet } from './components/student/PassWallet';
import { EntryScanner } from './components/scanner/EntryScanner';
import { TokenRedemption } from './components/token/TokenRedemption';
import { LiveMetrics } from './components/admin/LiveMetrics';
import { GateFlowChart } from './components/admin/GateFlowChart';
import { SecurityAuditFeed } from './components/admin/SecurityAuditFeed';
import { VolunteerMonitor } from './components/admin/VolunteerMonitor';
import { PassManager } from './components/admin/PassManager';
import { EventCreator } from './components/organizer/EventCreator';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TrafficSimulator } from './components/simulator/TrafficSimulator';
import { StudentDetailsModal } from './components/common/StudentDetailsModal';
import { 
  UserCheck, 
  QrCode
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { persona, currentEvent, passes } = useEventContext();
  const [studentTab, setStudentTab] = useState<'WALLET' | 'REGISTER'>('WALLET');
  const [urlVerifiedPass, setUrlVerifiedPass] = useState<typeof passes[0] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passCode = params.get('pass') || params.get('verify');
    if (passCode) {
      const match = passes.find(p => p.id === passCode || p.smsBackupCode === passCode || p.student.studentId === passCode);
      if (match) {
        setUrlVerifiedPass(match);
      }
    }
  }, [passes]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '20px 0', width: '100%' }}>
        <div className="app-container">
          {/* STUDENT PORTAL */}
          {persona === 'STUDENT_PORTAL' && (
            <div>
              {/* Sub-tabs */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '18px',
              }}>
                <div style={{
                  display: 'inline-flex',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px',
                  gap: '3px',
                }}>
                  <button
                    type="button"
                    onClick={() => setStudentTab('WALLET')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.78rem',
                      fontWeight: studentTab === 'WALLET' ? 600 : 500,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: studentTab === 'WALLET' ? 'var(--border-medium)' : 'transparent',
                      background: studentTab === 'WALLET' ? 'var(--bg-surface-raised)' : 'transparent',
                      color: studentTab === 'WALLET' ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.12s ease',
                      outline: 'none',
                    }}
                  >
                    <QrCode size={14} />
                    <span>My Event Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentTab('REGISTER')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.78rem',
                      fontWeight: studentTab === 'REGISTER' ? 600 : 500,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: studentTab === 'REGISTER' ? 'var(--border-medium)' : 'transparent',
                      background: studentTab === 'REGISTER' ? 'var(--bg-surface-raised)' : 'transparent',
                      color: studentTab === 'REGISTER' ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.12s ease',
                      outline: 'none',
                    }}
                  >
                    <UserCheck size={14} />
                    <span>Register New Attendee</span>
                  </button>
                </div>
              </div>

              {studentTab === 'WALLET' ? (
                <PassWallet onRegisterClick={() => setStudentTab('REGISTER')} />
              ) : (
                <RegistrationForm />
              )}
            </div>
          )}

          {/* ENTRY SCANNER */}
          {persona === 'ENTRY_SCANNER' && (
            <div>
              <EntryScanner />
            </div>
          )}

          {/* TOKEN COUNTER */}
          {persona === 'TOKEN_COUNTER' && (
            <div>
              <TokenRedemption />
            </div>
          )}

          {/* ADMIN COMMAND */}
          {persona === 'ADMIN_COMMAND' && (
            <div>
              <LiveMetrics />
              <TrafficSimulator />
              <GateFlowChart />
              <PassManager />
              <div className="clean-grid-auto">
                <SecurityAuditFeed />
                <VolunteerMonitor />
              </div>
            </div>
          )}

          {/* ORGANIZER STUDIO */}
          {persona === 'ORGANIZER_STUDIO' && (
            <div>
              <EventCreator />
            </div>
          )}

          {/* ANALYTICS */}
          {persona === 'ANALYTICS_REPORTS' && (
            <div>
              <AnalyticsDashboard />
            </div>
          )}
        </div>
      </main>

      {/* URL Verification Modal */}
      {urlVerifiedPass && (
        <StudentDetailsModal
          pass={urlVerifiedPass}
          event={currentEvent}
          onClose={() => {
            setUrlVerifiedPass(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      )}

      {/* Modern Minimal Executive Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '14px 0',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        background: 'var(--bg-app)',
      }}>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>SmartEvent Pass</span>
              <span>—</span>
              <span>Credential & Access Infrastructure</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="status-dot status-dot-green" />
                <span style={{ color: 'var(--text-secondary)' }}>All Systems Operational</span>
              </div>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span>HMAC SHA-256</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}

export default App;

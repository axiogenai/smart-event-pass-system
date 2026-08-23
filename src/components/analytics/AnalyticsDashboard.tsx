import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { downloadExecutiveReportPdf } from '../../utils/exportPdf';
import { exportScanLogsToCsv, exportIncidentsToCsv } from '../../utils/exportCsv';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Utensils, 
  Layers 
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { currentEvent, passes, scanLogs, incidents } = useEventContext();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!currentEvent) return null;

  const eventPasses = passes.filter(p => p.eventId === currentEvent.id);
  const totalRegistered = eventPasses.length;
  const totalAttended = eventPasses.filter(p => p.entryCount > 0).length;
  const noShowCount = Math.max(0, totalRegistered - totalAttended);
  const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : '0';
  const noShowRate = totalRegistered > 0 ? ((noShowCount / totalRegistered) * 100).toFixed(1) : '0';

  const deptMap: { [dept: string]: { registered: number; attended: number } } = {};
  eventPasses.forEach(p => {
    const d = p.student.department || 'General';
    if (!deptMap[d]) {
      deptMap[d] = { registered: 0, attended: 0 };
    }
    deptMap[d].registered += 1;
    if (p.entryCount > 0) {
      deptMap[d].attended += 1;
    }
  });

  let totalPerkValueAllocated = 0;
  let totalPerkValueDispensed = 0;

  const tokenBreakdown = currentEvent.tokens.map(token => {
    let allocated = 0;
    let redeemed = 0;

    eventPasses.forEach(p => {
      const match = p.tokens.find(t => t.tokenId === token.id);
      if (match) {
        allocated += match.maxAllocated;
        redeemed += match.redeemedCount;
      }
    });

    const perkVal = token.perkValue || 20;
    totalPerkValueAllocated += allocated * perkVal;
    totalPerkValueDispensed += redeemed * perkVal;

    const rate = allocated > 0 ? ((redeemed / allocated) * 100).toFixed(1) : '0';

    return {
      ...token,
      allocated,
      redeemed,
      unredeemed: Math.max(0, allocated - redeemed),
      rate,
    };
  });

  const handleDownloadPdfReport = () => {
    setIsExportingPdf(true);
    try {
      downloadExecutiveReportPdf(currentEvent, eventPasses, scanLogs, incidents);
    } catch (err) {
      console.error('Failed to generate report PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
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
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-medium)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            display: 'flex',
          }}>
            <BarChart3 size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              Analytics & Executive Reports
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Attendance metrics, token fulfillment, and audit reports
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadPdfReport}
            disabled={isExportingPdf}
            className="vibe-btn vibe-btn-primary vibe-btn-sm"
          >
            <FileText size={13} />
            <span>{isExportingPdf ? 'Exporting...' : 'PDF Report'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportScanLogsToCsv(scanLogs, currentEvent.title)}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            <Download size={13} />
            <span>Audit CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportIncidentsToCsv(incidents, currentEvent.title)}
            className="vibe-btn vibe-btn-secondary vibe-btn-sm"
          >
            <Download size={13} />
            <span>Fraud CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="vibe-grid-auto" style={{ marginBottom: '20px' }}>
        <div className="vibe-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>ATTENDANCE RATE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399', margin: '4px 0 2px' }}>{attendanceRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{totalAttended} of {totalRegistered} verified</div>
        </div>

        <div className="vibe-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>NO-SHOW RATE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', margin: '4px 0 2px' }}>{noShowRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{noShowCount} registrants absent</div>
        </div>

        <div className="vibe-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>PERKS FULFILLED</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 2px' }}>${totalPerkValueDispensed}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fulfillment value dispensed</div>
        </div>

        <div className="vibe-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>RETAINED INVENTORY</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 2px' }}>${totalPerkValueAllocated - totalPerkValueDispensed}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Retained unredeemed stock</div>
        </div>
      </div>

      {/* Grid */}
      <div className="vibe-grid-auto">
        {/* Token Table */}
        <div className="vibe-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-medium)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Utensils size={14} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              Token Consumption
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tokenBreakdown.map((t) => (
              <div key={t.id} className="vibe-card-raised" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                  <span>{t.name}</span>
                  <span style={{ color: '#34d399' }}>{t.rate}% ({t.redeemed}/{t.allocated})</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginTop: '6px',
                }}>
                  <div style={{
                    width: `${t.rate}%`,
                    height: '100%',
                    background: '#10b981',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept Attendance */}
        <div className="vibe-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-medium)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={14} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              Attendance by Department
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(deptMap).map(([dept, data]) => {
              const rate = data.registered > 0 ? ((data.attended / data.registered) * 100).toFixed(0) : '0';
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{dept}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#34d399' }}>{data.attended}</strong>/{data.registered} ({rate}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${rate}%`,
                      height: '100%',
                      background: '#ffffff',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

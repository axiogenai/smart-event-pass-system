import type { EventPass, ScanLog, SecurityIncident } from '../types';

/**
 * Exports Pass list to downloadable CSV
 */
export function exportPassesToCsv(passes: EventPass[], eventTitle: string) {
  const headers = [
    'Pass ID',
    'Student Name',
    'Student ID',
    'Department',
    'Email',
    'Phone',
    'Status',
    'Entry Count',
    'Entry Timestamp',
    'SMS Code',
    'Tokens Status'
  ];

  const rows = passes.map(p => [
    p.id,
    `"${p.student.fullName.replace(/"/g, '""')}"`,
    p.student.studentId,
    p.student.department,
    p.student.email,
    p.student.phone,
    p.status,
    p.entryCount,
    p.entryTimestamp ? new Date(p.entryTimestamp).toLocaleString() : 'Not Entered',
    p.smsBackupCode,
    `"${p.tokens.map(t => `${t.tokenName}: ${t.redeemedCount}/${t.maxAllocated}`).join('; ')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadBlob(csvContent, `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Passes.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports Verification & Audit Scan Logs to CSV
 */
export function exportScanLogsToCsv(logs: ScanLog[], eventTitle: string) {
  const headers = [
    'Log ID',
    'Timestamp',
    'Pass ID',
    'Student Name',
    'Student ID',
    'Scan Type',
    'Target Token',
    'Scanner / Counter',
    'Result',
    'Reason / Notes'
  ];

  const rows = logs.map(l => [
    l.id,
    new Date(l.timestamp).toLocaleString(),
    l.passId,
    `"${l.studentName.replace(/"/g, '""')}"`,
    l.studentId,
    l.scanType,
    l.tokenName || 'Entry Gate',
    `"${l.counterName} (${l.scannerId})"`,
    l.result,
    `"${(l.reason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadBlob(csvContent, `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Audit_Logs.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports Security Incidents to CSV
 */
export function exportIncidentsToCsv(incidents: SecurityIncident[], eventTitle: string) {
  const headers = [
    'Incident ID',
    'Timestamp',
    'Severity',
    'Violation Type',
    'Pass ID',
    'Student Name',
    'Student ID',
    'Location',
    'Details',
    'Resolved Status'
  ];

  const rows = incidents.map(i => [
    i.id,
    new Date(i.timestamp).toLocaleString(),
    i.severity,
    i.type,
    i.passId,
    `"${i.studentName.replace(/"/g, '""')}"`,
    i.studentId,
    `"${i.scannerLocation.replace(/"/g, '""')}"`,
    `"${i.details.replace(/"/g, '""')}"`,
    i.resolved ? 'RESOLVED' : 'UNRESOLVED'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadBlob(csvContent, `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Security_Incidents.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

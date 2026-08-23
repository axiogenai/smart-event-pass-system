import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EventModel, EventPass, ScanLog, SecurityIncident } from '../types';
import { generateQrDataUrl } from './qrGenerator';

/**
 * Generates an official, beautifully styled Digital Event Pass PDF
 */
export async function downloadPassPdf(pass: EventPass, event: EventModel) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148], // A6 pocket pass size
  });

  // Background gradient banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 105, 148, 'F');

  doc.setFillColor(79, 70, 229); // indigo-600 top header
  doc.rect(0, 0, 105, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(event.title.substring(0, 28), 52.5, 11, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text(`OFFICIAL DIGITAL EVENT PASS • ${event.category.toUpperCase()}`, 52.5, 18, { align: 'center' });

  // White Pass Card Container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(6, 30, 93, 110, 4, 4, 'F');

  // Student Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(pass.student.fullName, 52.5, 39, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`ID: ${pass.student.studentId} • ${pass.student.department}`, 52.5, 45, { align: 'center' });

  // Generate QR code on canvas to image
  try {
    const qrDataUrl = await generateQrDataUrl(pass.qrPayload, {
      width: 220,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
    });
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 30, 48, 45, 45);
    }
  } catch (err) {
    console.error('Error adding QR image to PDF:', err);
  }

  // Pass ID & Security Hash
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(pass.id, 52.5, 96, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`SMS Code: ${pass.smsBackupCode} | Sig: ${pass.qrSignature.substring(0, 14)}...`, 52.5, 100, { align: 'center' });

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(12, 104, 93, 104);

  // Event Details Grid
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Date & Time:', 12, 110);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${event.date} at ${event.startTime}`, 35, 110);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Venue:', 12, 116);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(event.venue.substring(0, 32), 35, 116);

  // Token Badges Summary
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Included Tokens:', 12, 122);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // Green
  const tokenNames = pass.tokens.map(t => `${t.tokenName} (x${t.maxAllocated})`).join(', ');
  doc.text(tokenNames.substring(0, 42), 12, 128);

  // Security Footer note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('One-time entry only. Tampering or duplicate use is automatically flagged.', 52.5, 136, { align: 'center' });

  doc.save(`${pass.id}_${pass.student.fullName.replace(/\s+/g, '_')}_Pass.pdf`);
}

/**
 * Generates an Executive Post-Event Post-Mortem & Analytics Report PDF
 */
export function downloadExecutiveReportPdf(
  event: EventModel,
  passes: EventPass[],
  scanLogs: ScanLog[],
  incidents: SecurityIncident[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const totalRegistered = passes.length;
  const totalAttended = passes.filter(p => p.entryCount > 0).length;
  const noShowCount = totalRegistered - totalAttended;
  const attendanceRate = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : '0';

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE EVENT ANALYTICS & AUDIT REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Event: ${event.title} • Generated: ${new Date().toLocaleString()}`, 14, 26);

  // Section 1: Executive KPI Summary Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 42, 182, 34, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 42, 182, 34, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('TOTAL REGISTRATIONS', 20, 52);
  doc.text('VERIFIED ATTENDEES', 68, 52);
  doc.text('ATTENDANCE RATE', 116, 52);
  doc.text('SECURITY ALERTS', 160, 52);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalRegistered}`, 20, 64);
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`${totalAttended}`, 68, 64);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(`${attendanceRate}%`, 116, 64);
  doc.setTextColor(incidents.length > 0 ? 239 : 100, 68, 68); // Red
  doc.text(`${incidents.length}`, 160, 64);

  // Section 2: Token Redemption Analysis Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Token Distribution & Redemption Metrics', 14, 86);

  const tokenRows = event.tokens.map(token => {
    let totalAllocated = 0;
    let totalRedeemed = 0;

    passes.forEach(p => {
      const match = p.tokens.find(t => t.tokenId === token.id);
      if (match) {
        totalAllocated += match.maxAllocated;
        totalRedeemed += match.redeemedCount;
      }
    });

    const rate = totalAllocated > 0 ? ((totalRedeemed / totalAllocated) * 100).toFixed(1) + '%' : '0%';
    const unredeemed = totalAllocated - totalRedeemed;

    return [
      token.name,
      token.type.toUpperCase(),
      token.locationCounter,
      totalAllocated.toString(),
      totalRedeemed.toString(),
      unredeemed.toString(),
      rate
    ];
  });

  autoTable(doc, {
    startY: 90,
    head: [['Token Name', 'Category', 'Counter', 'Allocated', 'Redeemed', 'Unredeemed', 'Redemption %']],
    body: tokenRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8.5 },
  });

  // Section 3: Security & Fraud Incident Summary Table
  const nextY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Security & Duplicate Pass Incident Log', 14, nextY);

  const incidentRows = incidents.slice(0, 10).map(inc => [
    new Date(inc.timestamp).toLocaleTimeString(),
    inc.severity,
    inc.type,
    inc.studentName,
    inc.scannerLocation,
    inc.details
  ]);

  if (incidentRows.length === 0) {
    incidentRows.push(['-', 'INFO', 'NONE', 'No security violations detected', 'All Gates', 'Clean verification run']);
  }

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Time', 'Severity', 'Type', 'Student', 'Location', 'Incident Details']],
    body: incidentRows,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72] }, // Rose-600
    styles: { fontSize: 8 },
  });

  // Footer notes
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Smart Event Pass & Token Management System • Cryptographically Verified Audit Trail', 105, pageHeight - 10, { align: 'center' });

  doc.save(`${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Executive_Audit_Report.pdf`);
}

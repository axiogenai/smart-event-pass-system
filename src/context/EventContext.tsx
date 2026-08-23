import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import type { 
  EventModel, 
  EventPass, 
  ScanLog, 
  SecurityIncident, 
  VolunteerStaff, 
  AppPersona, 
  StudentRegistration,
  ScanResult,
  StudentTokenAllocation
} from '../types';
import { 
  generatePassId, 
  generateSmsBackupCode, 
  createQrSignature, 
  packQrPayload, 
  verifyQrPayload,
  type EncryptedPassPayload
} from '../utils/crypto';
import { soundEffects } from '../utils/audio';

interface EventContextType {
  // Navigation & Persona
  persona: AppPersona;
  setPersona: (persona: AppPersona) => void;
  
  // Events
  events: EventModel[];
  currentEventId: string;
  setCurrentEventId: (id: string) => void;
  currentEvent: EventModel | undefined;
  createEvent: (eventData: Omit<EventModel, 'id' | 'createdAt'>) => string;
  updateEvent: (event: EventModel) => void;

  // Passes & Registrations
  passes: EventPass[];
  currentPass: EventPass | null;
  setCurrentPass: (pass: EventPass | null) => void;
  registerStudent: (eventId: string, reg: StudentRegistration) => { success: boolean; pass?: EventPass; error?: string };
  issueEmergencyPass: (eventId: string, reg: StudentRegistration, notes?: string) => EventPass;
  revokePass: (passId: string, reason: string) => void;
  reactivatePass: (passId: string) => void;
  overrideEntry: (passId: string, reason: string, adminName: string) => void;
  toggleBlacklist: (passId: string, isBlacklisted: boolean) => void;

  // Scanning & Checkpoints
  verifyEntryScan: (
    rawInput: string, 
    scannerId?: string, 
    counterName?: string
  ) => { result: ScanResult; message: string; pass?: EventPass; reason?: string };
  
  verifyTokenRedemption: (
    rawInput: string, 
    tokenId: string, 
    scannerId?: string, 
    counterName?: string
  ) => { result: ScanResult; message: string; pass?: EventPass; reason?: string };

  // Logs & Security
  scanLogs: ScanLog[];
  incidents: SecurityIncident[];
  volunteers: VolunteerStaff[];
  resolveIncident: (incidentId: string) => void;
  
  // Offline Mode & Sync
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // Active Token Counter Selection
  selectedCounterTokenId: string;
  setSelectedCounterTokenId: (tokenId: string) => void;

  // Live Traffic Simulator
  runLiveSimulationBurst: (count: number, includeDuplicateFraud: boolean) => void;
  resetEventData: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Initial Seed Events
const SEED_EVENTS: EventModel[] = [
  {
    id: 'EVT-TECHFEST-2026',
    title: 'Global Tech & AI Summit 2026',
    category: 'Technology Conference',
    date: '2026-09-15',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    venue: 'Convention Center • Grand Hall Alpha',
    capacity: 500,
    registrationDeadline: '2026-09-10',
    status: 'Open',
    entryPolicy: 'single',
    allowedDepartments: ['Computer Science', 'Information Tech', 'Electronics', 'Data Science', 'All'],
    bannerGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
    organizer: 'Tech Club & IEEE Student Branch',
    createdAt: new Date().toISOString(),
    tokens: [
      {
        id: 'TKN-FOOD-01',
        name: 'Buffet Lunch & Beverage',
        type: 'food',
        icon: 'Utensils',
        maxRedemptions: 1,
        locationCounter: 'Dining Hall Station B',
        description: 'Access to 3-course executive lunch and beverage station',
        validWindow: '12:00 PM - 02:30 PM',
        perkValue: 25,
      },
      {
        id: 'TKN-MERCH-01',
        name: 'Official Summit Swag Kit',
        type: 'merchandise',
        icon: 'Gift',
        maxRedemptions: 1,
        locationCounter: 'Swag Distribution Desk',
        description: 'Includes summit t-shirt, tech badge, and sticker pack',
        validWindow: '09:00 AM - 05:00 PM',
        perkValue: 35,
      },
      {
        id: 'TKN-CERT-01',
        name: 'Verified Participation Certificate',
        type: 'certificate',
        icon: 'Award',
        maxRedemptions: 1,
        locationCounter: 'Academic Accreditation Desk',
        description: 'Digitally signed IEEE accreditation & physical plaque',
        validWindow: '04:00 PM - 06:00 PM',
        perkValue: 15,
      },
      {
        id: 'TKN-VIP-01',
        name: 'VIP Networking Lounge Access',
        type: 'vip',
        icon: 'Sparkles',
        maxRedemptions: 1,
        locationCounter: 'VIP Mezzanine Lounge',
        description: 'Keynote speakers meet & greet and artisan espresso bar',
        validWindow: '01:00 PM - 04:00 PM',
        perkValue: 50,
      }
    ]
  },
  {
    id: 'EVT-HACKATHON-2026',
    title: 'Nexus 48hr Mega Hackathon',
    category: 'Hackathon & Competition',
    date: '2026-10-02',
    startTime: '08:00 AM',
    endTime: '08:00 AM (Next Day)',
    venue: 'Innovation Innovation Hub • Labs 1-4',
    capacity: 250,
    registrationDeadline: '2026-09-28',
    status: 'Open',
    entryPolicy: 'multi',
    allowedDepartments: ['Engineering', 'Computer Science', 'Design', 'Business'],
    bannerGradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
    organizer: 'Nexus Developer Network',
    createdAt: new Date().toISOString(),
    tokens: [
      {
        id: 'TKN-HACK-MEALS',
        name: 'Midnight Energy Pack & Pizza',
        type: 'food',
        icon: 'Pizza',
        maxRedemptions: 2,
        locationCounter: 'Cafeteria Wing',
        description: 'Late night fuel meal box with red bull & snack pack',
        validWindow: '11:00 PM - 02:00 AM',
        perkValue: 30,
      },
      {
        id: 'TKN-HACK-SWAG',
        name: 'Hackathon Hoodie & Stickers',
        type: 'merchandise',
        icon: 'Shirt',
        maxRedemptions: 1,
        locationCounter: 'Registration Pod 1',
        description: 'Custom embroidered hacker hoodie',
        validWindow: 'All Day',
        perkValue: 40,
      }
    ]
  }
];

// Initial Seed Passes for Demonstration
const createSeedPass = (
  eventId: string,
  passId: string,
  fullName: string,
  studentId: string,
  department: string,
  email: string,
  status: 'Active' | 'Used',
  tokensConfig: EventModel['tokens'],
  entryCount = 0
): EventPass => {
  const expiresAt = '2026-09-15T23:59:59Z';
  const qrSignature = createQrSignature(passId, eventId, studentId);
  const tokenAllocations = tokensConfig.map(t => ({
    tokenId: t.id,
    tokenName: t.name,
    type: t.type,
    maxAllocated: t.maxRedemptions,
    redeemedCount: 0,
    status: 'Available' as const,
  }));

  const qrPayload = packQrPayload(
    passId,
    eventId,
    studentId,
    fullName,
    expiresAt,
    tokensConfig.map(t => t.id)
  );

  return {
    id: passId,
    eventId,
    student: {
      fullName,
      studentId,
      department,
      email,
      phone: '+1 (555) 234-5678',
      specialRequirements: 'None'
    },
    qrPayload,
    qrSignature,
    status,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt,
    entryCount,
    entryTimestamp: status === 'Used' ? new Date(Date.now() - 3600000 * 2).toISOString() : undefined,
    tokens: tokenAllocations,
    smsBackupCode: generateSmsBackupCode(),
    isBlacklisted: false
  };
};

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<AppPersona>('STUDENT_PORTAL');
  const [events, setEvents] = useState<EventModel[]>(() => {
    const saved = localStorage.getItem('agy_events_v2');
    return saved ? JSON.parse(saved) : SEED_EVENTS;
  });

  const [currentEventId, setCurrentEventId] = useState<string>(() => {
    const saved = localStorage.getItem('agy_current_event_v2');
    return saved || 'EVT-TECHFEST-2026';
  });

  const [passes, setPasses] = useState<EventPass[]>(() => {
    const saved = localStorage.getItem('agy_passes_v2');
    if (saved) return JSON.parse(saved);
    
    // Seed initial realistic passes
    const defaultEvt = SEED_EVENTS[0];
    return [
      createSeedPass(defaultEvt.id, 'PASS-A9F2-2026', 'Alex Rivera', 'STU-10492', 'Computer Science', 'alex.rivera@university.edu', 'Active', defaultEvt.tokens),
      createSeedPass(defaultEvt.id, 'PASS-B7X4-2026', 'Sophia Chen', 'STU-10884', 'Data Science', 'sophia.chen@university.edu', 'Used', defaultEvt.tokens, 1),
      createSeedPass(defaultEvt.id, 'PASS-K3M9-2026', 'Marcus Vance', 'STU-11204', 'Electronics', 'marcus.vance@university.edu', 'Active', defaultEvt.tokens),
      createSeedPass(defaultEvt.id, 'PASS-R8D1-2026', 'Elena Rostova', 'STU-11599', 'Information Tech', 'elena.rostova@university.edu', 'Active', defaultEvt.tokens),
    ];
  });

  const [currentPass, setCurrentPass] = useState<EventPass | null>(() => passes[0] || null);

  const [scanLogs, setScanLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem('agy_scanlogs_v2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'LOG-001',
        passId: 'PASS-B7X4-2026',
        studentName: 'Sophia Chen',
        studentId: 'STU-10884',
        eventId: 'EVT-TECHFEST-2026',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        scannerId: 'VOL-G01',
        scannerRole: 'ENTRY',
        counterName: 'Main Gate Checkpoint #1',
        scanType: 'ENTRY',
        result: 'ACCEPTED',
        reason: 'Valid pass verification. Initial gate entry logged.'
      }
    ];
  });

  const [incidents, setIncidents] = useState<SecurityIncident[]>(() => {
    const saved = localStorage.getItem('agy_incidents_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [volunteers] = useState<VolunteerStaff[]>([
    {
      id: 'VOL-G01',
      name: 'Jordan Miller',
      role: 'ENTRY_SCANNER',
      checkpointName: 'Main Gate Checkpoint #1',
      active: true,
      scansCount: 42,
      approvedCount: 40,
      rejectedCount: 2,
      avgScanTimeMs: 1420
    },
    {
      id: 'VOL-G02',
      name: 'Samantha Ray',
      role: 'ENTRY_SCANNER',
      checkpointName: 'VIP Fast Track Gate #2',
      active: true,
      scansCount: 28,
      approvedCount: 28,
      rejectedCount: 0,
      avgScanTimeMs: 1150
    },
    {
      id: 'VOL-T01',
      name: 'David Kim',
      role: 'TOKEN_COUNTER',
      checkpointName: 'Dining Hall Station B',
      active: true,
      scansCount: 35,
      approvedCount: 33,
      rejectedCount: 2,
      avgScanTimeMs: 1800
    },
    {
      id: 'VOL-T02',
      name: 'Priya Patel',
      role: 'TOKEN_COUNTER',
      checkpointName: 'Swag Distribution Desk',
      active: true,
      scansCount: 50,
      approvedCount: 49,
      rejectedCount: 1,
      avgScanTimeMs: 1250
    }
  ]);

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<ScanLog[]>([]);
  const [selectedCounterTokenId, setSelectedCounterTokenId] = useState<string>('TKN-FOOD-01');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('agy_events_v2', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('agy_current_event_v2', currentEventId);
  }, [currentEventId]);

  useEffect(() => {
    localStorage.setItem('agy_passes_v2', JSON.stringify(passes));
  }, [passes]);

  useEffect(() => {
    localStorage.setItem('agy_scanlogs_v2', JSON.stringify(scanLogs));
  }, [scanLogs]);

  useEffect(() => {
    localStorage.setItem('agy_incidents_v2', JSON.stringify(incidents));
  }, [incidents]);

  const currentEvent = useMemo(() => {
    return events.find(e => e.id === currentEventId) || events[0];
  }, [events, currentEventId]);

  // Keep currentPass in sync if passes change
  useEffect(() => {
    if (currentPass) {
      const fresh = passes.find(p => p.id === currentPass.id);
      if (fresh) {
        setCurrentPass(fresh);
      }
    }
  }, [passes]);

  // Register Student & Issue Pass
  const registerStudent = (eventId: string, reg: StudentRegistration) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return { success: false, error: 'Event not found' };

    // Duplicate checks
    const existingEmail = passes.find(p => p.eventId === eventId && p.student.email.toLowerCase() === reg.email.toLowerCase());
    if (existingEmail) {
      return { 
        success: false, 
        error: `Duplicate Email: An active pass (${existingEmail.id}) is already registered to ${reg.email}.` 
      };
    }

    const existingStudentId = passes.find(p => p.eventId === eventId && p.student.studentId.trim().toUpperCase() === reg.studentId.trim().toUpperCase());
    if (existingStudentId) {
      return { 
        success: false, 
        error: `Duplicate Student ID: Pass (${existingStudentId.id}) has already been generated for ID ${reg.studentId}.` 
      };
    }

    // Capacity Check
    const registeredForEvent = passes.filter(p => p.eventId === eventId).length;
    if (registeredForEvent >= targetEvent.capacity) {
      return { 
        success: false, 
        error: `Event Full: Maximum venue capacity (${targetEvent.capacity}) reached. Please contact organizer.` 
      };
    }

    // Generate Pass
    const passId = generatePassId();
    const expiresAt = new Date(Date.now() + 86400000 * 30).toISOString();
    const qrSignature = createQrSignature(passId, eventId, reg.studentId);
    const tokenAllocations: StudentTokenAllocation[] = targetEvent.tokens.map(t => ({
      tokenId: t.id,
      tokenName: t.name,
      type: t.type,
      maxAllocated: t.maxRedemptions,
      redeemedCount: 0,
      status: 'Available',
    }));

    const qrPayload = packQrPayload(
      passId,
      eventId,
      reg.studentId,
      reg.fullName,
      expiresAt,
      targetEvent.tokens.map(t => t.id)
    );

    const newPass: EventPass = {
      id: passId,
      eventId,
      student: reg,
      qrPayload,
      qrSignature,
      status: 'Active',
      createdAt: new Date().toISOString(),
      expiresAt,
      entryCount: 0,
      tokens: tokenAllocations,
      smsBackupCode: generateSmsBackupCode(),
      isBlacklisted: false
    };

    setPasses(prev => [newPass, ...prev]);
    setCurrentPass(newPass);

    return { success: true, pass: newPass };
  };

  // Issue Emergency Pass (Admin Action)
  const issueEmergencyPass = (eventId: string, reg: StudentRegistration, notes?: string): EventPass => {
    const targetEvent = events.find(e => e.id === eventId) || events[0];
    const passId = generatePassId();
    const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();
    const qrSignature = createQrSignature(passId, targetEvent.id, reg.studentId);
    const tokenAllocations: StudentTokenAllocation[] = targetEvent.tokens.map(t => ({
      tokenId: t.id,
      tokenName: t.name,
      type: t.type,
      maxAllocated: t.maxRedemptions,
      redeemedCount: 0,
      status: 'Available',
    }));

    const qrPayload = packQrPayload(
      passId,
      targetEvent.id,
      reg.studentId,
      reg.fullName,
      expiresAt,
      targetEvent.tokens.map(t => t.id)
    );

    const newPass: EventPass = {
      id: passId,
      eventId: targetEvent.id,
      student: reg,
      qrPayload,
      qrSignature,
      status: 'Active',
      createdAt: new Date().toISOString(),
      expiresAt,
      entryCount: 0,
      tokens: tokenAllocations,
      smsBackupCode: generateSmsBackupCode(),
      notes: notes || 'Issued by Admin / Emergency Protocol'
    };

    setPasses(prev => [newPass, ...prev]);
    return newPass;
  };

  // Entry Checkpoint Verification Scanner
  const verifyEntryScan = (
    rawInput: string,
    scannerId = 'VOL-G01',
    counterName = 'Main Gate Checkpoint #1'
  ): { result: ScanResult; message: string; pass?: EventPass; reason?: string } => {
    const input = rawInput.trim();
    let searchPassId = input;
    let verifiedPayload: EncryptedPassPayload | null = null;

    // Check with universal verifyQrPayload
    const verification = verifyQrPayload(input);
    if (verification.isValid && verification.payload) {
      verifiedPayload = verification.payload;
      searchPassId = verifiedPayload.pid || input;
    } else if (input.startsWith('{') || (input.includes('?') && input.includes('sig='))) {
      soundEffects.playAlert();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: 'UNKNOWN',
        studentName: 'Unregistered / Tampered',
        studentId: 'N/A',
        eventId: currentEventId,
        timestamp: new Date().toISOString(),
        type: 'TAMPERED_CHECKSUM',
        severity: 'CRITICAL',
        details: `Tampered or invalid cryptographic signature: ${verification.error}`,
        scannerLocation: counterName,
        resolved: false,
      };
      setIncidents(prev => [incident, ...prev]);

      return {
        result: 'REJECTED',
        message: 'TAMPERED OR INVALID QR SIGNATURE',
        reason: verification.error
      };
    }

    // Match pass in database
    let pass = passes.find(p => 
      p.id.toUpperCase() === searchPassId.toUpperCase() || 
      p.smsBackupCode === searchPassId ||
      p.student.studentId.toUpperCase() === searchPassId.toUpperCase()
    );

    // If verified via valid payload but not in memory, dynamically reconstruct
    if (!pass && verifiedPayload) {
      pass = {
        id: verifiedPayload.pid,
        eventId: verifiedPayload.eid || currentEventId,
        student: {
          fullName: verifiedPayload.sname || 'Verified Student',
          studentId: verifiedPayload.sid || searchPassId,
          department: 'Computer Science',
          email: `${(verifiedPayload.sname || 'student').toLowerCase().replace(/\s+/g, '.')}@university.edu`,
          phone: '+1 (555) 234-5678',
          specialRequirements: 'Standard'
        },
        qrPayload: input,
        qrSignature: verifiedPayload.sig,
        status: 'Active',
        createdAt: new Date().toISOString(),
        expiresAt: verifiedPayload.exp || '2026-09-15T23:59:59Z',
        entryCount: 0,
        tokens: (currentEvent?.tokens || []).map(t => ({
          tokenId: t.id,
          tokenName: t.name,
          type: t.type,
          maxAllocated: t.maxRedemptions,
          redeemedCount: 0,
          status: 'Available' as const,
        })),
        smsBackupCode: '492811',
        isBlacklisted: false
      };
      setPasses(prev => [pass!, ...prev]);
    }

    if (!pass) {
      soundEffects.playError();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: searchPassId || 'UNKNOWN',
        studentName: 'Unknown Attendee',
        studentId: searchPassId,
        eventId: currentEventId,
        timestamp: new Date().toISOString(),
        type: 'UNREGISTERED' as unknown as SecurityIncident['type'],
        severity: 'MEDIUM',
        details: `Scanned ID/Pass "${searchPassId}" not found in registered event database.`,
        scannerLocation: counterName,
        resolved: false,
      };
      setIncidents(prev => [incident, ...prev]);

      return {
        result: 'REJECTED',
        message: 'PASS NOT FOUND',
        reason: `No active pass found matching identifier: ${searchPassId}`
      };
    }

    // Check if blacklisted
    if (pass.isBlacklisted) {
      soundEffects.playAlert();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        type: 'BLACKLISTED',
        severity: 'CRITICAL',
        details: `Blacklisted student attempted checkpoint entry: ${pass.student.fullName} (${pass.student.studentId})`,
        scannerLocation: counterName,
        resolved: false,
      };
      setIncidents(prev => [incident, ...prev]);

      return {
        result: 'REJECTED',
        pass,
        message: 'STUDENT BLACKLISTED / ACCESS DENIED',
        reason: 'Security exclusion protocol active for this student.'
      };
    }

    // Check if Wrong Event
    if (pass.eventId !== currentEventId) {
      soundEffects.playError();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: currentEventId,
        timestamp: new Date().toISOString(),
        type: 'WRONG_EVENT',
        severity: 'LOW',
        details: `Pass ${pass.id} is registered for event ${pass.eventId}, not ${currentEventId}.`,
        scannerLocation: counterName,
        resolved: true,
      };
      setIncidents(prev => [incident, ...prev]);

      return {
        result: 'REJECTED',
        pass,
        message: 'WRONG EVENT PASS',
        reason: `This pass is issued for another event (${pass.eventId}).`
      };
    }

    // Check if Revoked
    if (pass.status === 'Revoked') {
      soundEffects.playError();
      return {
        result: 'REJECTED',
        pass,
        message: 'PASS REVOKED BY ORGANIZER',
        reason: pass.revocationReason || 'This pass has been formally voided.'
      };
    }

    // Check Duplicate Scan (Single-entry violation)
    if (currentEvent?.entryPolicy === 'single' && pass.status === 'Used') {
      soundEffects.playError();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        type: 'DUPLICATE_ENTRY',
        severity: 'HIGH',
        details: `Duplicate entry attempted for pass ${pass.id}. Already verified at ${pass.entryTimestamp ? new Date(pass.entryTimestamp).toLocaleTimeString() : 'earlier'}. Potential pass sharing.`,
        scannerLocation: counterName,
        resolved: false,
      };
      setIncidents(prev => [incident, ...prev]);

      const log: ScanLog = {
        id: `LOG-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        scannerId,
        scannerRole: 'ENTRY',
        counterName,
        scanType: 'ENTRY',
        result: 'REJECTED',
        reason: 'DUPLICATE_USE: Pass has already been used for entry.'
      };
      setScanLogs(prev => [log, ...prev]);

      return {
        result: 'REJECTED',
        pass,
        message: 'DUPLICATE SCAN: ALREADY ENTERED',
        reason: `Pass was previously scanned at ${pass.entryTimestamp ? new Date(pass.entryTimestamp).toLocaleTimeString() : 'earlier'}. Pass sharing is strictly prohibited.`
      };
    }

    // SUCCESSFUL ENTRY!
    soundEffects.playSuccess();
    const updatedPass: EventPass = {
      ...pass,
      status: 'Used',
      entryCount: pass.entryCount + 1,
      entryTimestamp: pass.entryTimestamp || new Date().toISOString()
    };

    setPasses(prev => prev.map(p => p.id === pass.id ? updatedPass : p));

    const log: ScanLog = {
      id: `LOG-${Date.now()}`,
      passId: pass.id,
      studentName: pass.student.fullName,
      studentId: pass.student.studentId,
      eventId: pass.eventId,
      timestamp: new Date().toISOString(),
      scannerId,
      scannerRole: 'ENTRY',
      counterName,
      scanType: 'ENTRY',
      result: 'ACCEPTED',
      reason: 'Pass verified successfully. Cryptographic signature and ID confirmed.',
      isOfflineCached: isOfflineMode
    };

    if (isOfflineMode) {
      setOfflineQueue(prev => [log, ...prev]);
    }

    setScanLogs(prev => [log, ...prev]);

    return {
      result: 'ACCEPTED',
      pass: updatedPass,
      message: 'PASS VERIFIED & ACCEPTED',
      reason: `Welcome, ${pass.student.fullName}! Entry #${updatedPass.entryCount} granted.`
    };
  };

  // Token Redemption Verification Scanner
  const verifyTokenRedemption = (
    rawInput: string,
    tokenId: string,
    scannerId = 'VOL-T01',
    counterName = 'Token Redemption Counter'
  ): { result: ScanResult; message: string; pass?: EventPass; reason?: string } => {
    const input = rawInput.trim();
    let searchPassId = input;

    const verification = verifyQrPayload(input);
    if (verification.isValid && verification.payload) {
      searchPassId = verification.payload.pid || input;
    }

    const pass = passes.find(p => 
      p.id.toUpperCase() === searchPassId.toUpperCase() || 
      p.smsBackupCode === searchPassId ||
      p.student.studentId.toUpperCase() === searchPassId.toUpperCase()
    );


    if (!pass) {
      soundEffects.playError();
      return {
        result: 'REJECTED',
        message: 'PASS NOT FOUND',
        reason: `Pass not found in system for code: ${searchPassId}`
      };
    }

    if (pass.status === 'Revoked') {
      soundEffects.playError();
      return {
        result: 'REJECTED',
        pass,
        message: 'PASS REVOKED',
        reason: 'This attendee pass has been revoked by admin.'
      };
    }

    const token = pass.tokens.find(t => t.tokenId === tokenId);
    if (!token) {
      soundEffects.playError();
      return {
        result: 'REJECTED',
        pass,
        message: 'TOKEN NOT ALLOCATED',
        reason: 'This benefit token is not included in this pass tier.'
      };
    }

    // Check if already redeemed
    if (token.redeemedCount >= token.maxAllocated) {
      soundEffects.playError();
      const incident: SecurityIncident = {
        id: `INC-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        type: 'ALREADY_REDEEMED',
        severity: 'MEDIUM',
        details: `Duplicate token claim attempted for "${token.tokenName}". Already redeemed ${token.redeemedCount}/${token.maxAllocated} times. Last redeemed at ${token.lastRedeemedAt ? new Date(token.lastRedeemedAt).toLocaleTimeString() : 'earlier'}.`,
        scannerLocation: counterName,
        resolved: false,
      };
      setIncidents(prev => [incident, ...prev]);

      const log: ScanLog = {
        id: `LOG-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        scannerId,
        scannerRole: 'TOKEN_COUNTER',
        counterName,
        scanType: 'TOKEN',
        tokenId: token.tokenId,
        tokenName: token.tokenName,
        result: 'REJECTED',
        reason: `ALREADY_REDEEMED: Max quota (${token.maxAllocated}) exhausted for ${token.tokenName}.`
      };
      setScanLogs(prev => [log, ...prev]);

      return {
        result: 'REJECTED',
        pass,
        message: `TOKEN ALREADY REDEEMED (${token.redeemedCount}/${token.maxAllocated})`,
        reason: `Attendee has already redeemed this item at ${token.lastRedeemedAt ? new Date(token.lastRedeemedAt).toLocaleTimeString() : 'earlier'}.`
      };
    }

    // SUCCESSFUL REDEMPTION!
    soundEffects.playTokenRedeemed();
    const updatedRedeemedCount = token.redeemedCount + 1;
    const isFullyUsed = updatedRedeemedCount >= token.maxAllocated;

    const updatedTokens = pass.tokens.map(t => {
      if (t.tokenId === tokenId) {
        return {
          ...t,
          redeemedCount: updatedRedeemedCount,
          status: isFullyUsed ? ('Used' as const) : ('Available' as const),
          lastRedeemedAt: new Date().toISOString(),
          redeemedCounter: counterName
        };
      }
      return t;
    });

    const updatedPass: EventPass = {
      ...pass,
      tokens: updatedTokens
    };

    setPasses(prev => prev.map(p => p.id === pass.id ? updatedPass : p));

    const log: ScanLog = {
      id: `LOG-${Date.now()}`,
      passId: pass.id,
      studentName: pass.student.fullName,
      studentId: pass.student.studentId,
      eventId: pass.eventId,
      timestamp: new Date().toISOString(),
      scannerId,
      scannerRole: 'TOKEN_COUNTER',
      counterName,
      scanType: 'TOKEN',
      tokenId: token.tokenId,
      tokenName: token.tokenName,
      result: 'ACCEPTED',
      reason: `Successfully redeemed benefit: ${token.tokenName} (${updatedRedeemedCount}/${token.maxAllocated})`,
      isOfflineCached: isOfflineMode
    };

    setScanLogs(prev => [log, ...prev]);

    return {
      result: 'ACCEPTED',
      pass: updatedPass,
      message: `REDEEMED: ${token.tokenName.toUpperCase()}`,
      reason: `Issue physical benefit to ${pass.student.fullName}. (${updatedRedeemedCount}/${token.maxAllocated})`
    };
  };

  // Event Creation & Updates
  const createEvent = (eventData: Omit<EventModel, 'id' | 'createdAt'>): string => {
    const id = `EVT-${eventData.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newEvent: EventModel = {
      ...eventData,
      id,
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    setCurrentEventId(id);
    return id;
  };

  const updateEvent = (event: EventModel) => {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  // Admin Controls
  const revokePass = (passId: string, reason: string) => {
    setPasses(prev => prev.map(p => p.id === passId ? { ...p, status: 'Revoked', revocationReason: reason } : p));
  };

  const reactivatePass = (passId: string) => {
    setPasses(prev => prev.map(p => p.id === passId ? { ...p, status: 'Active', revocationReason: undefined } : p));
  };

  const overrideEntry = (passId: string, reason: string, adminName: string) => {
    setPasses(prev => prev.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status: 'Used',
          entryCount: p.entryCount + 1,
          entryTimestamp: new Date().toISOString(),
          notes: `Manual Entry Override by Admin (${adminName}): ${reason}`
        };
      }
      return p;
    }));

    const pass = passes.find(p => p.id === passId);
    if (pass) {
      const log: ScanLog = {
        id: `LOG-OVERRIDE-${Date.now()}`,
        passId: pass.id,
        studentName: pass.student.fullName,
        studentId: pass.student.studentId,
        eventId: pass.eventId,
        timestamp: new Date().toISOString(),
        scannerId: 'ADMIN_OVERRIDE',
        scannerRole: 'ENTRY',
        counterName: 'Admin Control Center',
        scanType: 'ENTRY',
        result: 'ACCEPTED',
        reason: `ADMIN OVERRIDE by ${adminName}: ${reason}`
      };
      setScanLogs(prev => [log, ...prev]);
    }
  };

  const toggleBlacklist = (passId: string, isBlacklisted: boolean) => {
    setPasses(prev => prev.map(p => p.id === passId ? { ...p, isBlacklisted } : p));
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, resolved: true } : i));
  };

  const syncOfflineQueue = () => {
    setOfflineQueue([]);
    soundEffects.playSuccess();
  };

  // Live Traffic Simulation Burst (Simulates 10-50 check-ins + occasional fraud)
  const runLiveSimulationBurst = (count: number, includeDuplicateFraud: boolean) => {
    const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Ava', 'Lucas', 'Mia', 'Aiden', 'Isabella', 'Leo', 'Zoe', 'Julian', 'Chloe', 'Nathan', 'Maya'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
    const depts = ['Computer Science', 'Data Science', 'Electronics', 'Mechanical Eng', 'Information Tech'];

    const newPasses: EventPass[] = [];
    const newLogs: ScanLog[] = [];
    const newIncidents: SecurityIncident[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;
      const studentId = `STU-${Math.floor(10000 + Math.random() * 90000)}`;
      const department = depts[Math.floor(Math.random() * depts.length)];
      const passId = generatePassId();
      const isFraudAttempt = includeDuplicateFraud && (i === 3 || i === 8);

      const pass = createSeedPass(
        currentEventId,
        passId,
        fullName,
        studentId,
        department,
        `${fName.toLowerCase()}.${lName.toLowerCase()}@university.edu`,
        isFraudAttempt ? 'Used' : 'Used',
        currentEvent?.tokens || [],
        1
      );

      // Simulate token redemptions for random perks
      if (!isFraudAttempt) {
        pass.tokens = pass.tokens.map((t, idx) => {
          if (idx === 0 || Math.random() > 0.4) {
            return {
              ...t,
              redeemedCount: 1,
              status: 'Used',
              lastRedeemedAt: new Date(now - (count - i) * 60000).toISOString(),
              redeemedCounter: currentEvent?.tokens.find(tok => tok.id === t.tokenId)?.locationCounter || 'Station Counter'
            };
          }
          return t;
        });
      }

      newPasses.push(pass);

      // Log entry
      newLogs.push({
        id: `SIM-LOG-${now}-${i}`,
        passId: pass.id,
        studentName: fullName,
        studentId: studentId,
        eventId: currentEventId,
        timestamp: new Date(now - (count - i) * 45000).toISOString(),
        scannerId: i % 2 === 0 ? 'VOL-G01' : 'VOL-G02',
        scannerRole: 'ENTRY',
        counterName: i % 2 === 0 ? 'Main Gate Checkpoint #1' : 'VIP Fast Track Gate #2',
        scanType: 'ENTRY',
        result: isFraudAttempt ? 'REJECTED' : 'ACCEPTED',
        reason: isFraudAttempt ? 'DUPLICATE_SCAN: Pass previously recorded as entered' : 'Verified QR Checksum pass scan'
      });

      if (isFraudAttempt) {
        newIncidents.push({
          id: `INC-SIM-${now}-${i}`,
          passId: pass.id,
          studentName: fullName,
          studentId: studentId,
          eventId: currentEventId,
          timestamp: new Date(now - (count - i) * 45000).toISOString(),
          type: 'DUPLICATE_ENTRY',
          severity: 'HIGH',
          details: `Simulated duplicate badge scan attempt for ${fullName} at Gate #1`,
          scannerLocation: 'Main Gate Checkpoint #1',
          resolved: false
        });
      }
    }

    setPasses(prev => [...newPasses, ...prev]);
    setScanLogs(prev => [...newLogs, ...prev]);
    if (newIncidents.length > 0) {
      setIncidents(prev => [...newIncidents, ...prev]);
    }
  };

  const resetEventData = () => {
    localStorage.removeItem('agy_events_v2');
    localStorage.removeItem('agy_passes_v2');
    localStorage.removeItem('agy_scanlogs_v2');
    localStorage.removeItem('agy_incidents_v2');
    setEvents(SEED_EVENTS);
    setCurrentEventId('EVT-TECHFEST-2026');
    const defaultEvt = SEED_EVENTS[0];
    const initialPasses = [
      createSeedPass(defaultEvt.id, 'PASS-A9F2-2026', 'Alex Rivera', 'STU-10492', 'Computer Science', 'alex.rivera@university.edu', 'Active', defaultEvt.tokens),
      createSeedPass(defaultEvt.id, 'PASS-B7X4-2026', 'Sophia Chen', 'STU-10884', 'Data Science', 'sophia.chen@university.edu', 'Used', defaultEvt.tokens, 1),
      createSeedPass(defaultEvt.id, 'PASS-K3M9-2026', 'Marcus Vance', 'STU-11204', 'Electronics', 'marcus.vance@university.edu', 'Active', defaultEvt.tokens),
    ];
    setPasses(initialPasses);
    setCurrentPass(initialPasses[0]);
    setScanLogs([]);
    setIncidents([]);
  };

  return (
    <EventContext.Provider
      value={{
        persona,
        setPersona,
        events,
        currentEventId,
        setCurrentEventId,
        currentEvent,
        createEvent,
        updateEvent,
        passes,
        currentPass,
        setCurrentPass,
        registerStudent,
        issueEmergencyPass,
        revokePass,
        reactivatePass,
        overrideEntry,
        toggleBlacklist,
        verifyEntryScan,
        verifyTokenRedemption,
        scanLogs,
        incidents,
        volunteers,
        resolveIncident,
        isOfflineMode,
        setIsOfflineMode,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        selectedCounterTokenId,
        setSelectedCounterTokenId,
        runLiveSimulationBurst,
        resetEventData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

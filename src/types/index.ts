export type EventStatus = 'Open' | 'Closed' | 'Waitlist';
export type PassStatus = 'Active' | 'Used' | 'Expired' | 'Revoked';
export type TokenStatus = 'Available' | 'Used' | 'Expired' | 'Revoked';
export type ScanResult = 'ACCEPTED' | 'REJECTED' | 'SUSPICIOUS';
export type TokenType = 'food' | 'merchandise' | 'certificate' | 'vip' | 'custom';

export interface TokenConfig {
  id: string;
  name: string;
  type: TokenType;
  icon: string;
  maxRedemptions: number;
  locationCounter: string;
  description: string;
  validWindow?: string;
  perkValue?: number;
}

export interface EventModel {
  id: string;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  registrationDeadline: string;
  status: EventStatus;
  entryPolicy: 'single' | 'multi';
  allowedDepartments: string[];
  tokens: TokenConfig[];
  bannerGradient: string;
  organizer: string;
  createdAt: string;
}

export interface StudentRegistration {
  fullName: string;
  studentId: string;
  department: string;
  email: string;
  phone: string;
  specialRequirements?: string;
}

export interface StudentTokenAllocation {
  tokenId: string;
  tokenName: string;
  type: TokenType;
  maxAllocated: number;
  redeemedCount: number;
  status: TokenStatus;
  lastRedeemedAt?: string;
  redeemedCounter?: string;
}

export interface EventPass {
  id: string; // e.g. "PASS-X9A7-2026"
  eventId: string;
  student: StudentRegistration;
  qrPayload: string;
  qrSignature: string;
  status: PassStatus;
  createdAt: string;
  expiresAt: string;
  entryCount: number;
  entryTimestamp?: string;
  tokens: StudentTokenAllocation[];
  smsBackupCode: string;
  isBlacklisted?: boolean;
  revocationReason?: string;
  notes?: string;
}

export interface ScanLog {
  id: string;
  passId: string;
  studentName: string;
  studentId: string;
  eventId: string;
  timestamp: string;
  scannerId: string;
  scannerRole: 'ENTRY' | 'TOKEN_COUNTER';
  counterName: string;
  scanType: 'ENTRY' | 'TOKEN';
  tokenId?: string;
  tokenName?: string;
  result: ScanResult;
  reason?: string;
  isOfflineCached?: boolean;
}

export interface SecurityIncident {
  id: string;
  passId: string;
  studentName: string;
  studentId: string;
  eventId: string;
  timestamp: string;
  type: 'DUPLICATE_ENTRY' | 'ALREADY_REDEEMED' | 'EXPIRED_PASS' | 'WRONG_EVENT' | 'BLACKLISTED' | 'TAMPERED_CHECKSUM' | 'CAPACITY_BREACH';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
  scannerLocation: string;
  resolved: boolean;
}

export interface VolunteerStaff {
  id: string;
  name: string;
  role: 'ENTRY_SCANNER' | 'TOKEN_COUNTER';
  checkpointName: string;
  active: boolean;
  scansCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgScanTimeMs: number;
}

export type AppPersona = 
  | 'STUDENT_PORTAL' 
  | 'ORGANIZER_STUDIO' 
  | 'ENTRY_SCANNER' 
  | 'TOKEN_COUNTER' 
  | 'ADMIN_COMMAND' 
  | 'ANALYTICS_REPORTS';

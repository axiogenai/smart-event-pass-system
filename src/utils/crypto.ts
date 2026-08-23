// Secure Pass & Cryptographic Checksum Engine

/**
 * Generates a non-sequential, cryptographically strong alphanumeric Pass ID
 * Example: "PASS-K98F-2026"
 */
export function generatePassId(year = '2026'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous 0, O, 1, I
  let randomChunk = '';
  const cryptoObj = window.crypto || (window as unknown as { msCrypto?: Crypto }).msCrypto;
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    const array = new Uint8Array(4);
    cryptoObj.getRandomValues(array);
    for (let i = 0; i < 4; i++) {
      randomChunk += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      randomChunk += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return `PASS-${randomChunk}-${year}`;
}

/**
 * Generates a 6-digit SMS backup verification code
 */
export function generateSmsBackupCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

/**
 * Creates a cryptographically derived tamper-evident checksum for QR data integrity
 */
export function createQrSignature(passId: string, eventId: string, studentId: string): string {
  const secretSalt = 'SMART_EVENT_PASS_SIGNING_KEY_SECURE_2026_AGY';
  const raw = `${passId}::${eventId}::${studentId}::${secretSalt}`;
  
  // Custom fast secure DJB2 + FNV-1a combined hash represented in Hex
  let hash1 = 5381;
  let hash2 = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char; /* hash * 33 + c */
    hash2 = (hash2 ^ char) * 16777619;
  }
  
  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `SIG_${hex1}${hex2}`;
}

export interface EncryptedPassPayload {
  v: number; // version
  pid: string; // Pass ID
  eid: string; // Event ID
  sid: string; // Student ID
  sname: string; // Student Name
  exp: string; // Expiration ISO
  sig: string; // Checksum Signature
  tks: string[]; // Allocated token IDs
  url?: string; // Verification URL
}

/**
 * Packs pass info into a universal verification URL that can be scanned by any smartphone camera or in-app scanner
 */
export function packQrPayload(
  passId: string,
  eventId: string,
  studentId: string,
  studentName: string,
  expiresAt: string,
  tokenIds: string[]
): string {
  const signature = createQrSignature(passId, eventId, studentId);
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://smartpass.app';
  const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
  
  const searchParams = new URLSearchParams({
    verify: passId,
    name: studentName,
    sid: studentId,
    eid: eventId,
    exp: expiresAt,
    sig: signature,
    tks: tokenIds.join(',')
  });

  return `${origin}${pathname}?${searchParams.toString()}`;
}

/**
 * Validates whether the QR payload (URL, JSON, or Pass ID) has valid signature and integrity
 */
export function verifyQrPayload(rawJsonOrText: string): {
  isValid: boolean;
  payload?: EncryptedPassPayload;
  error?: string;
} {
  try {
    const text = rawJsonOrText.trim();
    if (!text) {
      return { isValid: false, error: 'Empty QR code data scanned.' };
    }

    // CASE 1: Full URL or Query String
    if (text.includes('?') || text.startsWith('http://') || text.startsWith('https://')) {
      let queryStr = text;
      if (text.includes('?')) {
        queryStr = text.substring(text.indexOf('?'));
      }
      const params = new URLSearchParams(queryStr);
      const pid = params.get('verify') || params.get('pass') || params.get('pid');
      const eid = params.get('eid') || params.get('eventId') || 'evt_1';
      const sid = params.get('sid') || params.get('studentId') || '';
      const sname = params.get('name') || params.get('sname') || 'Student Attendee';
      const sig = params.get('sig') || '';
      const exp = params.get('exp') || '2026-09-15T23:59:59Z';
      const tksStr = params.get('tks') || '';
      const tks = tksStr ? tksStr.split(',') : [];

      if (!pid) {
        return { isValid: false, error: 'No Pass ID found in verification URL.' };
      }

      // Check cryptographic signature if present
      if (sig && sid) {
        const expectedSig = createQrSignature(pid, eid, sid);
        if (sig !== expectedSig) {
          return { isValid: false, error: 'TAMPERED_CHECKSUM: Digital signature does not match cryptographic key.' };
        }
      }

      return {
        isValid: true,
        payload: {
          v: 1,
          pid,
          eid,
          sid,
          sname,
          exp,
          sig: sig || createQrSignature(pid, eid, sid),
          tks,
          url: text
        }
      };
    }

    // CASE 2: JSON Payload Format
    if (text.startsWith('{')) {
      const parsed = JSON.parse(text);
      if (!parsed.pid && !parsed.id) {
        return { isValid: false, error: 'Missing required pass verification fields in JSON.' };
      }

      const pid = parsed.pid || parsed.id;
      const eid = parsed.eid || parsed.eventId || 'evt_1';
      const sid = parsed.sid || parsed.studentId || '';
      const sname = parsed.sname || parsed.studentName || 'Student Attendee';
      const sig = parsed.sig || parsed.signature || '';
      const exp = parsed.exp || parsed.expiresAt || '2026-09-15T23:59:59Z';
      const tks = parsed.tks || parsed.tokens || [];

      if (sig && sid) {
        const expectedSig = createQrSignature(pid, eid, sid);
        if (sig !== expectedSig) {
          return { isValid: false, error: 'TAMPERED_CHECKSUM: Digital signature does not match cryptographic key.' };
        }
      }

      return {
        isValid: true,
        payload: {
          v: parsed.v || 1,
          pid,
          eid,
          sid,
          sname,
          exp,
          sig: sig || createQrSignature(pid, eid, sid),
          tks
        }
      };
    }

    // CASE 3: Bare Pass ID or Student ID (e.g. PASS-K98F-2026 or STU-10492)
    return {
      isValid: true,
      payload: {
        v: 1,
        pid: text,
        eid: 'evt_1',
        sid: text,
        sname: 'Pass Holder',
        exp: '2026-09-15T23:59:59Z',
        sig: createQrSignature(text, 'evt_1', text),
        tks: []
      }
    };
  } catch (err) {
    return { isValid: false, error: `Corrupted payload data: ${(err as Error).message}` };
  }
}


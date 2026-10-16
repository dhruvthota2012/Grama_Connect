import { TractorService } from '../types';

export const KIOSK_TIMEZONE = 'Asia/Kolkata';
const STORAGE_KEY_TRACTORS = 'gramaconnect_persisted_tractors';

/**
 * Returns today's ISO date string (YYYY-MM-DD) in the Kiosk's local timezone (Asia/Kolkata).
 */
export function getKioskTodayDateString(customDate?: Date): string {
  const d = customDate || new Date();
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: KIOSK_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch (e) {
    // Fallback if Intl timeZone is not supported
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Checks whether a tractor is active for the specified date (defaults to today in Asia/Kolkata).
 * A tractor is considered available only after its registered driver activates it for the current day.
 * Automatically expires if activeDate does not match the current day.
 */
export function isTractorActiveForDate(tractor: TractorService, targetDateStr?: string): boolean {
  const todayStr = targetDateStr || getKioskTodayDateString();
  if (!tractor.isActiveToday) {
    return false;
  }
  // Activation MUST match the current day in local timezone; past days expire automatically
  return tractor.activeDate === todayStr;
}

/**
 * Activates a registered tractor for today with exactly ONE current attachment.
 */
export function activateTractorForToday(
  tractor: TractorService,
  currentAttachmentId: string,
  todayStr?: string
): TractorService {
  const dateStr = todayStr || getKioskTodayDateString();
  const ownedAttachments = Array.from(
    new Set([...(tractor.attachments || []), currentAttachmentId])
  );

  return {
    ...tractor,
    isActiveToday: true,
    activeDate: dateStr,
    currentAttachment: currentAttachmentId,
    attachments: ownedAttachments,
    availability: 'IMMEDIATE',
  };
}

/**
 * Deactivates a registered tractor for the day (e.g., driver stops working).
 * Does not delete the tractor registration.
 */
export function deactivateTractor(tractor: TractorService): TractorService {
  return {
    ...tractor,
    isActiveToday: false,
    availability: 'UNKNOWN',
  };
}

/**
 * Changes a tractor's current working attachment.
 * Enforces the rule: Only ONE attachment can be active on a tractor at any given time.
 * The old attachment is immediately removed from current work.
 */
export function changeTractorAttachment(
  tractor: TractorService,
  newAttachmentId: string
): TractorService {
  const ownedAttachments = Array.from(
    new Set([...(tractor.attachments || []), newAttachmentId])
  );

  return {
    ...tractor,
    currentAttachment: newAttachmentId,
    attachments: ownedAttachments,
  };
}

/**
 * Normalizes an array of tractors:
 * Automatically expires any activations from previous days.
 */
export function cleanTractorsDailyActivation(
  tractors: TractorService[],
  currentDateStr?: string
): TractorService[] {
  const todayStr = currentDateStr || getKioskTodayDateString();
  return tractors.map((tr) => {
    if (tr.isActiveToday && tr.activeDate !== todayStr) {
      return {
        ...tr,
        isActiveToday: false,
        availability: 'UNKNOWN',
      };
    }
    return tr;
  });
}

/**
 * Loads tractors from localStorage, expiring previous day activations.
 */
export function loadTractorsFromStorage(fallbackTractors: TractorService[]): TractorService[] {
  const storage =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : typeof localStorage !== 'undefined'
      ? localStorage
      : null;

  if (!storage) {
    return cleanTractorsDailyActivation(fallbackTractors);
  }

  try {
    const raw = storage.getItem(STORAGE_KEY_TRACTORS);
    if (!raw) {
      return cleanTractorsDailyActivation(fallbackTractors);
    }
    const parsed = JSON.parse(raw) as TractorService[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return cleanTractorsDailyActivation(parsed);
    }
  } catch (e) {
    console.warn('Failed to parse tractors from localStorage:', e);
  }

  return cleanTractorsDailyActivation(fallbackTractors);
}

/**
 * Persists tractors to localStorage.
 */
export function saveTractorsToStorage(tractors: TractorService[]): void {
  const storage =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : typeof localStorage !== 'undefined'
      ? localStorage
      : null;

  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY_TRACTORS, JSON.stringify(tractors));
  } catch (e) {
    console.warn('Failed to save tractors to localStorage:', e);
  }
}

/**
 * Strips extraneous parenthesized machine/vehicle annotations from person name for clean display & compact printing.
 * e.g. "B. Srinivasa Rao (Mahindra 575 DI)" -> "B. Srinivasa Rao"
 */
export function formatCleanPersonName(name?: string): string {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Extracts and sanitizes clean 10-digit Indian mobile number for compact printing.
 * e.g. "98480-11901 (Demo)" -> "9848011901", "+91 98480 12345" -> "9848012345"
 */
export function formatCleanMobile(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return phone.replace(/\s*\(Demo\)\s*/i, '').trim();
}


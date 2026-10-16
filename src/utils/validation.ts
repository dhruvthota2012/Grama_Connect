/**
 * Validation utilities for GramaConnect registration.
 * Ensures mandatory full name and valid 10-digit Indian mobile numbers.
 */

export type LanguageCode = 'en' | 'te' | 'hi';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorMessageEn?: string;
  errorMessageTe?: string;
  errorMessageHi?: string;
}

/**
 * Validates mandatory full name.
 */
export function validateFullName(name?: string, language?: LanguageCode): ValidationResult {
  if (!name || name.trim().length === 0) {
    const en = 'Full name is mandatory. Please enter your name.';
    const te = 'పూర్తి పేరు తప్పనిసరి. దయచేసి మీ పేరును నమోదు చేయండి.';
    const hi = 'पूरा नाम अनिवार्य है। कृपया अपना नाम दर्ज करें।';
    const activeMsg = language === 'te' ? te : language === 'hi' ? hi : en;
    return {
      isValid: false,
      errorMessage: activeMsg,
      errorMessageEn: en,
      errorMessageTe: te,
      errorMessageHi: hi,
    };
  }

  if (name.trim().length < 2) {
    const en = 'Name is too short. Please enter a valid name.';
    const te = 'పేరు చాలా చిన్నదిగా ఉంది. దయచేసి సరైన పేరును నమోదు చేయండి.';
    const hi = 'नाम बहुत छोटा है। कृपया वैध नाम दर्ज करें।';
    const activeMsg = language === 'te' ? te : language === 'hi' ? hi : en;
    return {
      isValid: false,
      errorMessage: activeMsg,
      errorMessageEn: en,
      errorMessageTe: te,
      errorMessageHi: hi,
    };
  }

  return { isValid: true };
}

/**
 * Validates Indian 10-digit mobile number format (starts with 6, 7, 8, or 9).
 * Accepts optional +91, spaces, and hyphens.
 */
export function validateIndianMobile(
  phone?: string,
  language?: LanguageCode
): ValidationResult & { normalizedNumber?: string; cleanMobile?: string } {
  if (!phone || phone.trim().length === 0) {
    const en = 'Mobile number is mandatory. Please enter your mobile number.';
    const te = 'మొబైల్ నంబర్ తప్పనిసరి. దయచేసి మీ మొబైల్ నంబర్‌ను నమోదు చేయండి.';
    const hi = 'मोबाइल नंबर अनिवार्य है। कृपया अपना मोबाइल नंबर दर्ज करें।';
    const activeMsg = language === 'te' ? te : language === 'hi' ? hi : en;
    return {
      isValid: false,
      errorMessage: activeMsg,
      errorMessageEn: en,
      errorMessageTe: te,
      errorMessageHi: hi,
    };
  }

  // Strip non-digit characters except leading plus
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  let num = clean;

  if (num.startsWith('+91')) {
    num = num.slice(3);
  } else if (num.startsWith('91') && num.length === 12) {
    num = num.slice(2);
  } else if (num.startsWith('0') && num.length === 11) {
    num = num.slice(1);
  }

  const isValidFormat = /^[6-9]\d{9}$/.test(num);
  if (!isValidFormat) {
    const en = 'Please enter a valid 10-digit Indian mobile number (e.g., 9848012345).';
    const te = 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి (ఉదా: 9848012345).';
    const hi = 'कृपया 10-अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (उदा: 9848012345)।';
    const activeMsg = language === 'te' ? te : language === 'hi' ? hi : en;
    return {
      isValid: false,
      errorMessage: activeMsg,
      errorMessageEn: en,
      errorMessageTe: te,
      errorMessageHi: hi,
    };
  }

  return { isValid: true, normalizedNumber: num, cleanMobile: num };
}

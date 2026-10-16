import { Language } from '../types';

export function generateReferenceNumber(prefix: 'REQ' | 'WRK' | 'MCH' = 'REQ'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GC-${prefix}-${year}-${random}`;
}

export function formatDateTime(date: Date = new Date(), lang: Language = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  const locale = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
  return date.toLocaleString(locale, options);
}

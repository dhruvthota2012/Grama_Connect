/**
 * API Configuration for GramaConnect
 *
 * Supports VITE_API_URL environment variable for external backends,
 * falling back to relative paths ('/api/...') for same-origin Vercel deployments.
 */

const rawBaseUrl = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_API_URL
  : '';

export const API_BASE_URL: string =
  typeof rawBaseUrl === 'string' && rawBaseUrl.trim() !== ''
    ? rawBaseUrl.trim().replace(/\/+$/, '')
    : '';

/**
 * Returns a fully-qualified or relative API URL based on VITE_API_URL.
 *
 * Examples:
 * - If VITE_API_URL is unset: getApiUrl('/api/auth/send-otp') -> '/api/auth/send-otp'
 * - If VITE_API_URL is 'https://api.example.com': getApiUrl('/api/auth/send-otp') -> 'https://api.example.com/api/auth/send-otp'
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

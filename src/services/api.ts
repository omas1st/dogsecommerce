const API_BASE = '/api';

// In-memory session and authentication state (no browser/phone storage used)
let inMemoryGuestId: string = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
let inMemoryAuthToken: string | null = null;

export function getGuestSessionId(): string {
  return inMemoryGuestId;
}

export function setInMemoryAuthToken(token: string | null): void {
  inMemoryAuthToken = token;
}

export function getInMemoryAuthToken(): string | null {
  return inMemoryAuthToken;
}

/**
 * Safely extracts a user-readable error message string from any type of error,
 * preventing "[object Object]" from ever appearing on the screen.
 */
export function extractErrorMessage(err: any, fallback = 'Authentication failed. Please check your credentials.'): string {
  if (!err) return fallback;

  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.includes('[object Object]')) {
      return fallback;
    }
    return trimmed;
  }

  // Handle standard Error instances or objects with a message
  if (typeof err.message === 'string') {
    const trimmed = err.message.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.includes('[object Object]')) {
      return fallback;
    }
    return trimmed;
  }

  // Handle { error: "..." } or { error: { message: "..." } }
  if (typeof err.error === 'string') {
    const trimmed = err.error.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed.includes('[object Object]')) {
      return fallback;
    }
    return trimmed;
  }
  if (err.error && typeof err.error === 'object') {
    if (typeof err.error.message === 'string') return err.error.message.trim();
    if (typeof err.error.error === 'string') return err.error.error.trim();
  }

  // Handle { msg: "..." }
  if (typeof err.msg === 'string') {
    return err.msg.trim();
  }

  // Handle { details: "..." }
  if (typeof err.details === 'string') {
    return err.details.trim();
  }

  try {
    const serialized = JSON.stringify(err);
    if (serialized && serialized !== '{}' && !serialized.includes('[object Object]')) {
      return serialized;
    }
  } catch {
    // ignore serialization failure
  }

  return fallback;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = inMemoryAuthToken;
  const guestId = getGuestSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-guest-session-id': guestId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prevent double '/api' prefixing and ensure leading slash
  let cleanEndpoint = endpoint.trim();
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '/';
  } else if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${cleanEndpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Network connection failed. Please check your internet or deployment status.');
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { success: false, error: `Invalid response format from server (${response.status})` };
    }
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned error (${response.status}). Please try again.`);
      }
      data = { success: false, error: `Service endpoint unavailable (${response.status}). Check backend deployment.` };
    }
  }

  if (!response.ok || data?.success === false) {
    const errorMsg = extractErrorMessage(
      data?.error || data?.message || data,
      `Request failed with status ${response.status}`
    );
    throw new Error(errorMsg);
  }

  return data;
}

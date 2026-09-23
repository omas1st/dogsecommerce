const API_BASE = '/api';

export function getGuestSessionId(): string {
  let guestId = localStorage.getItem('hound_guest_session_id');
  if (!guestId) {
    guestId = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('hound_guest_session_id', guestId);
  }
  return guestId;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('hound_auth_token');
  const guestId = getGuestSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-guest-session-id': guestId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { success: false, error: `Invalid JSON response from server (${response.status})` };
    }
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server returned error ${response.status}`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: 'Endpoint returned non-JSON response.' };
    }
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

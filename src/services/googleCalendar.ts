import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Activity } from '../types/agenda';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleCalendar = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Calendar');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Calendar Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

/**
 * Fetches events from primary Google Calendar for the specified timeframe
 */
export async function fetchGoogleCalendarEvents(
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const token = await getGoogleAccessToken();
  if (!token) {
    throw new Error('No autenticado con Google Calendar');
  }

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });

  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error en Google Calendar (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Pushes a local activity to Google Calendar as a new event
 */
export async function createGoogleCalendarEvent(activity: Activity): Promise<string> {
  const token = await getGoogleAccessToken();
  if (!token) {
    throw new Error('No autenticado con Google Calendar');
  }

  const startTimeStr = activity.startTime ? `${activity.date}T${activity.startTime}:00` : undefined;
  const endTimeStr = activity.endTime
    ? `${activity.date}T${activity.endTime}:00`
    : activity.startTime
    ? `${activity.date}T${activity.startTime}:00`
    : undefined;

  const eventPayload: any = {
    summary: activity.title,
    description: activity.description || `Creado desde Chronos Agenda [Prioridad: ${activity.priority}]`,
  };

  if (startTimeStr && endTimeStr) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    eventPayload.start = { dateTime: new Date(startTimeStr).toISOString(), timeZone };
    eventPayload.end = { dateTime: new Date(endTimeStr).toISOString(), timeZone };
  } else {
    // All day event
    eventPayload.start = { date: activity.date };
    eventPayload.end = { date: activity.date };
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al crear evento en Google Calendar: ${error}`);
  }

  const created = await res.json();
  return created.id;
}

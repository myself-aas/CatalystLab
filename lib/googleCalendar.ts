import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let cachedCalendarToken: string | null = null;

// Track if current user logs out or changes to safely clear the cached Google Calendar token
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedCalendarToken = null;
  }
});

/**
 * Ensures we have a valid Google access token with Calendar scope.
 */
export async function getGoogleCalendarToken(): Promise<string> {
  if (cachedCalendarToken) {
    return cachedCalendarToken;
  }

  const provider = new GoogleAuthProvider();
  // Request Calendar scope
  provider.addScope('https://www.googleapis.com/auth/calendar');

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (!credential?.accessToken) {
    throw new Error('Calendar authorization was successful, but no access token was returned.');
  }

  cachedCalendarToken = credential.accessToken;
  return cachedCalendarToken;
}

/**
 * Creates a scheduled event in the user's primary Google Calendar.
 */
export async function scheduleResearchSession(
  title: string,
  startTime: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  
  onProgress?.('Authorizing with Google Calendar...');
  const accessToken = await getGoogleCalendarToken();

  onProgress?.('Scheduling event in Google Calendar...');
  
  // Calculate end time (session default: 60 mins)
  const start = new Date(startTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `Research Session: ${title}`,
    description: 'Academic synthesis and study session scheduled via CatalystLab.',
    start: {
      dateTime: start.toISOString(),
    },
    end: {
      dateTime: end.toISOString(),
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to schedule Calendar event: ${errorData}`);
  }

  const eventData = await response.json();
  return eventData.htmlLink; // Return direct link to the event
}

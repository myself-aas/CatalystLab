import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let cachedTasksToken: string | null = null;

// Track if current user logs out or changes to safely clear the cached Google Tasks token
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedTasksToken = null;
  }
});

/**
 * Ensures we have a valid Google access token with Tasks scope.
 */
export async function getGoogleTasksToken(): Promise<string> {
  if (cachedTasksToken) {
    return cachedTasksToken;
  }

  const provider = new GoogleAuthProvider();
  // Request Tasks scope
  provider.addScope('https://www.googleapis.com/auth/tasks');

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (!credential?.accessToken) {
    throw new Error('Tasks authorization was successful, but no access token was returned.');
  }

  cachedTasksToken = credential.accessToken;
  return cachedTasksToken;
}

/**
 * Creates a task in the user's default Google Task list.
 */
export async function addTask(
  title: string,
  notes: string,
  onProgress?: (msg: string) => void
): Promise<string> {
  
  onProgress?.('Authorizing with Google Tasks...');
  const accessToken = await getGoogleTasksToken();

  onProgress?.('Creating task in Google Tasks...');
  
  const task = {
    title: title,
    notes: notes,
  };

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create task: ${errorData}`);
  }

  const taskData = await response.json();
  return taskData.id; // Return the task ID
}

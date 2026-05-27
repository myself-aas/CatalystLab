import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let cachedDocToken: string | null = null;

// Track if current user logs out or changes to safely clear the cached Google Docs token
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedDocToken = null;
  }
});

/**
 * Ensures we have a valid Google access token with the Documents write scope.
 * Uses incremental consent via Firebase Auth popup if the token is not cached.
 */
export async function getGoogleDocsToken(): Promise<string> {
  if (cachedDocToken) {
    return cachedDocToken;
  }

  const provider = new GoogleAuthProvider();
  // Request read/write access to Google Docs
  provider.addScope('https://www.googleapis.com/auth/documents');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Google Docs authorization was successful, but no access token was returned.');
    }

    cachedDocToken = credential.accessToken;
    return cachedDocToken;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user') || error?.code === 'auth/cancelled-popup-request') {
      throw new Error('The Google Docs authorization popup was closed before completion. Please allow popups and complete the authorization process.');
    }
    throw error;
  }
}

/**
 * Creates a structured, beautiful synthesis report in Google Docs.
 * Returns the URL of the newly created document.
 */
export async function exportToGoogleDoc(result: any, instrumentName: string): Promise<string> {
  if (!result) {
    throw new Error('No synthesis result found to export.');
  }

  // 1. Get access token (will show popup if not cached)
  const accessToken = await getGoogleDocsToken();

  // 2. Prepare visual document content
  const now = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let docText = '';
  docText += `========================================================================\n`;
  docText += `                  CATALYSTLAB ACADEMIC RESEARCH HUB\n`;
  docText += `                     SYNTHESIS & REPORT DOSSIER\n`;
  docText += `========================================================================\n\n`;

  docText += `INSTRUMENT USED   : ${instrumentName.toUpperCase()}\n`;
  docText += `GENERATION DATE   : ${now}\n`;
  docText += `NOVELTY SCORE     : ${result.noveltyScore ?? 'N/A'} / 100\n`;
  docText += `DISCIPLINE FOCUS  : ${result.speciality ?? 'General Study'}\n\n`;

  docText += `------------------------------------------------------------------------\n`;
  docText += `1. EXECUTIVE TL;DR\n`;
  docText += `------------------------------------------------------------------------\n`;
  docText += `${result.tldr ?? 'No executive summary available.'}\n\n`;

  docText += `------------------------------------------------------------------------\n`;
  docText += `2. LITERATURE SYNTHESIS ARTICLE\n`;
  docText += `------------------------------------------------------------------------\n`;
  docText += `${result.synthesis ?? 'No synthesis content available.'}\n\n`;

  if (result.papers && result.papers.length > 0) {
    docText += `------------------------------------------------------------------------\n`;
    docText += `3. DISCOVERED LITERATURE & REFERENCE MAPPING\n`;
    docText += `------------------------------------------------------------------------\n`;
    result.papers.forEach((paper: any, idx: number) => {
      docText += `[${idx + 1}] ${paper.title ?? 'Untitled Paper'}\n`;
      docText += `    Authors   : ${paper.authors ?? 'Unknown Authors'}\n`;
      docText += `    Timeline  : Year ${paper.year ?? 'N/A'} | Source: ${paper.source ?? 'Unknown'}\n`;
      if (paper.citationCount) {
        docText += `    Citations : ${paper.citationCount}\n`;
      }
      if (paper.url) {
        docText += `    Resource  : ${paper.url}\n`;
      }
      docText += `\n`;
    });
  }

  docText += `========================================================================\n`;
  docText += `                © CatalystLab Academic Research Hub\n`;
  docText += `========================================================================\n`;

  // 3. Create a clean new Google Document
  const documentTitle = `CatalystLab Synthesis - ${instrumentName}`;
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: documentTitle,
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Doc: ${errText}`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 4. Update Document payload in a single, robust batch operation
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: docText,
            endOfSegmentLocation: {},
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to populate Google Doc with synthesis text: ${errText}`);
  }

  return `https://docs.google.com/document/d/${documentId}/edit`;
}

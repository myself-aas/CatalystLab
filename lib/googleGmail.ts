import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let cachedGmailToken: string | null = null;

// Track if current user logs out or changes to safely clear the cached Google Gmail token
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGmailToken = null;
  }
});

/**
 * Encodes a string containing Unicode/UTF-8 characters safely to base64.
 * This runs natively in any standard browser or server environment without relying on Node's 'Buffer'.
 */
function encodeUtf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

/**
 * Ensures we have a valid Google access token with Gmail scope.
 * Uses incremental consent via Firebase Auth popup if the token is not cached.
 */
export async function getGoogleGmailToken(): Promise<string> {
  if (cachedGmailToken) {
    return cachedGmailToken;
  }

  const provider = new GoogleAuthProvider();
  // Request Gmail send or general Gmail scope
  provider.addScope('https://www.googleapis.com/auth/gmail');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Gmail authorization was successful, but no access token was returned.');
    }

    cachedGmailToken = credential.accessToken;
    return cachedGmailToken;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user') || error?.code === 'auth/cancelled-popup-request') {
      throw new Error('The Gmail authorization popup was closed before completion. Please allow popups and complete the authorization process.');
    }
    throw error;
  }
}

/**
 * Sends a synthesis report or academic findings to a peer via Gmail API.
 * Uses MIME standard format and base64url encoding.
 */
export async function sendSynthesisEmail(
  recipientEmail: string,
  result: any,
  instrumentName: string
): Promise<boolean> {
  if (!recipientEmail || !recipientEmail.trim()) {
    throw new Error('A recipient email address is required to dispatch the synthesis report.');
  }
  if (!result) {
    throw new Error('No synthesis report data found to email.');
  }

  // 1. Get Google OAuth access token
  const accessToken = await getGoogleGmailToken();

  // 2. Build beautiful academic HTML email body
  const title = result.title || instrumentName;
  const noveltyScore = result.noveltyScore ?? 'N/A';
  const speciality = result.speciality ?? 'General Study';
  const tldr = result.tldr || 'No executive summary provided.';
  const synthesisMarkdown = result.synthesis || '';

  // Generate simple/clean HTML formatting for the markdown for better email compatibility
  const reportBodyHtml = synthesisMarkdown
    .split('\n\n')
    .map((para: string) => {
      if (para.startsWith('###')) {
        return `<h3 style="color: #2E6F40; margin-top: 18px; margin-bottom: 8px; font-family: sans-serif;">${para.replace('###', '').trim()}</h3>`;
      }
      if (para.startsWith('##')) {
        return `<h2 style="color: #253D2C; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; font-family: sans-serif;">${para.replace('##', '').trim()}</h2>`;
      }
      if (para.startsWith('#')) {
        return `<h1 style="color: #253D2C; margin-top: 24px; margin-bottom: 16px; font-family: sans-serif;">${para.replace('#', '').trim()}</h1>`;
      }
      if (para.startsWith('-') || para.startsWith('*')) {
        const items = para.split('\n').map(item => `<li style="margin-bottom: 4px; line-height: 1.5;">${item.replace(/^[-*]\s+/, '')}</li>`).join('');
        return `<ul style="padding-left: 20px; font-family: sans-serif; color: #374151;">${items}</ul>`;
      }
      return `<p style="line-height: 1.6; margin-bottom: 12px; font-family: sans-serif; color: #374151;">${para}</p>`;
    })
    .join('');

  const nowString = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailHtml = `
    <div style="background-color: #F9FAFB; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        
        <!-- Header Banner -->
        <div style="background-color: #2E6F40; padding: 24px 32px; color: #ffffff;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: bold; opacity: 0.85;">CatalystLab Academic Research Hub</p>
          <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 700;">Synthesis Report Distributed</h1>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px;">
          <p style="margin-top: 0; color: #4B5563; font-size: 14px;">Greetings,</p>
          <p style="color: #4B5563; font-size: 14px; line-height: 1.5;">An academic research synthesis has been compiled and is being securely shared with you via email.</p>
          
          <!-- Report Metadata Box -->
          <div style="background-color: #F3F4F6; border-left: 4px solid #68BA7F; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="font-weight: bold; color: #374151; padding: 4px 0; width: 35%;">Research Instrument:</td>
                <td style="color: #4B5563; padding: 4px 0;">${title.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151; padding: 4px 0;">Discipline Speciality:</td>
                <td style="color: #4B5563; padding: 4px 0;">${speciality}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151; padding: 4px 0;">Novelty Evaluation:</td>
                <td style="color: #2E6F40; font-weight: bold; padding: 4px 0;">${noveltyScore} / 100</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #374151; padding: 4px 0;">Generation Timestamp:</td>
                <td style="color: #4B5563; padding: 4px 0;">${nowString}</td>
              </tr>
            </table>
          </div>

          <!-- TL;DR (Executive Summary) -->
          <h2 style="color: #253D2C; font-size: 16px; font-weight: bold; margin-top: 28px; margin-bottom: 8px;">Executive Summary (TL;DR)</h2>
          <div style="font-style: italic; color: #4B5563; border-left: 3px dashed #CBD5E1; padding-left: 12px; margin-bottom: 24px; font-size: 13.5px; line-height: 1.5;">
            "${tldr}"
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 24px 0;" />

          <!-- Full Synthesis -->
          <h2 style="color: #253D2C; font-size: 16px; font-weight: bold; margin-bottom: 12px;">Synthesized Academic Literature Report</h2>
          <div style="font-size: 13px; color: #374151;">
            ${reportBodyHtml}
          </div>

          <!-- Document References Footer -->
          ${result.papers && result.papers.length > 0 ? `
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <h2 style="color: #253D2C; font-size: 15px; font-weight: bold; margin-bottom: 12px;">Bibliography & Discovered References</h2>
            <ol style="padding-left: 20px; font-size: 12px; color: #4B5563; line-height: 1.6;">
              ${result.papers.map((p: any) => `
                <li style="margin-bottom: 6px;">
                  <strong>${p.title || 'Untitled'}</strong><br/>
                  <span style="color: #6B7280;">Authors: ${p.authors || 'Unknown'} | Year: ${p.year || 'N/A'}</span>
                  ${p.url ? `<br/><a href="${p.url}" target="_blank" style="color: #2E6F40; text-decoration: underline;">Access Source Link Page</a>` : ''}
                </li>
              `).join('')}
            </ol>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 16px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 11px; color: #9CA3AF;">This report was electronically generated and delivered via CatalystLab Academic Peer system.</p>
        </div>

      </div>
    </div>
  `;

  // 3. Compose standard MIME formatted email contents
  const utf8Subject = `=?utf-8?B?${encodeUtf8ToBase64(`Academic Research Hub Synthesis: ${title}`)}?=`;
  const emailLines = [
    `To: ${recipientEmail.trim()}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    encodeUtf8ToBase64(emailHtml)
  ];

  const rawMime = emailLines.join('\r\n');

  // Convert to URL-safe standard base64 string
  const encodedRaw = encodeUtf8ToBase64(rawMime)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // 4. Request the Gmail send endpoint
  const sendRes = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedRaw,
    }),
  });

  if (!sendRes.ok) {
    const errorText = await sendRes.text();
    throw new Error(`Gmail API execution failed to send message: ${errorText}`);
  }

  return true;
}

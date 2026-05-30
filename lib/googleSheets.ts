import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

let cachedSheetsToken: string | null = null;

// Track if current user logs out or changes to safely clear the cached Google Sheets token
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedSheetsToken = null;
  }
});

/**
 * Ensures we have a valid Google access token with the Spreadsheets write scope.
 * Uses incremental consent via Firebase Auth popup if the token is not cached.
 */
export async function getGoogleSheetsToken(): Promise<string> {
  if (cachedSheetsToken) {
    return cachedSheetsToken;
  }

  const provider = new GoogleAuthProvider();
  // Request read/write access to Google Sheets
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Google Sheets authorization was successful, but no access token was returned.');
    }

    cachedSheetsToken = credential.accessToken;
    return cachedSheetsToken;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup-closed-by-user') || error?.code === 'auth/cancelled-popup-request') {
      throw new Error('The Google Sheets authorization popup was closed before completion. Please allow popups and complete the authorization process.');
    }
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      throw new Error('This domain is not authorized for OAuth operations. Please add it to the Authorized Domains in the Firebase Console.');
    }
    throw error;
  }
}

/**
 * Creates a structured, beautiful database sheet in Google Sheets from reference papers.
 * Returns the URL of the newly created spreadsheet.
 */
export async function exportToGoogleSheet(result: any, instrumentName: string): Promise<string> {
  if (!result || !result.papers || result.papers.length === 0) {
    throw new Error('No discovered academic publications found to export to Google Sheets.');
  }

  // 1. Get access token (will show popup if not cached)
  const accessToken = await getGoogleSheetsToken();

  // 2. Prepare visual table grid
  const now = new Date().toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const rowValues: any[][] = [
    ['CATALYSTLAB ACADEMIC RESEARCH HUB — REFERENCE DATABASE'],
    [`INSTRUMENT USED: ${instrumentName.toUpperCase()}`, '', '', `GENERATED DATE: ${now}`],
    [`NOVELTY SCORE: ${result.noveltyScore ?? 'N/A'} / 100`, '', '', `DISCIPLINE FOCUS: ${result.speciality ?? 'General Study'}`],
    [], // Blank spacing row
    ['No.', 'Publication Name', 'Author(s)', 'Year', 'Publisher / Source', 'Citations Count', 'Resource Resource Link / DOI URL']
  ];

  result.papers.forEach((paper: any, idx: number) => {
    rowValues.push([
      idx + 1,
      paper.title ?? 'Untitled Paper',
      paper.authors ?? 'Unknown Authors',
      paper.year ?? 'N/A',
      paper.source ?? 'Unknown Source',
      paper.citationCount ?? 0,
      paper.url ?? 'N/A'
    ]);
  });

  // 3. Create a brand new Google Spreadsheet
  const spreadsheetTitle = `CatalystLab Reference Database - ${instrumentName}`;
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle,
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const targetSheetId = sheetData.sheets && sheetData.sheets[0] 
    ? sheetData.sheets[0].properties.sheetId 
    : 0;

  // 4. Update worksheet cells in a single write operation
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rowValues,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Failed to write cells into Spreadsheet: ${errText}`);
  }

  // 5. Stylize the Spreadsheet using batchUpdate
  const designRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        // Style row 1 (Hub Title banner)
        {
          repeatCell: {
            range: {
              sheetId: targetSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  bold: true,
                  fontSize: 14,
                  foregroundColor: { red: 0.14, green: 0.35, blue: 0.20 } // CatalystLab Green #245934
                }
              }
            },
            fields: 'userEnteredFormat.textFormat'
          }
        },
        // Polish headers row (Row index 4 / Spreadsheet row 5)
        {
          repeatCell: {
            range: {
              sheetId: targetSheetId,
              startRowIndex: 4,
              endRowIndex: 5,
              startColumnIndex: 0,
              endColumnIndex: 7
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.18, green: 0.44, blue: 0.25 }, // #2E6F40
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  fontSize: 11
                },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
          }
        },
        // Auto-fit column widths so long paper titles are elegantly visible
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: targetSheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 7
            }
          }
        }
      ]
    })
  });

  // Log style warn but do not halt if formatting encounters API discrepancies
  if (!designRes.ok) {
    const designErr = await designRes.text();
    console.warn(`Styles warning but proceeding since values written successfully: ${designErr}`);
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

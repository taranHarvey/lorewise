import { google } from 'googleapis';

// Ensure this runs only on server side
if (typeof window !== 'undefined') {
  throw new Error('Google Docs API can only be used on the server side');
}

// Google Docs API configuration - using OAuth2 for individual user accounts
const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file'
];

// Initialize Google Docs API client with OAuth2
export function getGoogleDocsClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  return google.docs({ version: 'v1', auth });
}

// Create a new Google Doc
export async function createGoogleDoc(title: string, content: string, accessToken: string) {
  try {
    const docs = getGoogleDocsClient(accessToken);
    
    // Create new document
    const response = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });

    const documentId = response.data.documentId;
    
    if (!documentId) {
      throw new Error('Failed to create document');
    }

    // Insert content into the document (only if content exists)
    if (content && content.trim()) {
      await docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}

// Update Google Doc content
export async function updateGoogleDoc(documentId: string, content: string, accessToken: string) {
  try {
    const docs = getGoogleDocsClient(accessToken);
    
    // Get current document to clear existing content
    const document = await docs.documents.get({ documentId });
    const endIndex = document.data.body?.content?.[1]?.endIndex || 1;
    
    // Clear existing content and insert new content
    const requests = [];
    
    // Always clear existing content
    if (endIndex > 1) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: endIndex - 1,
          },
        },
      });
    }
    
    // Only insert text if content exists
    if (content && content.trim()) {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: content,
        },
      });
    }
    
    // Only make the API call if we have requests
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: requests,
        },
      });
    }

    return {
      documentId,
      documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error) {
    console.error('Error updating Google Doc:', error);
    throw error;
  }
}

// Get Google Doc content
export async function getGoogleDocContent(documentId: string, accessToken: string) {
  try {
    const docs = getGoogleDocsClient(accessToken);
    
    const response = await docs.documents.get({ documentId });
    
    // Extract text content from the document
    const content = response.data.body?.content || [];
    let text = '';
    
    for (const element of content) {
      if (element.paragraph) {
        for (const textRun of element.paragraph.elements || []) {
          if (textRun.textRun?.content) {
            text += textRun.textRun.content;
          }
        }
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error getting Google Doc content:', error);
    throw error;
  }
}

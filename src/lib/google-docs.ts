import { google } from 'googleapis';

// Google Docs API configuration
const SCOPES = ['https://www.googleapis.com/auth/documents'];

// Initialize Google Docs API client
export function getGoogleDocsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    scopes: SCOPES,
  });

  return google.docs({ version: 'v1', auth });
}

// Create a new Google Doc
export async function createGoogleDoc(title: string, content: string) {
  try {
    const docs = getGoogleDocsClient();
    
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

    // Insert content into the document
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
export async function updateGoogleDoc(documentId: string, content: string) {
  try {
    const docs = getGoogleDocsClient();
    
    // Get current document to clear existing content
    const document = await docs.documents.get({ documentId });
    const endIndex = document.data.body?.content?.[1]?.endIndex || 1;
    
    // Clear existing content and insert new content
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: 1,
                endIndex: endIndex - 1,
              },
            },
          },
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      },
    });

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
export async function getGoogleDocContent(documentId: string) {
  try {
    const docs = getGoogleDocsClient();
    
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

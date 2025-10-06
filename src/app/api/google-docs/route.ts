import { NextRequest, NextResponse } from 'next/server';
import { createGoogleDoc, updateGoogleDoc, getGoogleDocContent } from '@/lib/google-docs';

export async function POST(request: NextRequest) {
  try {
    const { action, documentId, title, content } = await request.json();

    switch (action) {
      case 'create':
        if (!title) {
          return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const result = await createGoogleDoc(title, content || '');
        return NextResponse.json(result);

      case 'update':
        if (!documentId || !content) {
          return NextResponse.json({ error: 'Document ID and content are required' }, { status: 400 });
        }
        const updateResult = await updateGoogleDoc(documentId, content);
        return NextResponse.json(updateResult);

      case 'get':
        if (!documentId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }
        const docContent = await getGoogleDocContent(documentId);
        return NextResponse.json({ content: docContent });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Docs API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Google Docs request' },
      { status: 500 }
    );
  }
}

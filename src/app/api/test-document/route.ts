import { NextRequest, NextResponse } from 'next/server';
import { createNovel } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const id = await createNovel({
      title: 'Test OnlyOffice Document',
      description: '<p>This is a test document for OnlyOffice integration. You can edit this content using the OnlyOffice editor.</p><p>Try editing this text and saving the document to test the integration.</p>',
      userId: 'test-user',
      genre: 'Test',
      status: 'draft'
    });

    return NextResponse.json({ 
      success: true, 
      documentId: id,
      message: 'Test document created successfully'
    });
  } catch (error) {
    console.error('Error creating test document:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test document' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST to create a test document',
    example: 'curl -X POST http://localhost:3002/api/test-document'
  });
}

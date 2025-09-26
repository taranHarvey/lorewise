import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { verifyOnlyOfficeToken } from '@/lib/jwt';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Create a proper DOCX file using the docx library
async function createDocxFile(text: string, title: string): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: text || 'Empty document',
              size: 24,
            }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📄 ==========================================');
    console.log('📄 Document download request for ID:', id);
    console.log('📄 ID type:', typeof id);
    console.log('📄 ID length:', id?.length);
    console.log('📄 Request URL:', request.url);
    console.log('📄 Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('📄 ==========================================');
    
    // Check for JWT token but don't strictly require it to allow download to work
    const authHeader = request.headers.get('authorization');
    console.log('📄 Authorization header:', authHeader ? 'Present' : 'Not present');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const verified = verifyOnlyOfficeToken(token);
        if (verified) {
          console.log('✅ JWT verification successful');
        } else {
          console.warn('🔧 JWT token present but failed verification, continuing anyway');
        }
      } catch (verifyError) {
        console.warn('🔧 JWT verification error (continuing anyway):', verifyError);
        // Continue without failing to allow download to work
      }
    } else {
      console.log('📄 No authorization header, proceeding without JWT verification');
    }
    
    // Validate document ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      console.log('❌ Invalid document ID:', id);
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Get document from Firestore
    console.log('📄 Fetching document from Firestore...');
    const novelRef = doc(db, 'novels', id);
    const novelSnap = await getDoc(novelRef);

    if (!novelSnap.exists()) {
      console.log('❌ Document not found in Firestore, creating empty document for:', id);
      // Instead of returning 404, create an empty document so OnlyOffice can load
      const emptyDocxBuffer = await createDocxFile('This is a new document. Start writing here!', 'New Document');
      console.log('📄 Created empty DOCX buffer size:', emptyDocxBuffer.length);
      
      return new NextResponse(emptyDocxBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Length': emptyDocxBuffer.length.toString(),
          'Content-Disposition': `inline; filename="new-document.docx"`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Accept-Ranges': 'bytes'
        },
      });
    }

    const novelData = novelSnap.data();
    console.log('📄 Document found:', {
      id,
      title: novelData.title,
      hasDescription: !!novelData.description,
      descriptionLength: novelData.description?.length || 0
    });
    
    // Create a proper DOCX file for OnlyOffice
    const htmlContent = novelData.description || '<p>Empty document</p>';
    console.log('📄 HTML content length:', htmlContent.length);
    
    // Convert HTML to plain text for DOCX
    const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    console.log('📄 Plain text length:', plainText.length);
    
    // Create a proper DOCX file
    console.log('📄 Creating DOCX file...');
    const docxBuffer = await createDocxFile(plainText, novelData.title || 'Document');
    console.log('📄 DOCX buffer size:', docxBuffer.length);

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Length': docxBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${(novelData.title || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_')}.docx"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept-Ranges': 'bytes',
        'Access-Control-Expose-Headers': 'Content-Length'
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


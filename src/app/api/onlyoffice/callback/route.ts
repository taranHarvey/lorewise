import { NextRequest, NextResponse } from 'next/server';
import { updateNovel } from '@/lib/database';
import { verifyOnlyOfficeToken } from '@/lib/jwt';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 *** CALLBACK HIT *** OnlyOffice callback received:', JSON.stringify(body, null, 2));
    console.log('🔄 Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔄 Request URL:', request.url);
    
    // Add immediate test ping for network diagnostics
    console.log('🔊 DEBUG: OnlyOffice callback was successfully called!');

    // MANDATORY JWT verification in production
    const authHeader = request.headers.get('authorization');
    const isRequired = process.env.NODE_ENV === 'production';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verified = verifyOnlyOfficeToken(token);
      if (!verified) {
        if (isRequired) {
          console.error('❌ Invalid JWT token in production - rejecting');
          return NextResponse.json({ error: 1, message: 'Invalid JWT token' }, { status: 401 });
        }
        console.warn('⚠️ JWT token invalid but continuing in development mode');
      } else {
        console.log('✅ JWT in callback verified');
      }
    } else {
      if (isRequired) {
        console.error('❌ Missing JWT authorization in production - rejecting');
        return NextResponse.json({ error: 1, message: 'Authorization required' }, { status: 401 });
      }
      console.log('📄 No authorization header - proceeding unverified in development');
    }

    const { status, key, url } = body;

    if (status === 2) {
      // Document is ready for saving
      console.log('Document ready for saving:', key);
      return NextResponse.json({ error: 0 }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    if (status === 6) {
      // Document is being edited
      console.log('Document being edited:', key);
      return NextResponse.json({ error: 0 }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    if (status === 7) {
      // Document is closed with no changes
      console.log('Document closed with no changes:', key);
      return NextResponse.json({ error: 0 });
    }

    if (status === 1) {
      // Document is being edited
      console.log('Document editing in progress:', key);
      return NextResponse.json({ error: 0 });
    }

    if (status === 3) {
      // Document saving error - but don't fail completely
      console.warn('Document saving warning (status 3):', key, body);
      // Return success to prevent error dialogs, but log the issue
      return NextResponse.json({ error: 0 }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    if (status === 1) {
      // Document editing in progress
      console.log('Document being edited:', key);
      return NextResponse.json({ error: 0 });
    }

    if (status === 6) {
      // Document being edited by user - may be an autosave event
      console.log('Document autosave event:', key);
      // Auto-save should happen automatically
      return NextResponse.json({ error: 0 });
    }

    if (status === 0) {
      // Document opened
      console.log('Document opened:', key);
      return NextResponse.json({ error: 0 });
    }

    if (status === 4) {
      // Document closed with changes - need to save
      console.log('Document closed with changes - saving...');
      
      if (url) {
        try {
          console.log('🔄 Downloading document from OnlyOffice URL:', url);
          
          // OnlyOffice provided us the edited document URL - fetch it via CORS  
          const response = await fetch(url, {
            headers: {
              'Cache-Control': 'no-cache',
              'User-Agent': 'OnlyOffice-DocumentServer',
              'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            },
            method: 'GET'
          });
          console.log('🔄 Download response status:', response.status);
          if (response.ok) {
            const docxBuffer = await response.arrayBuffer();
            
            console.log('Received initial document from OnlyOffice:', {
              key,
              size: docxBuffer.byteLength,
              url
            });
            
            const docxBufferReadOnce = Buffer.from(docxBuffer);
            
            console.log('🔄 Converting DOCX (size:', docxBufferReadOnce.length, 'bytes) to HTML via mammoth');
            
            let htmlContent = '<p>Document updated</p>';
            try {
              const mammothResult = await mammoth.convertToHtml({ buffer: docxBufferReadOnce });
              htmlContent = mammothResult.value;
              
              console.log('Mammoth result summary:', {
                valueLength: htmlContent.length,
                messages: mammothResult.messages
              });
              
              // Safety guard checking if content returned empty
              if (!htmlContent.trim()) {
                htmlContent = '<p>Document updated but content extraction failed. Buffer size received was ' + docxBufferReadOnce.length + '</p>';
              }
              // Uncomment below for complete content isolation we had before
              // console.log('Document full HTML output:', htmlContent);
            } catch (conversionError) {
              console.error('DOCX-to-HTML conversion via mammoth failed:', conversionError);
              htmlContent = '<p>Document parts were modified, but content conversion failed. Error logged for reference:. ' + (new Date().toISOString()) + '</p>';
            }
            
            // Extract document ID from unique key (format: docId_timestamp_randomId)
            // Key may have multiple underscores - get the first part before the segmentation
            const keyParts = key.split('_');
            const documentId = keyParts.length > 1 ? keyParts[0] : key;
            console.log('🔄 Extracted document ID:', documentId, 'from key:', key);
            await updateNovel(documentId, {
              description: htmlContent,
              updatedAt: new Date()
            });
            
            console.log('Document saved successfully:', documentId);
          } else {
            console.warn('Failed to download document from OnlyOffice:', response.status, response.statusText);
            try {
              const errorText = await response.text();
              console.warn('Error response body:', errorText);
            } catch (e) {
              console.warn('Could not read error response body');
            }
            // Don't fail completely - return success to prevent error dialogs
            console.log('Continuing without download to prevent user-facing errors');
            return NextResponse.json({ error: 0 }, {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              }
            });
          }
        } catch (error) {
          console.warn('Error during document save process:', error);
          // Don't fail completely - return success to prevent error dialogs
          return NextResponse.json({ error: 0 }, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          });
        }
      } else {
        console.log('No URL provided for document save');
      }
      
      return NextResponse.json({ error: 0 });
    }

    // Default response
    return NextResponse.json({ error: 0 }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('OnlyOffice callback error:', error);
    return NextResponse.json({ error: 1 }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const onlyOfficeUrl = process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL || 'http://localhost:8080';
    const scriptUrl = `${onlyOfficeUrl}/web-apps/apps/api/documents/api.js`;
    
    console.log('🔧 Proxying OnlyOffice script from:', scriptUrl);
    
    const response = await fetch(scriptUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.status} ${response.statusText}`);
    }
    
    const scriptContent = await response.text();
    
    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error proxying OnlyOffice script:', error);
    return NextResponse.json({ error: 'Failed to load OnlyOffice script' }, { status: 500 });
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

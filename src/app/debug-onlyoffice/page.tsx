'use client';

import React, { useEffect, useState } from 'react';

export default function DebugOnlyOfficePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [documentId] = useState('6d88vmjN83REFRDmkb49');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const runDebugTests = async () => {
      addLog('🔍 Starting OnlyOffice Debug Tests...');
      
      // Test 1: Check OnlyOffice server
      try {
        addLog('🔍 Test 1: Checking OnlyOffice server...');
        const onlyofficeResponse = await fetch('http://localhost:8080');
        addLog(`✅ OnlyOffice server: ${onlyofficeResponse.status} ${onlyofficeResponse.statusText}`);
      } catch (error) {
        addLog(`❌ OnlyOffice server error: ${error.message}`);
      }

      // Test 2: Check document download
      try {
        addLog('🔍 Test 2: Testing document download...');
        const downloadResponse = await fetch(`/api/documents/${documentId}/download`);
        addLog(`📄 Document download: ${downloadResponse.status} ${downloadResponse.statusText}`);
        
        if (downloadResponse.ok) {
          const contentLength = downloadResponse.headers.get('content-length');
          const contentType = downloadResponse.headers.get('content-type');
          addLog(`📄 Content-Length: ${contentLength}, Content-Type: ${contentType}`);
        }
      } catch (error) {
        addLog(`❌ Document download error: ${error.message}`);
      }

      // Test 3: Test JWT generation
      try {
        addLog('🔍 Test 3: Testing JWT generation...');
        const jwtResponse = await fetch('/api/jwt/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            payload: {
              document: {
                fileType: 'docx',
                key: documentId,
                title: 'Test Document',
                url: `${window.location.origin}/api/documents/${documentId}/download`
              },
              editorConfig: {
                callbackUrl: `${window.location.origin}/api/onlyoffice/callback`
              }
            }
          })
        });
        
        addLog(`🔑 JWT generation: ${jwtResponse.status} ${jwtResponse.statusText}`);
        
        if (jwtResponse.ok) {
          const jwtData = await jwtResponse.json();
          addLog(`🔑 JWT token length: ${jwtData.token?.length || 0}`);
        }
      } catch (error) {
        addLog(`❌ JWT generation error: ${error.message}`);
      }

      // Test 4: Test callback endpoint
      try {
        addLog('🔍 Test 4: Testing callback endpoint...');
        const callbackResponse = await fetch('/api/onlyoffice/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 2, 
            key: documentId,
            url: `${window.location.origin}/api/documents/${documentId}/download`
          })
        });
        
        addLog(`🔄 Callback test: ${callbackResponse.status} ${callbackResponse.statusText}`);
        
        if (callbackResponse.ok) {
          const callbackData = await callbackResponse.json();
          addLog(`🔄 Callback response: ${JSON.stringify(callbackData)}`);
        }
      } catch (error) {
        addLog(`❌ Callback test error: ${error.message}`);
      }

      // Test 5: Test OnlyOffice script loading
      try {
        addLog('🔍 Test 5: Testing OnlyOffice script loading...');
        const scriptResponse = await fetch('http://localhost:8080/web-apps/apps/api/documents/api.js');
        addLog(`📜 OnlyOffice script: ${scriptResponse.status} ${scriptResponse.statusText}`);
      } catch (error) {
        addLog(`❌ OnlyOffice script error: ${error.message}`);
      }

      addLog('🔍 Debug tests completed!');
    };

    runDebugTests();
  }, [documentId]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          OnlyOffice Debug Console
        </h1>
        <div className="text-sm text-gray-600">
          <p>Document ID: {documentId}</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-lg flex flex-col">
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm flex-1 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t flex gap-4">
            <button 
              onClick={() => setLogs([])}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
            <a 
              href="/test-onlyoffice" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Open OnlyOffice Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

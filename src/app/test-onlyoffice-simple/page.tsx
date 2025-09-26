'use client';

import React, { useEffect, useState } from 'react';

export default function TestOnlyOfficeSimplePage() {
  const [status, setStatus] = useState('Loading...');
  const [documentId] = useState('6d88vmjN83REFRDmkb49');

  useEffect(() => {
    const testIntegration = async () => {
      try {
        setStatus('Testing document download...');
        
        // Test document download
        const downloadResponse = await fetch(`/api/documents/${documentId}/download`);
        if (!downloadResponse.ok) {
          throw new Error(`Document download failed: ${downloadResponse.status}`);
        }
        setStatus('✅ Document download working');
        
        // Test JWT generation
        setStatus('Testing JWT generation...');
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
        
        if (!jwtResponse.ok) {
          throw new Error(`JWT generation failed: ${jwtResponse.status}`);
        }
        
        const jwtData = await jwtResponse.json();
        if (!jwtData.token) {
          throw new Error('No JWT token received');
        }
        
        setStatus('✅ JWT generation working');
        
        // Test callback
        setStatus('Testing callback endpoint...');
        const callbackResponse = await fetch('/api/onlyoffice/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 2, key: documentId })
        });
        
        if (!callbackResponse.ok) {
          throw new Error(`Callback failed: ${callbackResponse.status}`);
        }
        
        setStatus('✅ All tests passed! OnlyOffice should work now.');
        
      } catch (error) {
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    testIntegration();
  }, [documentId]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            OnlyOffice Integration Test
          </h1>
          <div className="mb-4">
            <p className="text-gray-600">Document ID: {documentId}</p>
            <p className="text-gray-600">Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">Test Status:</h2>
            <p className="text-lg">{status}</p>
          </div>
          <div className="mt-6">
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

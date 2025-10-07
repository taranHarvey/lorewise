'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { updateNovel } from '@/lib/database';

interface FullGoogleDocsEditorProps {
  documentId: string;
  documentTitle?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
}

export default function FullGoogleDocsEditor({
  documentId,
  documentTitle = 'Novel Document',
  initialContent = '',
  onSave,
  onError,
}: FullGoogleDocsEditorProps) {
  const { googleDocsToken } = useAuth();
  const [googleDocId, setGoogleDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDocument = async () => {
      if (!googleDocsToken) {
        setError('Google Docs access token not available. Please log in with Google.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create new Google Doc via API route
        const response = await fetch('/api/google-docs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            title: documentTitle,
            content: initialContent,
            accessToken: googleDocsToken,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create Google Doc');
        }

        const result = await response.json();
        setGoogleDocId(result.documentId);
        
        // Save the googleDocId to Firestore for future reference
        await updateNovel(documentId, {
          googleDocId: result.documentId,
          updatedAt: new Date(),
        });

        console.log('✅ Google Doc created/linked:', result.documentUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize document';
        setError(errorMessage);
        onError?.(errorMessage);
        console.error('❌ Full Google Docs initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDocument();
  }, [documentId, documentTitle, initialContent, onError, googleDocsToken]);

  if (!googleDocsToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-blue-500 text-xl mb-4">🔐</div>
          <p className="text-gray-600 mb-4">Please log in with Google to use Google Docs</p>
          <p className="text-sm text-gray-500">Google Docs integration requires Google authentication</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Docs editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Full Google Docs interface with all native tools */}
      <div className="flex-1">
        <iframe
          src={`https://docs.google.com/document/d/${googleDocId}/edit?usp=sharing`}
          className="w-full h-full border-0"
          title="Google Docs Editor"
          allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
          style={{ minHeight: '600px' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface GoogleDocsEmbedProps {
  documentId: string;
  documentTitle?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleDocsEmbed({
  documentId,
  documentTitle = 'Novel Document',
  initialContent = '',
  onSave,
  onError,
}: GoogleDocsEmbedProps) {
  const { googleDocsToken } = useAuth();
  const [googleDocId, setGoogleDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Doc
  useEffect(() => {
    const initializeDocument = async () => {
      if (!googleDocsToken) {
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
        
        console.log('✅ Google Doc created:', result.documentUrl);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize document';
        setError(errorMessage);
        onError?.(errorMessage);
        console.error('❌ Google Docs initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDocument();
  }, [documentId, documentTitle, initialContent, onError, googleDocsToken]);

  if (!googleDocsToken) {
    return (
      <div className="flex items-center justify-center h-64">
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating Google Doc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
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

  if (!googleDocId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">📄</div>
          <p className="text-gray-600">No Google Doc available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Embedded Google Docs with full toolbar */}
      <div className="flex-1">
        <iframe
          src={`https://docs.google.com/document/d/${googleDocId}/edit?usp=sharing&rm=minimal`}
          className="w-full h-full border-0"
          title="Google Docs Editor"
          allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ minHeight: '600px' }}
        />
      </div>

    </div>
  );
}

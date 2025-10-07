'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import CustomToolbar from './CustomToolbar';

interface EnhancedGoogleDocsEditorProps {
  documentId: string;
  documentTitle?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
}

export default function EnhancedGoogleDocsEditor({
  documentId,
  documentTitle = 'Novel Document',
  initialContent = '',
  onSave,
  onError,
}: EnhancedGoogleDocsEditorProps) {
  const { googleDocsToken } = useAuth();
  const [googleDocId, setGoogleDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Handle toolbar actions
  const handleFormatChange = (format: string, value?: any) => {
    if (!iframeRef.current || !googleDocId) return;

    try {
      // Send commands to Google Docs iframe
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Execute formatting commands
        iframeDoc.execCommand(format, false, value);
      }
    } catch (err) {
      console.warn('Could not apply formatting to Google Docs iframe:', err);
    }
  };

  const handleInsert = (type: string, data?: any) => {
    if (!iframeRef.current || !googleDocId) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        switch (type) {
          case 'link':
            const url = prompt('Enter URL:');
            if (url) {
              iframeDoc.execCommand('createLink', false, url);
            }
            break;
          case 'image':
            const imageUrl = prompt('Enter image URL:');
            if (imageUrl) {
              iframeDoc.execCommand('insertImage', false, imageUrl);
            }
            break;
          case 'divider':
            iframeDoc.execCommand('insertHorizontalRule', false);
            break;
          default:
            console.log('Insert type not implemented:', type);
        }
      }
    } catch (err) {
      console.warn('Could not insert element into Google Docs iframe:', err);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!googleDocId) return;

    const autoSaveTimer = setInterval(async () => {
      try {
        setIsSaving(true);
        
        // Get content from iframe and save to Firestore
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            const content = iframeDoc.body?.innerText || '';
            
            // Save to Firestore
            const response = await fetch('/api/novels', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: documentId,
                description: content,
                updatedAt: new Date().toISOString(),
              }),
            });

            if (response.ok) {
              onSave?.(content);
              console.log('✅ Document auto-saved');
            }
          }
        }
      } catch (err) {
        console.warn('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [googleDocId, documentId, onSave]);

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
    <div className="flex flex-col h-full bg-white">
      {/* Custom Toolbar */}
      <CustomToolbar
        onFormatChange={handleFormatChange}
        onInsert={handleInsert}
        className="border-b border-gray-200"
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{documentTitle}</span>
          {isSaving && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
        <div className="text-gray-500">
          Auto-saves to Google Drive
        </div>
      </div>

      {/* Embedded Google Docs */}
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          src={`https://docs.google.com/document/d/${googleDocId}/edit?usp=sharing&rm=minimal`}
          className="w-full h-full border-0"
          title="Google Docs Editor"
          allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ minHeight: '500px' }}
        />
      </div>
    </div>
  );
}

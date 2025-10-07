'use client';

import React, { useState, useEffect, useRef } from 'react';
// Google Docs API calls will be made through API routes
import { updateNovel } from '@/lib/database';
import { useAuth } from '@/components/auth/AuthProvider';

interface GoogleDocsEditorProps {
  documentId: string;
  documentTitle?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleDocsEditor({
  documentId,
  documentTitle = 'Novel Document',
  initialContent = '',
  onSave,
  onError,
}: GoogleDocsEditorProps) {
  const { googleDocsToken } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [googleDocId, setGoogleDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

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
        setContent(initialContent);
        
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

  // Auto-save functionality
  useEffect(() => {
    if (!googleDocId || !content) return;

    const autoSaveTimer = setTimeout(async () => {
      await saveDocument();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, googleDocId]);

  const saveDocument = async () => {
    if (!googleDocId || isSaving || !googleDocsToken) return;

    try {
      setIsSaving(true);
      
      // Update Google Doc via API route
      const response = await fetch('/api/google-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          documentId: googleDocId,
          content: content,
          accessToken: googleDocsToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Google Doc');
      }
      
      // Update Firestore
      await updateNovel(documentId, {
        description: content,
        updatedAt: new Date(),
      });

      onSave?.(content);
      console.log('✅ Document saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = async () => {
    await saveDocument();
  };

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
          <p className="text-gray-600">Initializing Google Docs editor...</p>
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">{documentTitle}</h2>
          {isSaving && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {googleDocId && (
            <a
              href={`https://docs.google.com/document/d/${googleDocId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open in Google Docs
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your novel..."
          className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div>
          Characters: {content.length} | Words: {content.split(/\s+/).filter(word => word.length > 0).length}
        </div>
        <div>
          Powered by Google Docs API
        </div>
      </div>
    </div>
  );
}

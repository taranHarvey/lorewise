'use client';

import React, { useState, useEffect } from 'react';
import OnlyOfficeEditor from './OnlyOfficeEditor';

interface OnlyOfficeNovelEditorProps {
  novelId: string;
  novelTitle?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
}

const OnlyOfficeNovelEditor: React.FC<OnlyOfficeNovelEditorProps> = ({
  novelId,
  novelTitle = 'Novel',
  onSave,
  onError
}) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the editor
    setIsReady(true);
  }, []);

  const handleSave = (content: string) => {
    console.log('Document saved:', content);
    onSave?.(content);
  };

  const handleError = (error: string) => {
    console.error('OnlyOffice error:', error);
    setError(error);
    onError?.(error);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Initializing document editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <OnlyOfficeEditor
        documentId={novelId}
        documentTitle={novelTitle}
        onSave={handleSave}
        onError={handleError}
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default OnlyOfficeNovelEditor;

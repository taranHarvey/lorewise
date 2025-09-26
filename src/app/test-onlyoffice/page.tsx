'use client';

import React, { useEffect, useState } from 'react';
import OnlyOfficeNovelEditor from '@/components/writing/OnlyOfficeNovelEditor';
import { createNovel } from '@/lib/database';

export default function TestOnlyOfficePage() {
  const [documentId, setDocumentId] = useState<string>('6d88vmjN83REFRDmkb49');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Create a test document in the database
    const createTestDocument = async () => {
      setIsCreating(true);
      try {
        const id = await createNovel({
          title: 'Test OnlyOffice Document',
          description: '<p>This is a test document for OnlyOffice integration. You can edit this content using the OnlyOffice editor.</p><p>Try editing this text and saving the document to test the integration.</p>',
          userId: 'test-user',
          genre: 'Test',
          status: 'draft'
        });
        setDocumentId(id);
        console.log('Test document created with ID:', id);
        
        // Wait a moment for the document to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error creating test document:', error);
        // Fallback to a hardcoded ID if creation fails
        setDocumentId('test-document-123');
      } finally {
        setIsCreating(false);
      }
    };

    createTestDocument();
  }, []);

  if (isCreating) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Creating test document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <OnlyOfficeNovelEditor
        novelId={documentId}
        novelTitle="Test OnlyOffice Document"
        onSave={(content) => console.log('Document saved:', content)}
        onError={(error) => console.error('OnlyOffice error:', error)}
      />
    </div>
  );
}

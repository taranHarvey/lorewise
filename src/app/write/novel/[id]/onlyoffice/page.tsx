'use client';

import React, { useEffect, useState } from 'react';
import OnlyOfficeNovelEditor from '@/components/writing/OnlyOfficeNovelEditor';
import { useAuth } from '@/components/auth/AuthProvider';

export default function OnlyOfficePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [novelId, setNovelId] = useState<string>(params.id);
  const [novelTitle, setNovelTitle] = useState<string>('Document');

  useEffect(() => {
    // You can load the novel title here if needed
    console.log('OnlyOffice page for novel:', novelId);
  }, [novelId]);

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the document editor.</p>
        </div>
      </div>
    );
  }

  return (
    <OnlyOfficeNovelEditor
      novelId={novelId}
      novelTitle={novelTitle}
      onSave={(content) => console.log('Document saved:', content)}
      onError={(error) => console.error('OnlyOffice error:', error)}
    />
  );
}

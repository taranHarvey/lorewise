'use client';

import { useState } from 'react';
import { createNovel, getNovelsByUser } from '@/lib/database';
import type { Novel } from '@/types/database';

export default function DatabaseTest() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUserId] = useState('test-user-123'); // For testing purposes

  const testCreateNovel = async () => {
    setLoading(true);
    try {
      const novelData = {
        userId: testUserId,
        title: 'Test Novel',
        description: 'A test novel created to verify database functionality',
        genre: 'Fantasy',
        targetAudience: 'Young Adult',
        wordCount: 0,
        status: 'draft' as const,
      };

      const novelId = await createNovel(novelData);
      console.log('Novel created with ID:', novelId);
      
      // Refresh the novels list
      await testGetNovels();
    } catch (error) {
      console.error('Error creating novel:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGetNovels = async () => {
    setLoading(true);
    try {
      const userNovels = await getNovelsByUser(testUserId);
      setNovels(userNovels);
      console.log('Novels retrieved:', userNovels);
    } catch (error) {
      console.error('Error getting novels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Database Test</h2>
      <p className="text-gray-600 mb-4">
        Test Firebase/Firestore connection and basic operations.
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testCreateNovel}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading ? 'Creating...' : 'Create Test Novel'}
          </button>
          
          <button
            onClick={testGetNovels}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading ? 'Loading...' : 'Get Novels'}
          </button>
        </div>

        {novels.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Novels ({novels.length})</h3>
            <div className="space-y-2">
              {novels.map((novel) => (
                <div key={novel.id} className="p-3 bg-gray-50 rounded border">
                  <h4 className="font-medium">{novel.title}</h4>
                  <p className="text-sm text-gray-600">{novel.description}</p>
                  <p className="text-xs text-gray-500">
                    Genre: {novel.genre} | Status: {novel.status} | 
                    Created: {novel.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createNovel } from '@/lib/database';
import { useRouter } from 'next/navigation';
import { BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateNovel = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const novelData = {
        userId: user.uid,
        title: 'Untitled Novel',
        description: 'A new novel waiting to be written',
        genre: 'Fiction',
        targetAudience: 'General',
        wordCount: 0,
        status: 'draft' as const,
      };

      const novelId = await createNovel(novelData);
      router.push(`/write/novel/${novelId}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">LoreWise</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Start Writing Your Novel
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Create a new novel and begin your writing journey with AI assistance
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <div className="mb-6">
              <BookOpenIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">New Novel</h2>
              <p className="text-gray-300">
                Start with a blank canvas and let your creativity flow
              </p>
            </div>

            <button
              onClick={handleCreateNovel}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>{loading ? 'Creating...' : 'Create New Novel'}</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Your novel will be saved automatically as you write
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

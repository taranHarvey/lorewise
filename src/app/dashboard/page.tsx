'use client';

// Disable static generation for this page since it uses client-side context
export const dynamic = 'force-dynamic';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNovelsByUser, getSeriesByUser } from '@/lib/database';
import type { Novel, Series } from '@/types/database';
import { 
  BookOpenIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [userNovels, userSeries] = await Promise.all([
        getNovelsByUser(user.uid),
        getSeriesByUser(user.uid)
      ]);
      setNovels(userNovels);
      setSeries(userSeries);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <UserIcon className="h-5 w-5" />
                <span>{user?.email}</span>
              </div>
              <Link
                href="/dashboard/settings"
                className="text-white hover:text-purple-300 transition-colors"
                title="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-purple-300 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-300 text-lg">
            Ready to continue writing your masterpiece?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/write"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <PlusIcon className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">New Novel</h3>
            </div>
            <p className="text-gray-300">Start writing a new novel with AI assistance</p>
          </Link>

          <Link
            href="/series-bible"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <DocumentTextIcon className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Series Bible</h3>
            </div>
            <p className="text-gray-300">Manage characters, locations, and plot points</p>
          </Link>

          <Link
            href="/ai-assistant"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Cog6ToothIcon className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">AI Assistant</h3>
            </div>
            <p className="text-gray-300">Get help with plot, characters, and writing</p>
          </Link>
        </div>

        {/* Recent Novels */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Novels</h2>
            <Link
              href="/write"
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Link>
          </div>
          
          {novels.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No novels yet</h3>
              <p className="text-gray-300 mb-4">Start your writing journey by creating your first novel</p>
              <Link
                href="/write"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Your First Novel
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {novels.slice(0, 6).map((novel) => (
                <Link
                  key={novel.id}
                  href={`/write/novel/${novel.id}`}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{novel.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{novel.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{novel.genre}</span>
                    <span>{novel.wordCount.toLocaleString()} words</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Series */}
        {series.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Your Series</h2>
              <Link
                href="/series-bible"
                className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Manage Series</span>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.map((seriesItem) => (
                <Link
                  key={seriesItem.id}
                  href={`/series-bible/${seriesItem.id}`}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{seriesItem.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{seriesItem.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{seriesItem.genre}</span>
                    <span>{seriesItem.totalBooks} books</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

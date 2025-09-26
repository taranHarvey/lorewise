'use client';

// Disable static generation since it uses client-side context
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import { getNovelsByUser, createNovel, deleteNovel, updateNovel } from '@/lib/database';
import type { Novel } from '@/types/database';
import { 
  BookOpenIcon, 
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import LeftNavigation from '@/components/writing/LeftNavigation';
import MainEditor, { MainEditorRef } from '@/components/writing/MainEditor';
import RightAIChat from '@/components/writing/RightAIChat';

export default function NovelEditorPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(novelId);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeftPanelMinimized, setIsLeftPanelMinimized] = useState(false);
  const [isRightPanelMinimized, setIsRightPanelMinimized] = useState(false);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [creatingNovel, setCreatingNovel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [novelToDelete, setNovelToDelete] = useState<string | null>(null);
  const [deletingNovel, setDeletingNovel] = useState(false);
  const mainEditorRef = useRef<MainEditorRef>(null);

  useEffect(() => {
    if (user) {
      loadNovels();
      setLoading(false);
    }
  }, [user]);

  const loadNovels = async () => {
    if (!user) return;
    
    try {
      const userNovels = await getNovelsByUser(user.uid);
      
      // Initialize order field for novels that don't have it
      const novelsNeedingOrder = userNovels.filter(novel => novel.order === undefined);
      if (novelsNeedingOrder.length > 0) {
        console.log('Initializing order for', novelsNeedingOrder.length, 'novels');
        await Promise.all(
          novelsNeedingOrder.map((novel, index) => {
            const orderIndex = userNovels.indexOf(novel);
            return updateNovel(novel.id, { order: orderIndex });
          })
        );
        // Reload after initializing order
        const updatedNovels = await getNovelsByUser(user.uid);
        setNovels(updatedNovels);
      } else {
        // The database function already handles sorting by order
        setNovels(userNovels);
      }
    } catch (error) {
      console.error('Error loading novels:', error);
    }
  };

  const handleSelectNovel = async (novelId: string) => {
    // Save current content before switching
    if (mainEditorRef.current && selectedNovelId && selectedNovelId !== 'lore') {
      await mainEditorRef.current.saveContent();
    }
    
    setSelectedNovelId(novelId);
    setSelectedChapterId(null);
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
  };

  const handleSelectLore = async () => {
    // Save current content before switching
    if (mainEditorRef.current && selectedNovelId && selectedNovelId !== 'lore') {
      await mainEditorRef.current.saveContent();
    }
    
    setSelectedNovelId('lore');
    setSelectedChapterId(null);
  };

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
  };

  const handleCreateNovel = async () => {
    if (!user || creatingNovel) return;
    
    setCreatingNovel(true);
    try {
      // Save current content before creating new novel
      if (mainEditorRef.current && selectedNovelId && selectedNovelId !== 'lore') {
        await mainEditorRef.current.saveContent();
      }
      
      const novelData = {
        userId: user.uid,
        title: `Novel ${novels.length + 1}`,
        description: '', // Start with blank content
        genre: 'Fiction',
        targetAudience: 'General',
        wordCount: 0,
        status: 'draft' as const,
      };

      const newNovelId = await createNovel(novelData);
      await loadNovels(); // Reload novels to include the new one
      setSelectedNovelId(newNovelId); // Automatically select the new novel
      setSelectedChapterId(null);
    } catch (error) {
      console.error('Error creating novel:', error);
    } finally {
      setCreatingNovel(false);
    }
  };

  const handleReorderNovels = async (reorderedNovels: Novel[]) => {
    setNovels(reorderedNovels);
    
    // Save the new order to the database
    try {
      await Promise.all(
        reorderedNovels.map((novel, index) => 
          updateNovel(novel.id, { order: index })
        )
      );
    } catch (error) {
      console.error('Error saving novel order:', error);
      // Reload novels to restore correct order on error
      await loadNovels();
    }
  };

  const handleDeleteNovel = (novelId: string) => {
    const novelToDeleteData = novels.find(n => n.id === novelId);
    if (novelToDeleteData) {
      setNovelToDelete(novelId);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!novelToDelete || deletingNovel) return;
    
    setDeletingNovel(true);
    try {
      await deleteNovel(novelToDelete);
      await loadNovels(); // Reload novels after deletion
      
      // If we deleted the currently selected novel, select the first available novel or lore
      if (selectedNovelId === novelToDelete) {
        const remainingNovels = novels.filter(n => n.id !== novelToDelete);
        if (remainingNovels.length > 0) {
          setSelectedNovelId(remainingNovels[0].id);
        } else {
          setSelectedNovelId('lore');
        }
        setSelectedChapterId(null);
      }
    } catch (error) {
      console.error('Error deleting novel:', error);
    } finally {
      setDeletingNovel(false);
      setShowDeleteConfirm(false);
      setNovelToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNovelToDelete(null);
  };

  const handleUpdateTitle = async (novelId: string, newTitle: string) => {
    try {
      await updateNovel(novelId, { title: newTitle });
      await loadNovels(); // Reload novels after title change
    } catch (error) {
      console.error('Error updating novel title:', error);
    }
  };

  const handleUploadDocument = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.doc,.txt,.md';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Implement file upload logic
        console.log('File selected:', file.name);
        // For now, just create a new novel with the file name
        const novelData = {
          userId: user!.uid,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          description: `Uploaded from ${file.name}`, 
          genre: 'Fiction',
          targetAudience: 'General',
          wordCount: 0,
          status: 'draft' as const,
        };
        
        createNovel(novelData).then(async (newNovelId) => {
          await loadNovels();
          setSelectedNovelId(newNovelId);
        }).catch(console.error);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 h-12 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-semibold text-white">LoreWise</span>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Navigation - Conditional width based on minimized state */}
        <div className={`${isLeftPanelMinimized ? 'w-12' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
          <LeftNavigation
            selectedNovelId={selectedNovelId}
            selectedChapterId={selectedChapterId}
            novels={novels}
            onSelectNovel={handleSelectNovel}
            onSelectChapter={handleSelectChapter}
            onSelectLore={handleSelectLore}
            onCreateNovel={handleCreateNovel}
            onUploadDocument={handleUploadDocument}
            onDeleteNovel={handleDeleteNovel}
            onUpdateTitle={handleUpdateTitle}
            onReorderNovels={handleReorderNovels}
            isMinimized={isLeftPanelMinimized}
            onToggleMinimize={() => setIsLeftPanelMinimized(!isLeftPanelMinimized)}
          />
        </div>

        {/* Main Editor - Flexible middle section that adjusts to remaining space */}
        <div className="flex-1 min-w-0">
          <MainEditor
            ref={mainEditorRef}
            selectedNovelId={selectedNovelId}
            selectedChapterId={selectedChapterId}
            onContentChange={handleContentChange}
            novels={novels}
            onTabChange={(novelId) => setSelectedNovelId(novelId)} // Sync navigation
          />
        </div>

        {/* Right AI Chat - Conditional width based on minimized state */}
        <div className={`${isRightPanelMinimized ? 'w-12' : 'w-80'} flex-shrink-0 transition-all duration-300`}>
          <RightAIChat
            novelContext={{
              title: selectedNovelId === 'lore' ? 'Series Bible' : 'Current Novel',
              content: currentContent,
              genre: 'Fiction'
            }}
            isMinimized={isRightPanelMinimized}
            onToggleMinimize={() => setIsRightPanelMinimized(!isRightPanelMinimized)}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Novel</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this novel? This action cannot be undone and will permanently remove all content.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deletingNovel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingNovel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                {deletingNovel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

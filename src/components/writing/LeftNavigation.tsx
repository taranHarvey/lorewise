'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getNovelsByUser, getSeriesByUser } from '@/lib/database';
import type { Novel, Series } from '@/types/database';
import { 
  BookOpenIcon, 
  DocumentTextIcon, 
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon as ExpandIcon,
  Bars3Icon,
  TrashIcon,
  ArrowUpTrayIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableNovelProps {
  novel: Novel;
  isExpanded: boolean;
  isSelected: boolean;
  chapters: { id: string; title: string; lineNumber: number }[];
  selectedChapterId: string | null;
  onToggleExpansion: () => void;
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onDeleteNovel: (novelId: string) => void;
  onUpdateTitle?: (novelId: string, newTitle: string) => void;
}

function SortableNovel({
  novel,
  isExpanded,
  isSelected,
  chapters,
  selectedChapterId,
  onToggleExpansion,
  onSelectNovel,
  onSelectChapter,
  onDeleteNovel,
  onUpdateTitle
}: SortableNovelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: novel.id });

  // State for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(novel.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      {/* Novel Header */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors min-w-0 ${
        isSelected 
          ? 'bg-purple-600 text-white' 
          : 'text-slate-300 hover:bg-slate-700'
      }`}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white"
          title="Drag to reorder"
        >
          <Bars3Icon className="h-4 w-4" />
        </div>
        
        <BookOpenIcon className="h-4 w-4" />
        
        <button
          onClick={() => {
            if (chapters.length > 0) {
              onToggleExpansion();
            } else {
              onSelectNovel(novel.id);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="flex-1 flex items-center space-x-2 text-left min-w-0"
        >
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={async () => {
                if (editedTitle.trim() && editedTitle !== novel.title && onUpdateTitle) {
                  await onUpdateTitle(novel.id, editedTitle.trim());
                } else {
                  setEditedTitle(novel.title);
                }
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editedTitle.trim() && editedTitle !== novel.title && onUpdateTitle) {
                    onUpdateTitle(novel.id, editedTitle.trim());
                  } else {
                    setEditedTitle(novel.title);
                  }
                  setIsEditing(false);
                } else if (e.key === 'Escape') {
                  setEditedTitle(novel.title);
                  setIsEditing(false);
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-inherit p-0 min-w-0"
              autoFocus
            />
          ) : (
            <>
              <span className="flex-1 truncate min-w-0" title={novel.title}>{novel.title}</span>
              {chapters.length > 0 && (
                isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                )
              )}
            </>
          )}
        </button>
        
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNovel(novel.id);
            }}
            className="p-0.5 rounded hover:bg-red-600 text-slate-400 hover:text-white transition-colors flex-shrink-0 ml-1"
            title="Delete novel"
          >
            <TrashIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Chapters */}
      {isExpanded && chapters.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className={`w-full flex items-center space-x-2 px-3 py-1 rounded text-left transition-colors ${
                selectedChapterId === chapter.id
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              <DocumentTextIcon className="h-3 w-3" />
              <span className="text-sm truncate">{chapter.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface LeftNavigationProps {
  selectedNovelId: string | null;
  selectedChapterId: string | null;
  novels: Novel[];
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectLore: () => void;
  onCreateNovel: () => void;
  onUploadDocument: () => void;
  onDeleteNovel: (novelId: string) => void;
  onUpdateTitle: (novelId: string, newTitle: string) => void;
  onReorderNovels: (reorderedNovels: Novel[]) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function LeftNavigation({
  selectedNovelId,
  selectedChapterId,
  novels,
  onSelectNovel,
  onSelectChapter,
  onSelectLore,
  onCreateNovel,
  onUploadDocument,
  onDeleteNovel,
  onUpdateTitle,
  onReorderNovels,
  isMinimized,
  onToggleMinimize
}: LeftNavigationProps) {
  const { user } = useAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [expandedNovels, setExpandedNovels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [seriesName, setSeriesName] = useState('New Series');
  const [isEditingSeriesName, setIsEditingSeriesName] = useState(false);
  const [editedSeriesName, setEditedSeriesName] = useState('New Series');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateMenu]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const userSeries = await getSeriesByUser(user.uid);
      setSeries(userSeries);
    } catch (error) {
      console.error('Error loading series data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNovelExpansion = (novelId: string) => {
    const newExpanded = new Set(expandedNovels);
    if (newExpanded.has(novelId)) {
      newExpanded.delete(novelId);
    } else {
      newExpanded.add(novelId);
    }
    setExpandedNovels(newExpanded);
  };

  const extractChapters = (content: string) => {
    // Extract chapters from HTML content by looking for headings
    const chapters: { id: string; title: string; lineNumber: number }[] = [];
    
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find all heading elements (h1, h2, h3, etc.)
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading, index) => {
      const title = heading.textContent?.trim() || '';
      if (title.length > 0) {
        chapters.push({
          id: `chapter-${index}`,
          title: title,
          lineNumber: index
        });
      }
    });

    return chapters;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = novels.findIndex((novel) => novel.id === active.id);
      const newIndex = novels.findIndex((novel) => novel.id === over.id);

      const reorderedNovels = arrayMove(novels, oldIndex, newIndex);
      onReorderNovels(reorderedNovels);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-slate-800 border-r border-slate-700 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="h-full w-full bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Minimized Header with Toggle Button */}
        <div className="p-2 border-b border-slate-700 flex items-center justify-center">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Expand Documents Panel"
          >
            <ExpandIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Minimized Content - Just icons */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <button
            onClick={onSelectLore}
            className={`p-2 rounded-lg transition-colors ${
              selectedNovelId === 'lore' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
            title="Series Bible"
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
          
          {novels.map((novel) => (
            <button
              key={novel.id}
              onClick={() => onSelectNovel(novel.id)}
              className={`p-2 rounded-lg transition-colors ${
                selectedNovelId === novel.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              title={novel.title}
            >
              <BookOpenIcon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isEditingSeriesName ? (
          <input
            type="text"
            value={editedSeriesName}
            onChange={(e) => setEditedSeriesName(e.target.value)}
            onBlur={() => {
              if (editedSeriesName.trim()) {
                setSeriesName(editedSeriesName.trim());
              } else {
                setEditedSeriesName(seriesName);
              }
              setIsEditingSeriesName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editedSeriesName.trim()) {
                  setSeriesName(editedSeriesName.trim());
                } else {
                  setEditedSeriesName(seriesName);
                }
                setIsEditingSeriesName(false);
              } else if (e.key === 'Escape') {
                setEditedSeriesName(seriesName);
                setIsEditingSeriesName(false);
              }
            }}
            className="text-lg font-semibold bg-transparent border-none outline-none text-white p-0 flex-1 min-w-0"
            autoFocus
          />
        ) : (
          <h2 
            className="text-lg font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors flex-1 truncate min-w-0"
            onDoubleClick={() => {
              setEditedSeriesName(seriesName);
              setIsEditingSeriesName(true);
            }}
            title={`${seriesName} - Double-click to edit series name`}
          >
            {seriesName}
          </h2>
        )}
        <button
          onClick={onToggleMinimize}
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-2"
          title="Minimize Panel"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Lore Document */}
        <div className="p-2">
          <button
            onClick={onSelectLore}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
              selectedNovelId === 'lore' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span className="font-medium">Series Bible</span>
          </button>
        </div>

        {/* Novels */}
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Novels</h3>
            <div className="relative" ref={createMenuRef}>
              <button 
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Add New Novel or Upload Document"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              {showCreateMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onCreateNovel();
                        setShowCreateMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <DocumentPlusIcon className="h-4 w-4 mr-2" />
                      New Document
                    </button>
                    <button
                      onClick={() => {
                        onUploadDocument();
                        setShowCreateMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      Upload Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={novels.map(novel => novel.id)}
              strategy={verticalListSortingStrategy}
            >
              {novels.map((novel) => {
                const isExpanded = expandedNovels.has(novel.id);
                const isSelected = selectedNovelId === novel.id;
                const chapters = extractChapters(novel.description || '');

                return (
                  <SortableNovel
                    key={novel.id}
                    novel={novel}
                    isExpanded={isExpanded}
                    isSelected={isSelected}
                    chapters={chapters}
                    selectedChapterId={selectedChapterId}
                    onToggleExpansion={() => toggleNovelExpansion(novel.id)}
                    onSelectNovel={onSelectNovel}
                    onSelectChapter={onSelectChapter}
                    onDeleteNovel={onDeleteNovel}
                    onUpdateTitle={onUpdateTitle}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Series */}
        {series.length > 0 && (
          <div className="p-2 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">Series</h3>
            {series.map((seriesItem) => (
              <div key={seriesItem.id} className="mb-1">
                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-slate-700 transition-colors">
                  <BookOpenIcon className="h-4 w-4" />
                  <span className="flex-1 truncate">{seriesItem.title}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

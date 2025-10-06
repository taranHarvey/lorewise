'use client';

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getNovelsByUser, updateNovel } from '@/lib/database';
import type { Novel } from '@/types/database';
import SimpleDocumentEditor from './SeparatePagesEditor';
import OnlyOfficeNovelEditor from './OnlyOfficeNovelEditor';
import MultiDocumentTabs from './MultiDocumentTabs';
import OnlyOfficeEditor, { OnlyOfficeEditorRef } from './OnlyOfficeEditor';
import GoogleDocsEditor from './GoogleDocsEditor';

interface MainEditorProps {
  selectedNovelId: string | null;
  selectedChapterId: string | null;
  onContentChange: (content: string) => void;
  novels?: Novel[]; // Pass novels to get title updates
  onTabChange?: (novelId: string) => void; // Callback when tab is changed
}

export interface MainEditorRef {
  saveContent: () => Promise<void>;
}

const MainEditor = forwardRef<MainEditorRef, MainEditorProps>(({
  selectedNovelId,
  selectedChapterId,
  onContentChange,
  novels,
  onTabChange
}: MainEditorProps, ref) => {
  const { user } = useAuth();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoadingNovel, setIsLoadingNovel] = useState(false);
  const [editorType, setEditorType] = useState<'google-docs' | 'onlyoffice' | 'simple'>('google-docs'); // Default to Google Docs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tab system state
  const [openDocuments, setOpenDocuments] = useState<Array<{
    id: string;
    title: string;
    isActive: boolean;
    isDirty: boolean;
    lastAccessed: Date;
  }>>([]);
  const onlyOfficeRefs = useRef<Map<string, OnlyOfficeEditorRef>>(new Map());

  // Handle tab management
  const openDocument = useCallback((docId: string, docTitle: string) => {
    setOpenDocuments(prev => {
      // If document is already open, just mark it as active  
      if (prev.find(doc => doc.id === docId)) {
        return prev.map(doc => ({ 
          ...doc, 
          isActive: doc.id === docId,
          lastAccessed: doc.id === docId ? new Date() : doc.lastAccessed 
        }));
      }
      
      // Add new document
      const newDoc = {
        id: docId,
        title: docTitle || `Document ${docId}`,
        isDirty: false,
        lastAccessed: new Date()
      };
      
      return [
        ...prev.map(doc => ({ ...doc, isActive: false })),
        { ...newDoc, isActive: true }
      ];
    });
  }, []);

  const closeDocument = useCallback((docId: string) => {
    setOpenDocuments(prev => {
      const filtered = prev.filter(doc => doc.id !== docId);
      
      if (filtered.length > 0) {
        // Activate the most recently accessed document
        const sortedByDate = filtered.sort((a, b) => 
          new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
        );
        return sortedByDate.map((doc, index) => ({
          ...doc,
          isActive: index === 0
        }));
      }
      
      return filtered;
    });
  }, []);

  const switchToDocument = useCallback((docId: string) => {
    setOpenDocuments(prev => 
      prev.map(doc => ({ 
        ...doc, 
        isActive: doc.id === docId,
        lastAccessed: doc.id === docId ? new Date() : doc.lastAccessed 
      }))
    );
  }, []);

  // Load novel information for tabs
  useEffect(() => {
    const loadNovelForTab = async () => {
      if (selectedNovelId && selectedNovelId !== 'lore' && user) {
        try {
          const novels = await getNovelsByUser(user.uid);
          const novel = novels.find(n => n.id === selectedNovelId);
          if (novel) {
            openDocument(selectedNovelId, novel.title);
          } else {
            openDocument(selectedNovelId, selectedNovelId);
          }
        } catch (error) {
          console.error('Error loading novel for tab:', error);
          openDocument(selectedNovelId, selectedNovelId);
        }
      }
    };
    loadNovelForTab();
  }, [selectedNovelId, openDocument, user]);

  useEffect(() => {
    if (selectedChapterId) {
      // Jump to chapter in content - this will be handled by the rich text editor
      // For now, we'll just scroll to the top
      window.scrollTo(0, 0);
    }
  }, [selectedChapterId, content]);

  // Update tab titles when novels data changes and remove deleted documents
  useEffect(() => {
    if (novels && novels.length >= 0) {
      setOpenDocuments(prev => {
        // Filter out documents that no longer exist in the novels list
        const filteredDocs = prev.filter(doc => {
          // Keep 'lore' and other special documents
          if (doc.id === 'lore') return true;
          // Only keep documents that still exist in novels list
          return novels.find(n => n.id === doc.id);
        });
        
        // Update titles for remaining documents
        const updatedDocs = filteredDocs.map(doc => {
          const updatedNovel = novels.find(n => n.id === doc.id);
          if (updatedNovel) {
            return { ...doc, title: updatedNovel.title };
          }
          return doc;
        });

        // If the currently active document was deleted, activate the most recent remaining document
        const currentActiveDoc = prev.find(doc => doc.isActive);
        const activeDocStillExists = updatedDocs.find(doc => doc.id === currentActiveDoc?.id);
        
        if (currentActiveDoc && !activeDocStillExists && updatedDocs.length > 0) {
          // Find the most recently accessed document to make active
          const sortedByDate = updatedDocs.sort((a, b) => 
            new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
          );
          return sortedByDate.map((doc, index) => ({
            ...doc,
            isActive: index === 0
          }));
        }

        // Clean up OnlyOffice refs for deleted documents
        const deletedDocIds = prev.filter(doc => !updatedDocs.find(updated => updated.id === doc.id)).map(doc => doc.id);
        deletedDocIds.forEach(docId => {
          onlyOfficeRefs.current.delete(docId);
        });

        return updatedDocs;
      });
    }
  }, [novels]);

  // Update tab title when novel data changes
  useEffect(() => {
    const updateTabTitle = async () => {
      if (novel && user) {
        setOpenDocuments(prev =>
          prev.map(doc => 
            doc.id === novel.id 
              ? { ...doc, title: novel.title }
              : doc
          )
        );
      }
    };
    updateTabTitle();
  }, [novel]);

  const loadNovel = async () => {
    if (!user || !selectedNovelId) return;
    
    try {
      const novels = await getNovelsByUser(user.uid);
      const currentNovel = novels.find(n => n.id === selectedNovelId);
      
      if (currentNovel) {
        setNovel(currentNovel);
        setTitle(currentNovel.title);
        setContent(currentNovel.description || ''); // Empty string for new novels
      }
    } catch (error) {
      console.error('Error loading novel:', error);
    } finally {
      setIsLoadingNovel(false);
    }
  };

  const saveContent = useCallback(async () => {
    if (!novel || !user) return;
    
    setSaving(true);
    try {
      await updateNovel(novel.id, {
        title,
        description: content,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        updatedAt: new Date()
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving novel:', error);
    } finally {
      setSaving(false);
    }
  }, [novel, user, title, content]);

  // Expose saveContent function to parent component
  useImperativeHandle(ref, () => ({
    saveContent
  }), [saveContent]);

  // Save all documents before page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Force save all open documents
      const savePromises = openDocuments.map(async (doc) => {
        const ref = onlyOfficeRefs.current.get(doc.id);
        if (ref && ref.forceSave) {
          try {
            await ref.forceSave();
          } catch (error) {
            console.error(`Error saving document ${doc.id} before unload:`, error);
          }
        }
      });
      
      await Promise.all(savePromises);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [openDocuments]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  // Auto-save on content changes with debouncing
  useEffect(() => {
    if (content && novel) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (5 seconds after last change)
      saveTimeoutRef.current = setTimeout(() => {
        saveContent();
      }, 5000);
    }
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, novel, saveContent]);

  const getActiveDocument = () => {
    return openDocuments.find(doc => doc.isActive);
  };

  const handleTabClose = (docId: string) => {
    const docIndex = openDocuments.findIndex(doc => doc.id === docId);
    if (docIndex === -1) return;
    
    // Save in background before closing (non-blocking)
    const ref = onlyOfficeRefs.current.get(docId);
    if (ref && ref.forceSave) {
      ref.forceSave().catch(error => {
        console.error('Error saving document before closing:', error);
      });
    }
    
    // Close immediately without waiting
    closeDocument(docId);
  };

  const handleTabChange = (docId: string) => {
    // Save current active document in background (non-blocking)
    const currentActiveDoc = openDocuments.find(doc => doc.isActive);
    if (currentActiveDoc && currentActiveDoc.id !== docId) {
      const ref = onlyOfficeRefs.current.get(currentActiveDoc.id);
      if (ref && ref.forceSave) {
        // Save in background without blocking the UI
        ref.forceSave().catch(error => {
          console.error('Background save error:', error);
        });
      }
    }
    
    // Switch immediately without waiting
    switchToDocument(docId);
    
    // Notify parent to update navigation selection
    if (onTabChange) {
      onTabChange(docId);
    }
  };

  const handleTabReorder = (reorderedDocs: Array<{id: string; title: string; isActive: boolean; isDirty: boolean; lastAccessed: Date}>) => {
    setOpenDocuments(reorderedDocs);
  };

  const renderDocumentEditor = (doc: any) => {
    if (!doc) return null;
    
    switch (editorType) {
      case 'google-docs':
        return (
          <GoogleDocsEditor
            key={doc.id}
            documentId={doc.id}
            documentTitle={doc.title}
            initialContent={doc.content || ''}
            onSave={(content) => {
              setOpenDocuments(prev =>
                prev.map(x => 
                  x.id === doc.id 
                    ? { ...x, isDirty: content !== undefined }
                    : x
                )
              );
            }}
            onError={(error) => {
              console.error('Google Docs error:', error);
            }}
          />
        );
      
      case 'onlyoffice':
        return (
          <OnlyOfficeEditor
            key={doc.id}
            ref={(instance) => {
              if (instance) {
                onlyOfficeRefs.current.set(doc.id, instance);
              }
            }}
            documentId={doc.id}
            documentTitle={doc.title}
            onSave={(content) => {
              setOpenDocuments(prev =>
                prev.map(x => 
                  x.id === doc.id 
                    ? { ...x, isDirty: content !== undefined }
                    : x
                )
              );
            }}
            onError={(error) => {
              console.error('OnlyOffice tab error:', error);
            }}
            height="100%"
            width="100%"
          />
        );
      
      case 'simple':
        return (
          <SimpleDocumentEditor
            key={doc.id}
            novelId={doc.id}
            initialContent={doc.content || ''}
            onContentChange={(content) => {
              setOpenDocuments(prev =>
                prev.map(x => 
                  x.id === doc.id 
                    ? { ...x, isDirty: content !== undefined }
                    : x
                )
              );
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full min-h-0 overflow-hidden">
             {/* Document Tabs */}
             {openDocuments.length > 0 && (
               <MultiDocumentTabs
                 openDocuments={openDocuments.map(doc => ({
                   id: doc.id,
                   title: doc.title,
                   isActive: doc.isActive || false,
                   isDirty: doc.isDirty || false,
                   lastAccessed: doc.lastAccessed
                 }))}
                 onTabChange={handleTabChange}
                 onTabClose={handleTabClose}
                 onTabReorder={handleTabReorder}
                 activeDocumentId={getActiveDocument()?.id || null}
               />
             )}

      {/* Document Editor */}
      <div className="flex-1 min-h-0 relative">
        {isLoadingNovel ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              <div className="text-slate-400 text-lg">Loading novel...</div>
            </div>
          </div>
        ) : openDocuments.length > 0 ? (
          // Render only the active document
          <>
            {openDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className={`absolute inset-0 ${doc.isActive ? 'z-10' : 'z-0 hidden'}`}
              >
                {renderDocumentEditor(doc)}
              </div>
            ))}
          </>
        ) : (
          // Default empty state
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-slate-400 text-lg">Select a document to start editing</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

MainEditor.displayName = 'MainEditor';

export default MainEditor;

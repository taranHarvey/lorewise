'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

interface SeparatePagesEditorProps {
  content: string;
  onSave: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

interface Page {
  id: string;
  content: string;
}

export default function SeparatePagesEditor({
  content,
  onSave,
  title,
  onTitleChange,
}: SeparatePagesEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [pages, setPages] = useState<Page[]>([{ id: '1', content: '' }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const lastContentRef = useRef<string>('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorsRef = useRef<any[]>([]);

  // Page dimensions in pixels (6x9 inches at 96 DPI)
  const PAGE_WIDTH = 6 * 96; // 576px
  const PAGE_HEIGHT = 9 * 96; // 864px

  // Initialize pages from content
  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      
      // Only show loading for initial content load, not for page breaks
      if (!isContentLoaded) {
        setIsLoading(true);
        
        // Small delay to show loading state only for initial load
        setTimeout(() => {
          parseContentToPages(content);
          setIsLoading(false);
          setIsContentLoaded(true);
        }, 100);
      } else {
        // For subsequent updates, only parse if content structure actually changed
        const currentCombinedContent = pages.map(page => {
          const pageContent = page.content.trim() || '<p><br></p>';
          return pageContent;
        }).join('<div class="page-break-marker"></div>');
        
        // Only parse if the combined content is significantly different
        if (currentCombinedContent !== content) {
          parseContentToPages(content);
        }
      }
    }
  }, [content, isContentLoaded, pages]);

  // Reset editors when content changes significantly (novel switch)
  useEffect(() => {
    if (content !== lastContentRef.current) {
      // Clear all editor references when switching novels
      editorsRef.current = [];
    }
  }, [content]);

  // Ensure pageRefs array is properly sized
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, pages.length);
  }, [pages.length]);

  const parseContentToPages = (htmlContent: string) => {
    if (!htmlContent.trim()) {
      setPages([{ id: '1', content: '' }]);
      return;
    }

    // Split content by page break markers
    const pageContents = htmlContent.split(/<div class="page-break-marker"[^>]*><\/div>/);
    
    const newPages: Page[] = [];

    pageContents.forEach((pageContent, index) => {
      // Always create a page, even if content is empty (for blank pages)
      // Convert explicit blank page markers back to empty content
      let processedContent = pageContent.trim();
      if (processedContent === '<p><br></p>' || processedContent === '<p></p>') {
        processedContent = '';
      }
      
      newPages.push({
        id: (index + 1).toString(),
        content: processedContent
      });
    });

    // If no page breaks found, create a single page
    if (newPages.length === 0) {
      newPages.push({ id: '1', content: htmlContent.trim() });
    }
    
    // Only update pages if the structure actually changed
    setPages(prevPages => {
      // Check if the number of pages or content has actually changed
      if (prevPages.length !== newPages.length) {
        return newPages;
      }
      
      // Check if content has changed significantly
      const hasContentChange = newPages.some((newPage, index) => {
        const prevPage = prevPages[index];
        return !prevPage || prevPage.content !== newPage.content;
      });
      
      if (hasContentChange) {
        return newPages;
      }
      
      return prevPages;
    });
  };

  const updatePageContent = (pageIndex: number, newContent: string) => {
    setPages(prevPages => {
      const updatedPages = [...prevPages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        content: newContent
      };
      
      // Debounced save with updated pages
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        const combinedContent = updatedPages.map(page => {
          // Ensure blank pages have explicit content
          const pageContent = page.content.trim() || '<p><br></p>';
          return pageContent;
        }).join('<div class="page-break-marker"></div>');
        onSave(combinedContent);
      }, 1000); // Increased delay to reduce frequency
      
      return updatedPages;
    });
  };

  const insertPageBreak = () => {
    const newPageId = (pages.length + 1).toString();
    const newPage: Page = {
      id: newPageId,
      content: ''
    };

    // Insert the new page after the current page
    setPages(prevPages => {
      const newPages = [...prevPages];
      newPages.splice(currentPageIndex + 1, 0, newPage);
      
      // Save the updated page structure immediately
      setTimeout(() => {
        const combinedContent = newPages.map(page => {
          // Ensure blank pages have explicit content
          const pageContent = page.content.trim() || '<p><br></p>';
          return pageContent;
        }).join('<div class="page-break-marker"></div>');
        onSave(combinedContent);
      }, 50);
      
      return newPages;
    });
    
    const newPageIndex = currentPageIndex + 1;
    setCurrentPageIndex(newPageIndex);

    // Simple scroll and focus - no complex timing
    setTimeout(() => {
      const newPageElement = pageRefs.current[newPageIndex];
      if (newPageElement) {
        // Just scroll to the element
        newPageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 200);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length <= 1) return; // Don't delete the last page
    
    setPages(prevPages => {
      const newPages = [...prevPages];
      const pageToDelete = newPages[pageIndex];
      
      // If there's a previous page, merge the content
      if (pageIndex > 0) {
        const previousPage = newPages[pageIndex - 1];
        const currentPageContent = pageToDelete.content.trim();
        const previousPageContent = previousPage.content.trim();
        
        // Merge content properly
        let mergedContent = '';
        if (previousPageContent && currentPageContent && 
            previousPageContent !== '<p><br></p>' && previousPageContent !== '<p></p>' &&
            currentPageContent !== '<p><br></p>' && currentPageContent !== '<p></p>') {
          // Both pages have content - merge them
          mergedContent = previousPageContent + currentPageContent;
        } else if (previousPageContent && previousPageContent !== '<p><br></p>' && previousPageContent !== '<p></p>') {
          // Only previous page has content
          mergedContent = previousPageContent;
        } else if (currentPageContent && currentPageContent !== '<p><br></p>' && currentPageContent !== '<p></p>') {
          // Only current page has content
          mergedContent = currentPageContent;
        } else {
          // Both pages are empty
          mergedContent = '<p><br></p>';
        }
        
        // Update the previous page with merged content
        newPages[pageIndex - 1] = {
          ...previousPage,
          content: mergedContent
        };
        
        // Remove the current page
        newPages.splice(pageIndex, 1);
        
        // Update current page index to the merged page
        setCurrentPageIndex(pageIndex - 1);
      } else {
        // If deleting the first page, just remove it
        newPages.splice(pageIndex, 1);
        setCurrentPageIndex(0);
      }
      
      // Save the updated page structure
      setTimeout(() => {
        const combinedContent = newPages.map(page => {
          const pageContent = page.content.trim() || '<p><br></p>';
          return pageContent;
        }).join('<div class="page-break-marker"></div>');
        onSave(combinedContent);
      }, 50);
      
      return newPages;
    });
    
    // Focus the editor on the previous page at the end of its content
    setTimeout(() => {
      const newCurrentPageIndex = Math.max(0, currentPageIndex - 1);
      const prevEditor = editorsRef.current[newCurrentPageIndex]?.editor;
      if (prevEditor) {
        prevEditor.commands.focus('end');
      }
    }, 100);
  };

  const scrollToPage = (pageIndex: number) => {
    const pageElement = pageRefs.current[pageIndex];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: scroll to bottom of container
      const container = document.querySelector('.flex-1.overflow-auto.bg-gray-100');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const scrollToNewPage = (pageIndex: number) => {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      const attempts = [
        () => {
          const pageElement = pageRefs.current[pageIndex];
          if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return true;
          }
          return false;
        },
        () => {
          const container = document.querySelector('.flex-1.overflow-auto.bg-gray-100');
          if (container) {
            // Calculate scroll position for the new page
            const pageHeight = PAGE_HEIGHT + 32; // page height + margin
            const scrollPosition = pageIndex * pageHeight;
            container.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            return true;
          }
          return false;
        },
        () => {
          // Last resort: scroll to very bottom
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          return true;
        }
      ];

      for (const attempt of attempts) {
        if (attempt()) break;
      }
    });
  };

  // Global keyboard shortcuts for page management
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter for page break
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        insertPageBreak();
      }
      
      // Delete/Backspace at start of page for page deletion
      if ((event.key === 'Delete' || event.key === 'Backspace') && pages.length > 1) {
        // Check if we're in an editor and at the start
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.classList.contains('ProseMirror')) {
          // Find which page editor is active
          const pageElement = activeElement.closest('.novel-page-separate');
          if (pageElement) {
            const pageIndex = Array.from(pageElement.parentElement?.children || []).indexOf(pageElement);
            
            if (pageIndex > 0) {
              // Find the editor by looking at the page element directly
              const editorElement = pageElement.querySelector('.ProseMirror');
              
              if (editorElement) {
                // Find the editor instance from the editorsRef array
                let editor = null;
                for (let i = 0; i < editorsRef.current.length; i++) {
                  if (editorsRef.current[i] && editorsRef.current[i].view.dom === editorElement) {
                    editor = editorsRef.current[i];
                    break;
                  }
                }
                
                if (editor) {
                  const { from, to } = editor.state.selection;
                  
                  // Check if cursor is at or near the beginning (accounting for empty paragraphs)
                  const isAtStart = from <= 1 && to <= 1;
                  
                  if (isAtStart) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    deletePage(pageIndex);
                    
                    // Focus the previous page
                    setTimeout(() => {
                      const previousPageElement = pageRefs.current[pageIndex - 1];
                      if (previousPageElement) {
                        const editorElement = previousPageElement.querySelector('.ProseMirror');
                        if (editorElement) {
                          (editorElement as HTMLElement).focus();
                          const prevEditor = editorsRef.current[pageIndex - 1]?.editor;
                          if (prevEditor) {
                            prevEditor.commands.focus('end');
                          }
                        }
                      }
                    }, 50);
                  }
                }
              }
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [pages.length, insertPageBreak, deletePage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading || !isContentLoaded) {
    return (
      <div className="flex flex-col h-full bg-slate-900">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">{title || 'Untitled Novel'}</h2>
          </div>
        </div>
        
        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            <div className="text-slate-400 text-lg">Loading document...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">{title || 'Untitled Novel'}</h2>
          <div className="text-sm text-slate-400">
            Page {currentPageIndex + 1} of {pages.length}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={insertPageBreak}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Insert Page Break (Ctrl+Enter)
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Pages Container */}
          <div className="space-y-8">
            {pages.map((page, index) => (
              <PageEditor
                key={`page-${page.id}-${index}`}
                page={page}
                pageIndex={index}
                pageRef={(el) => pageRefs.current[index] = el}
                editorRef={(editor) => editorsRef.current[index] = editor}
                onContentChange={(newContent) => updatePageContent(index, newContent)}
                onPageClick={() => setCurrentPageIndex(index)}
                onDeletePage={() => deletePage(index)}
                pageWidth={PAGE_WIDTH}
                pageHeight={PAGE_HEIGHT}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual page editor component
function PageEditor({ 
  page, 
  pageIndex, 
  pageRef, 
  editorRef,
  onContentChange,
  onPageClick,
  onDeletePage,
  pageWidth, 
  pageHeight 
}: {
  page: Page;
  pageIndex: number;
  pageRef: (el: HTMLDivElement | null) => void;
  editorRef: (editor: any) => void;
  onContentChange: (content: string) => void;
  onPageClick: () => void;
  onDeletePage: () => void;
  pageWidth: number;
  pageHeight: number;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: page.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onContentChange(newContent);
    },
    onFocus: () => {
      // Don't automatically track page clicks on focus
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none novel-prose cursor-text',
        style: `font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.75; text-align: justify;`,
      },
    },
  });

  // Update editor content when page content changes
  useEffect(() => {
    if (editor && page.content !== editor.getHTML()) {
      editor.commands.setContent(page.content);
    }
  }, [editor, page.content]);

  // Register the editor with the parent
  useEffect(() => {
    if (editor) {
      editorRef(editor);
    }
  }, [editor, editorRef]);

  // Handle Delete key at the beginning of a page
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Delete or Backspace key is pressed
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const { from, to } = editor.state.selection;
        const isAtStart = from === 0 && to === 0;
        
        // Only trigger if cursor is at the very beginning and there's a previous page
        if (isAtStart && pageIndex > 0) {
          event.preventDefault();
          event.stopPropagation();
          
          onDeletePage();
          
          // Focus the previous page after deletion
          setTimeout(() => {
            const previousPageElement = pageRefs.current[pageIndex - 1];
            if (previousPageElement) {
              const editorElement = previousPageElement.querySelector('.ProseMirror');
              if (editorElement) {
                (editorElement as HTMLElement).focus();
                // Place cursor at the end of the merged content
                const prevEditor = editorsRef.current[pageIndex - 1]?.editor;
                if (prevEditor) {
                  prevEditor.commands.focus('end');
                }
              }
            }
          }, 100);
        }
      }
    };

    // Use both editor events and document events for better coverage
    editor.on('keydown', handleKeyDown);
    
    // Also listen on the editor DOM element for additional coverage
    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown);
    
    return () => {
      editor.off('keydown', handleKeyDown);
      editorElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, pageIndex, onDeletePage]);

  // Handle clicks to maintain focus
  const handlePageClick = () => {
    onPageClick();
    // Simple focus without complex timing
    if (editor && !editor.isDestroyed) {
      editor.commands.focus();
    }
  };

  // Add a global click handler to maintain focus
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // If clicking within this page, maintain focus
      const pageElement = pageRef.current;
      if (pageElement && pageElement.contains(event.target as Node)) {
        if (editor && !editor.isDestroyed) {
          editor.commands.focus();
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [editor]);



  // Simple focus management - no cursor position restoration
  useEffect(() => {
    if (!editor) return;

    // Just ensure the editor maintains focus when it should
    const handleFocus = () => {
      // Editor gained focus - this is good
    };

    const handleBlur = () => {
      // Editor lost focus - let it be, don't force restoration
    };

    // Listen for focus events
    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor]);

  return (
    <div
      ref={pageRef}
      className="bg-white shadow-lg rounded-lg novel-page-separate"
      style={{
        width: `${pageWidth}px`,
        height: `${pageHeight}px`,
        margin: '0 auto'
      }}
      onClick={handlePageClick}
    >
      <div className="p-8 h-full">
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none focus:outline-none novel-prose cursor-text h-full"
          style={{ 
            color: 'black',
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            lineHeight: '1.75',
            textAlign: 'justify',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}
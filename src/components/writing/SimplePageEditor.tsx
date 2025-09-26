'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PageBreak } from './PageBreakExtension';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  DocumentPlusIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

// Page interface
interface Page {
  id: string;
  content: string;
  height: number;
}

// Page sizes
const PAGE_SIZES = {
  '6x9': { name: '6" × 9"', width: 6, height: 9 },
  '8.5x11': { name: '8.5" × 11"', width: 8.5, height: 11 },
};

interface SimplePageEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function SimplePageEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved,
  title,
  onTitleChange
}: SimplePageEditorProps) {
  const [pages, setPages] = useState<Page[]>([
    { id: '1', content: '', height: 0 }
  ]);
  const [currentPageId, setCurrentPageId] = useState('1');
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('6x9');
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  
  const pageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isInternalUpdate = useRef(false);
  const lastContentRef = useRef(content);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageSize = PAGE_SIZES[pageSize];
  
  // Convert inches to pixels (96 DPI)
  const inchesToPixels = (inches: number) => inches * 96;

  // Calculate available height for content (page height - margins)
  const getAvailableHeight = () => {
    const pageHeight = inchesToPixels(currentPageSize.height);
    const margins = inchesToPixels(1.5) * 2; // 1.5 inch margins top and bottom
    return pageHeight - margins;
  };




  // Editor for the entire document
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      PageBreak.configure({
        HTMLAttributes: {
          class: 'page-break',
        },
      }),
    ],
    content: pages.map(p => p.content).join('--- PAGE BREAK ---'),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleContentChange(html);
      
      // Hide page break text after updates
      setTimeout(() => {
        const editorElement = editor.view.dom;
        const paragraphs = editorElement.querySelectorAll('p');
        paragraphs.forEach(p => {
          if (p.textContent?.includes('--- PAGE BREAK ---')) {
            p.style.display = 'none';
          }
        });
      }, 0);
    },
    onCreate: ({ editor }) => {
      // Clean any page break markers when editor is created
      const currentContent = editor.getHTML();
      const cleanedContent = currentContent
        .replace(/---\s*Page\s*Break\s*---/gi, '')
        .replace(/<div[^>]*class="page-break-marker"[^>]*>.*?<\/div>/gi, '')
        .replace(/<div[^>]*class="page-break-visual"[^>]*>.*?<\/div>/gi, '')
        .trim();
      
      if (currentContent !== cleanedContent) {
        editor.commands.setContent(cleanedContent);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-full',
        style: `font-family: ${fontFamily}; font-size: ${fontSize}pt; line-height: 1.5; color: black;`,
      },
    },
  });

  // Handle content change and automatic pagination
  const handleContentChange = useCallback((newContent: string) => {
    if (!editor) return;
    
    // Check if content overflows the page
    const editorElement = editor.view.dom;
    const contentHeight = editorElement.scrollHeight;
    const availableHeight = getAvailableHeight();
    
    // If content overflows, we need to handle pagination
    if (contentHeight > availableHeight) {
      // For now, we'll let the content overflow and add a visual indicator
      // In a full implementation, you'd split content across multiple pages
      console.log('Content overflow detected - would need pagination logic here');
    }
    
    // Update all pages based on the complete document content
    const pageContents = newContent.split('--- PAGE BREAK ---');
    const newPages: Page[] = pageContents.map((pageContent, index) => ({
      id: `page-${Date.now()}-${index + 1}`,
      content: pageContent.trim(),
      height: 0
    }));
    setPages(newPages);
  }, [editor, getAvailableHeight]);

  // Insert manual page break
  const insertPageBreak = useCallback(() => {
    if (editor) {
      // Insert page break using the extension
      editor.commands.setPageBreak();
    }
  }, [editor]);


  // Load content from props - only run when content prop actually changes from external source
  useEffect(() => {
    // Only update if content has actually changed from external source
    if (content === lastContentRef.current) {
      return;
    }
    
    lastContentRef.current = content;
    
    if (content && content.trim()) {
      // Split content by page breaks and clean up any visible page break text
      const pageContents = content.split('--- PAGE BREAK ---');
      const newPages: Page[] = pageContents.map((pageContent, index) => ({
        id: `page-${Date.now()}-${index + 1}`, // Use timestamp for unique IDs
        content: pageContent.trim()
          .replace(/---\s*Page\s*Break\s*---/gi, '')
          .replace(/<div[^>]*class="page-break-marker"[^>]*>.*?<\/div>/gi, '')
          .replace(/<div[^>]*class="page-break-visual"[^>]*>.*?<\/div>/gi, '')
          .trim(),
        height: 0
      }));
      
      setPages(newPages);
      setCurrentPageId(newPages[newPages.length - 1].id);
    } else {
      // If content is empty, create a single empty page
      const emptyPage: Page = {
        id: `page-${Date.now()}-1`,
        content: '',
        height: 0
      };
      setPages([emptyPage]);
      setCurrentPageId(emptyPage.id);
    }
  }, [content]); // Only run when content prop changes


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter for page break
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        insertPageBreak();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [insertPageBreak]);

  // Debounced parent content updates
  useEffect(() => {
    if (!editor) return;
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const editorContent = editor.getHTML();
      onChange(editorContent);
    }, 500); // 500ms debounce
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [editor, onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex flex-col h-full bg-slate-900 items-center justify-center">
        <div className="text-slate-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Font Controls */}
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded text-white text-sm px-2 py-1"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
            </select>
            
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded text-white text-sm px-2 py-1"
            >
              {[10, 11, 12, 14, 16, 18, 20].map(size => (
                <option key={size} value={size}>{size}pt</option>
              ))}
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as keyof typeof PAGE_SIZES)}
              className="bg-slate-700 border border-slate-600 rounded text-white text-sm px-2 py-1"
            >
              {Object.entries(PAGE_SIZES).map(([key, size]) => (
                <option key={key} value={key}>{size.name}</option>
              ))}
            </select>

            {/* Formatting */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="p-2 rounded text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Bold"
              >
                <BoldIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="p-2 rounded text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Italic"
              >
                <ItalicIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className="p-2 rounded text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Page Break */}
            <button
              onClick={insertPageBreak}
              className="p-2 rounded text-slate-400 hover:bg-slate-700 hover:text-white"
              title="Insert Page Break (Ctrl+Enter)"
            >
              <DocumentPlusIcon className="h-4 w-4" />
            </button>

            {/* Save */}
            <button
              onClick={onSave}
              className="p-2 rounded text-slate-400 hover:bg-slate-700 hover:text-white"
              title="Save"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Page Info */}
          <div className="flex items-center space-x-4 text-sm text-slate-300">
            <span>Page {pages.findIndex(p => p.id === currentPageId) + 1} of {pages.length}</span>
            <span>{currentPageSize.name}</span>
            {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
          </div>
        </div>
      </div>

      {/* Google Docs-style Paginated Document */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Render multiple fixed-height pages */}
          {Array.from({ length: Math.max(1, Math.ceil(pages.length / 2)) }, (_, pageIndex) => (
            <div 
              key={pageIndex}
              className="document-page bg-white shadow-lg mx-auto"
              style={{
                width: `${inchesToPixels(currentPageSize.width)}px`,
                height: `${inchesToPixels(currentPageSize.height)}px`,
                padding: `${inchesToPixels(1.5)}px`,
                boxSizing: 'border-box',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Page Content */}
              <div 
                className="page-content"
                style={{ 
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}pt`,
                  lineHeight: '1.5',
                  color: 'black',
                  flex: 1,
                  overflow: 'hidden',
                  padding: '0',
                  margin: '0',
                }}
              >
                {/* Show editor only on the last page, static content on others */}
                {pageIndex === Math.max(0, Math.ceil(pages.length / 2) - 1) ? (
                  <EditorContent editor={editor} />
                ) : (
                  <div 
                    className="static-content"
                    style={{
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}pt`,
                      lineHeight: '1.5',
                      color: 'black',
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: pages.slice(pageIndex * 2, (pageIndex + 1) * 2)
                        .map(p => p.content)
                        .join('<div class="page-break-visual"></div>') || ''
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>{pages.length} pages</span>
          <span>{currentPageSize.name} • {fontSize}pt • {fontFamily}</span>
        </div>
      </div>
    </div>
  );
}

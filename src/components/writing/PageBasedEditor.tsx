'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import { useState, useCallback, useEffect } from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  StrikethroughIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  NumberedListIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  MinusIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  DocumentPlusIcon,
  PrinterIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// KDP Page Sizes (in inches)
const PAGE_SIZES = {
  '5x8': { name: '5" × 8"', width: 5, height: 8, description: 'Mass Market Paperback' },
  '5.5x8.5': { name: '5.5" × 8.5"', width: 5.5, height: 8.5, description: 'Trade Paperback' },
  '6x9': { name: '6" × 9"', width: 6, height: 9, description: 'Standard Trade (Most Popular)' },
  '8.5x11': { name: '8.5" × 11"', width: 8.5, height: 11, description: 'Letter Size' },
  'custom': { name: 'Custom', width: 6, height: 9, description: 'Custom Size' }
};

interface PageBasedEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
}

export default function PageBasedEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved 
}: PageBasedEditorProps) {
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('6x9');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Convert inches to pixels (assuming 96 DPI)
  const inchesToPixels = (inches: number) => inches * 96;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      calculatePageCount(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-full page-editor',
      },
    },
  });

  const calculatePageCount = useCallback((html: string) => {
    // Simple page calculation based on content length
    // In a real implementation, you'd calculate based on actual page dimensions
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textLength = tempDiv.textContent?.length || 0;
    const wordsPerPage = 250; // Average words per page for 6x9
    const pages = Math.ceil(textLength / 5 / wordsPerPage); // Rough calculation
    setTotalPages(Math.max(1, pages));
  }, []);

  useEffect(() => {
    if (content) {
      calculatePageCount(content);
    }
  }, [content, calculatePageCount]);

  const insertPageBreak = () => {
    if (!editor) return;
    editor.chain().focus().insertContent('<div class="page-break"></div>').run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string; 
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-purple-600 text-white' 
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const handlePageSizeChange = (newPageSize: keyof typeof PAGE_SIZES) => {
    setPageSize(newPageSize);
    setShowPageSettings(false);
  };

  const currentPageSize = PAGE_SIZES[pageSize];

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Page Settings */}
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowPageSettings(!showPageSettings)}
                title="Page Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </ToolbarButton>
              {showPageSettings && (
                <div className="absolute top-12 left-0 bg-slate-700 border border-slate-600 rounded-lg p-4 z-50 min-w-64">
                  <h3 className="text-white font-semibold mb-3">Page Size</h3>
                  <div className="space-y-2">
                    {Object.entries(PAGE_SIZES).map(([key, size]) => (
                      <button
                        key={key}
                        onClick={() => handlePageSizeChange(key as keyof typeof PAGE_SIZES)}
                        className={`w-full text-left p-2 rounded ${
                          pageSize === key 
                            ? 'bg-purple-600 text-white' 
                            : 'text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="font-medium">{size.name}</div>
                        <div className="text-sm opacity-75">{size.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page Break */}
            <ToolbarButton
              onClick={insertPageBreak}
              title="Insert Page Break"
            >
              <DocumentPlusIcon className="h-5 w-5" />
            </ToolbarButton>

            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <BoldIcon className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <ItalicIcon className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon className="h-5 w-5" />
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              {[1, 2, 3].map((level) => (
                <ToolbarButton
                  key={level}
                  onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
                  isActive={editor.isActive('heading', { level: level as 1 | 2 | 3 })}
                  title={`Heading ${level}`}
                >
                  <span className="text-sm font-bold">H{level}</span>
                </ToolbarButton>
              ))}
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <ListBulletIcon className="h-5 w-5" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <NumberedListIcon className="h-5 w-5" />
              </ToolbarButton>
            </div>

            {/* Save */}
            <ToolbarButton
              onClick={onSave}
              title="Save"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </ToolbarButton>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-1 text-slate-400 hover:text-white"
                disabled={currentPage <= 1}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className="p-1 text-slate-400 hover:text-white"
                disabled={currentPage >= totalPages}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-slate-400">
              {currentPageSize.name}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-8 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <div 
            className="bg-white shadow-lg mx-auto page-container"
            style={{
              width: `${inchesToPixels(currentPageSize.width)}px`,
              minHeight: `${inchesToPixels(currentPageSize.height)}px`,
              padding: '1.5in', // 1.5 inch margins
              boxSizing: 'border-box',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">
            {editor.storage.characterCount.characters()} characters
          </span>
          <span className="text-slate-400">
            {editor.storage.characterCount.words()} words
          </span>
        </div>
        <div className="text-slate-400">
          {saving ? 'Saving...' : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
        </div>
      </div>
    </div>
  );
}

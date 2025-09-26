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
import { useState, useCallback, useEffect, useRef } from 'react';
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
  DocumentTextIcon,
  PaintBrushIcon,
  ViewColumnsIcon,
  RectangleStackIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// KDP Page Sizes (in inches)
const PAGE_SIZES = {
  '5x8': { name: '5" × 8"', width: 5, height: 8, description: 'Mass Market Paperback' },
  '5.5x8.5': { name: '5.5" × 8.5"', width: 5.5, height: 8.5, description: 'Trade Paperback' },
  '6x9': { name: '6" × 9"', width: 6, height: 9, description: 'Standard Trade (Most Popular)' },
  '8.5x11': { name: '8.5" × 11"', width: 8.5, height: 11, description: 'Letter Size' },
  'custom': { name: 'Custom', width: 6, height: 9, description: 'Custom Size' }
};

// Tab types for the menu system
type TabType = 'format' | 'layout' | 'page' | 'insert' | 'view';

interface EnhancedPageEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
}

export default function EnhancedPageEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved 
}: EnhancedPageEditorProps) {
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('6x9');
  const [activeTab, setActiveTab] = useState<TabType>('format');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageMargins, setPageMargins] = useState({ top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 });
  const [pageBorders, setPageBorders] = useState(true);
  const [headers, setHeaders] = useState({ enabled: false, text: '', showOnFirstPage: false });
  const [footers, setFooters] = useState({ enabled: false, text: '', showPageNumbers: true });
  const [zoom, setZoom] = useState(100);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textLength = tempDiv.textContent?.length || 0;
    const wordsPerPage = 250; // Average words per page for 6x9
    const pages = Math.ceil(textLength / 5 / wordsPerPage);
    setTotalPages(Math.max(1, pages));
  }, []);

  useEffect(() => {
    if (content) {
      calculatePageCount(content);
    }
  }, [content, calculatePageCount]);

  // Scroll-based page navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      
      // Calculate which page is currently in view
      const pageHeight = inchesToPixels(PAGE_SIZES[pageSize].height + 2); // +2 for margins
      const currentPageNum = Math.floor(scrollTop / pageHeight) + 1;
      setCurrentPage(Math.min(Math.max(1, currentPageNum), totalPages));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pageSize, totalPages]);

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

  const TabButton = ({ 
    tab, 
    children, 
    icon: Icon 
  }: { 
    tab: TabType; 
    children: React.ReactNode; 
    icon: React.ComponentType<any>; 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-purple-600 text-white' 
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );

  const handlePageSizeChange = (newPageSize: keyof typeof PAGE_SIZES) => {
    setPageSize(newPageSize);
  };

  const currentPageSize = PAGE_SIZES[pageSize];

  const renderFormatTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Text Formatting</h3>
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            title="Bold"
          >
            <BoldIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            title="Italic"
          >
            <ItalicIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            isActive={editor?.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="h-5 w-5" />
          </ToolbarButton>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Headings</h3>
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((level) => (
            <ToolbarButton
              key={level}
              onClick={() => editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
              isActive={editor?.isActive('heading', { level: level as 1 | 2 | 3 })}
              title={`Heading ${level}`}
            >
              <span className="text-sm font-bold">H{level}</span>
            </ToolbarButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Lists</h3>
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            title="Bullet List"
          >
            <ListBulletIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            title="Numbered List"
          >
            <NumberedListIcon className="h-5 w-5" />
          </ToolbarButton>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Page Margins (inches)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Top</label>
            <input
              type="number"
              value={pageMargins.top}
              onChange={(e) => setPageMargins(prev => ({ ...prev, top: parseFloat(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              step="0.1"
              min="0.5"
              max="3"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Bottom</label>
            <input
              type="number"
              value={pageMargins.bottom}
              onChange={(e) => setPageMargins(prev => ({ ...prev, bottom: parseFloat(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              step="0.1"
              min="0.5"
              max="3"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Left</label>
            <input
              type="number"
              value={pageMargins.left}
              onChange={(e) => setPageMargins(prev => ({ ...prev, left: parseFloat(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              step="0.1"
              min="0.5"
              max="3"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">Right</label>
            <input
              type="number"
              value={pageMargins.right}
              onChange={(e) => setPageMargins(prev => ({ ...prev, right: parseFloat(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              step="0.1"
              min="0.5"
              max="3"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Page Appearance</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pageBorders}
              onChange={(e) => setPageBorders(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-300">Show page borders</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPageTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Page Size</h3>
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
              <div className="font-medium text-sm">{size.name}</div>
              <div className="text-xs opacity-75">{size.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Page Elements</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={headers.enabled}
              onChange={(e) => setHeaders(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-300">Headers</span>
          </label>
          {headers.enabled && (
            <div className="ml-6 space-y-2">
              <input
                type="text"
                value={headers.text}
                onChange={(e) => setHeaders(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Header text"
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={headers.showOnFirstPage}
                  onChange={(e) => setHeaders(prev => ({ ...prev, showOnFirstPage: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-300">Show on first page</span>
              </label>
            </div>
          )}
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={footers.enabled}
              onChange={(e) => setFooters(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-300">Footers</span>
          </label>
          {footers.enabled && (
            <div className="ml-6 space-y-2">
              <input
                type="text"
                value={footers.text}
                onChange={(e) => setFooters(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Footer text"
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={footers.showPageNumbers}
                  onChange={(e) => setFooters(prev => ({ ...prev, showPageNumbers: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-300">Show page numbers</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Page Elements</h3>
        <div className="space-y-2">
          <button
            onClick={insertPageBreak}
            className="w-full flex items-center space-x-2 p-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors"
          >
            <DocumentPlusIcon className="h-4 w-4" />
            <span className="text-sm">Insert Page Break</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Media</h3>
        <div className="space-y-2">
          <button
            onClick={() => editor?.chain().focus().setImage({ src: 'https://via.placeholder.com/300x200' }).run()}
            className="w-full flex items-center space-x-2 p-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors"
          >
            <PhotoIcon className="h-4 w-4" />
            <span className="text-sm">Insert Image</span>
          </button>
          <button
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="w-full flex items-center space-x-2 p-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors"
          >
            <TableCellsIcon className="h-4 w-4" />
            <span className="text-sm">Insert Table</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Zoom</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 text-slate-400 hover:text-white"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-300 min-w-[3rem] text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1 text-slate-400 hover:text-white"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Page Info</h3>
        <div className="text-sm text-slate-300 space-y-1">
          <div>Current Page: {currentPage} of {totalPages}</div>
          <div>Page Size: {currentPageSize.name}</div>
          <div>Words: {editor?.storage.characterCount.words() || 0}</div>
          <div>Characters: {editor?.storage.characterCount.characters() || 0}</div>
        </div>
      </div>
    </div>
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Enhanced Toolbar with Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 p-2 border-b border-slate-700">
          <TabButton tab="format" icon={PaintBrushIcon}>Format</TabButton>
          <TabButton tab="layout" icon={ViewColumnsIcon}>Layout</TabButton>
          <TabButton tab="page" icon={RectangleStackIcon}>Page</TabButton>
          <TabButton tab="insert" icon={DocumentPlusIcon}>Insert</TabButton>
          <TabButton tab="view" icon={Bars3Icon}>View</TabButton>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'format' && renderFormatTab()}
          {activeTab === 'layout' && renderLayoutTab()}
          {activeTab === 'page' && renderPageTab()}
          {activeTab === 'insert' && renderInsertTab()}
          {activeTab === 'view' && renderViewTab()}
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between p-2 border-t border-slate-700">
          <div className="flex items-center space-x-2">
            <ToolbarButton onClick={onSave} title="Save">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </ToolbarButton>
            <span className="text-xs text-slate-400">
              {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {currentPageSize.name} • {zoom}%
          </div>
        </div>
      </div>

      {/* Editor Content with Scroll Navigation */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-100"
        style={{ zoom: `${zoom}%` }}
      >
        <div className="max-w-6xl mx-auto p-8">
          <div 
            className="bg-white shadow-lg mx-auto page-container"
            style={{
              width: `${inchesToPixels(currentPageSize.width)}px`,
              minHeight: `${inchesToPixels(currentPageSize.height)}px`,
              padding: `${inchesToPixels(pageMargins.top)}px ${inchesToPixels(pageMargins.right)}px ${inchesToPixels(pageMargins.bottom)}px ${inchesToPixels(pageMargins.left)}px`,
              boxSizing: 'border-box',
              border: pageBorders ? '2px solid #e5e7eb' : 'none',
            }}
          >
            {/* Header */}
            {headers.enabled && (currentPage > 1 || headers.showOnFirstPage) && (
              <div className="text-center text-xs text-gray-600 mb-4 pb-2 border-b border-gray-200">
                {headers.text}
              </div>
            )}

            {/* Editor Content */}
            <div style={{ minHeight: `calc(100% - ${headers.enabled ? '60px' : '0px'} - ${footers.enabled ? '60px' : '0px'})` }}>
              <EditorContent editor={editor} />
            </div>

            {/* Footer */}
            {footers.enabled && (
              <div className="text-center text-xs text-gray-600 mt-4 pt-2 border-t border-gray-200">
                {footers.text && <span className="mr-4">{footers.text}</span>}
                {footers.showPageNumbers && <span>Page {currentPage}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Navigation Indicator */}
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
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
}

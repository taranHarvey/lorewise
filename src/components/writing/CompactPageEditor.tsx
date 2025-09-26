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
  ChevronDownIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

// KDP Page Sizes (in inches)
const PAGE_SIZES = {
  '5x8': { name: '5" × 8"', width: 5, height: 8, description: 'Mass Market' },
  '5.5x8.5': { name: '5.5" × 8.5"', width: 5.5, height: 8.5, description: 'Trade Paperback' },
  '6x9': { name: '6" × 9"', width: 6, height: 9, description: 'Standard Trade' },
  '8.5x11': { name: '8.5" × 11"', width: 8.5, height: 11, description: 'Letter Size' },
  'custom': { name: 'Custom', width: 6, height: 9, description: 'Custom Size' }
};

interface CompactPageEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
}

export default function CompactPageEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved 
}: CompactPageEditorProps) {
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('6x9');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageMargins, setPageMargins] = useState({ top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 });
  const [pageBorders, setPageBorders] = useState(true);
  const [headers, setHeaders] = useState({ enabled: false, text: '', showOnFirstPage: false });
  const [footers, setFooters] = useState({ enabled: false, text: '', showPageNumbers: true });
  const [zoom, setZoom] = useState(100);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
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
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textLength = tempDiv.textContent?.length || 0;
    const wordsPerPage = 250;
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
      
      const pageHeight = inchesToPixels(PAGE_SIZES[pageSize].height + 2);
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
    title,
    className = ""
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string; 
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-slate-600 transition-colors ${className} ${
        isActive 
          ? 'bg-purple-600 text-white' 
          : 'text-slate-300 hover:text-white'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const ToolbarGroup = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center space-x-1 border-r border-slate-600 pr-2 mr-2 ${className}`}>
      {children}
    </div>
  );

  const currentPageSize = PAGE_SIZES[pageSize];

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Compact Horizontal Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700">
        {/* Main Toolbar Row */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left Side - Document Actions */}
          <div className="flex items-center space-x-2">
            <ToolbarButton onClick={onSave} title="Save">
              <DocumentArrowDownIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => window.print()} title="Print">
              <PrinterIcon className="h-4 w-4" />
            </ToolbarButton>
            <div className="text-xs text-slate-400 ml-2">
              {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
            </div>
          </div>

          {/* Center - Formatting Tools */}
          <div className="flex items-center space-x-4">
            {/* Text Formatting */}
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
              >
                <BoldIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
              >
                <ItalicIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Headings */}
            <ToolbarGroup>
              <select
                value={editor.isActive('heading1') ? 'h1' : editor.isActive('heading2') ? 'h2' : editor.isActive('heading3') ? 'h3' : 'normal'}
                onChange={(e) => {
                  if (e.target.value === 'normal') {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: parseInt(e.target.value.slice(1)) as 1 | 2 | 3 }).run();
                  }
                }}
                className="bg-slate-700 border border-slate-600 rounded text-white text-sm px-2 py-1"
                title="Text Style"
              >
                <option value="normal">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
            </ToolbarGroup>

            {/* Lists */}
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <ListBulletIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <NumberedListIcon className="h-4 w-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Alignment */}
            <ToolbarGroup>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
              >
                <span className="text-xs font-bold">L</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
              >
                <span className="text-xs font-bold">C</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
              >
                <span className="text-xs font-bold">R</span>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                title="Justify"
              >
                <span className="text-xs font-bold">J</span>
              </ToolbarButton>
            </ToolbarGroup>
          </div>

          {/* Right Side - Page & View Controls */}
          <div className="flex items-center space-x-2">
            {/* Insert Tools */}
            <ToolbarGroup className="border-r-0 mr-0">
              <ToolbarButton onClick={insertPageBreak} title="Insert Page Break">
                <DocumentPlusIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
                <TableCellsIcon className="h-4 w-4" />
              </ToolbarButton>
            </ToolbarGroup>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <ToolbarButton onClick={() => setZoom(Math.max(50, zoom - 10))} title="Zoom Out">
                <MagnifyingGlassMinusIcon className="h-4 w-4" />
              </ToolbarButton>
              <span className="text-sm text-slate-300 min-w-[3rem] text-center">{zoom}%</span>
              <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Zoom In">
                <MagnifyingGlassPlusIcon className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Page Settings */}
            <ToolbarButton onClick={() => setShowPageSettings(!showPageSettings)} title="Page Settings">
              <Cog6ToothIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Secondary Toolbar Row - Page Info & Stats */}
        <div className="flex items-center justify-between px-4 py-1 bg-slate-750 border-t border-slate-700">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Page {currentPage} of {totalPages}</span>
            <span>{currentPageSize.name}</span>
            <span>{editor.storage.characterCount.words()} words</span>
            <span>{editor.storage.characterCount.characters()} characters</span>
          </div>
          <div className="text-xs text-slate-400">
            {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Page Settings Dropdown */}
      {showPageSettings && (
        <div className="absolute top-20 right-4 z-50 bg-slate-700 border border-slate-600 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Page Settings</h3>
            <button
              onClick={() => setShowPageSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Page Size */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as keyof typeof PAGE_SIZES)}
                className="w-full bg-slate-600 border border-slate-500 rounded text-white text-sm p-2"
              >
                {Object.entries(PAGE_SIZES).map(([key, size]) => (
                  <option key={key} value={key}>
                    {size.name} - {size.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white"
            >
              <span>Advanced Settings</span>
              {showAdvancedSettings ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>

            {showAdvancedSettings && (
              <div className="space-y-4 pt-2 border-t border-slate-600">
                {/* Margins */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Margins (inches)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={pageMargins.top}
                      onChange={(e) => setPageMargins(prev => ({ ...prev, top: parseFloat(e.target.value) || 0 }))}
                      placeholder="Top"
                      className="bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                      step="0.1"
                      min="0.5"
                      max="3"
                    />
                    <input
                      type="number"
                      value={pageMargins.bottom}
                      onChange={(e) => setPageMargins(prev => ({ ...prev, bottom: parseFloat(e.target.value) || 0 }))}
                      placeholder="Bottom"
                      className="bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                      step="0.1"
                      min="0.5"
                      max="3"
                    />
                    <input
                      type="number"
                      value={pageMargins.left}
                      onChange={(e) => setPageMargins(prev => ({ ...prev, left: parseFloat(e.target.value) || 0 }))}
                      placeholder="Left"
                      className="bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                      step="0.1"
                      min="0.5"
                      max="3"
                    />
                    <input
                      type="number"
                      value={pageMargins.right}
                      onChange={(e) => setPageMargins(prev => ({ ...prev, right: parseFloat(e.target.value) || 0 }))}
                      placeholder="Right"
                      className="bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                      step="0.1"
                      min="0.5"
                      max="3"
                    />
                  </div>
                </div>

                {/* Headers & Footers */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pageBorders}
                      onChange={(e) => setPageBorders(e.target.checked)}
                      className="rounded border-slate-500 bg-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">Show page borders</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={headers.enabled}
                      onChange={(e) => setHeaders(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-slate-500 bg-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">Headers</span>
                  </label>
                  {headers.enabled && (
                    <input
                      type="text"
                      value={headers.text}
                      onChange={(e) => setHeaders(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Header text"
                      className="w-full bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                    />
                  )}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={footers.enabled}
                      onChange={(e) => setFooters(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-slate-500 bg-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">Footers</span>
                  </label>
                  {footers.enabled && (
                    <input
                      type="text"
                      value={footers.text}
                      onChange={(e) => setFooters(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Footer text"
                      className="w-full bg-slate-600 border border-slate-500 rounded text-white text-xs p-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}

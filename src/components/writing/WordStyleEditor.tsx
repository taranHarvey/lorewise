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
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
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
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  HomeIcon,
  DocumentPlusIcon as InsertIcon,
  ViewColumnsIcon as LayoutIcon,
  PaintBrushIcon as DesignIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ColorSwatchIcon,
  TextIcon,
  FontFamilyIcon,
  AdjustmentsHorizontalIcon,
  Square3Stack3DIcon,
  ClipboardIcon,
  PaintBrushIcon as FormatPainterIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  XMarkIcon as ClearIcon,
  SparklesIcon,
  PlusIcon,
  MinusIcon as DecreaseIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon as SortIcon,
  DocumentIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

// Page break marker (invisible)
const PAGE_BREAK_MARKER = '<div class="page-break-marker" style="display: none;"></div>';

// KDP Page Sizes (in inches)
const PAGE_SIZES = {
  '5x8': { name: '5" × 8"', width: 5, height: 8, description: 'Mass Market' },
  '5.5x8.5': { name: '5.5" × 8.5"', width: 5.5, height: 8.5, description: 'Trade Paperback' },
  '6x9': { name: '6" × 9"', width: 6, height: 9, description: 'Standard Trade' },
  '8.5x11': { name: '8.5" × 11"', width: 8.5, height: 11, description: 'Letter Size' },
  'custom': { name: 'Custom', width: 6, height: 9, description: 'Custom Size' }
};

// Tab types for the Word-style interface
type TabType = 'home' | 'insert' | 'layout' | 'design' | 'view';

interface WordStyleEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function WordStyleEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved,
  title,
  onTitleChange
}: WordStyleEditorProps) {
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('6x9');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageMargins, setPageMargins] = useState({ top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 });
  const [pageBorders, setPageBorders] = useState(true);
  const [headers, setHeaders] = useState({ enabled: false, text: '', showOnFirstPage: false });
  const [footers, setFooters] = useState({ enabled: false, text: '', showPageNumbers: true });
  const [zoom, setZoom] = useState(100);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [toolbarWidth, setToolbarWidth] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

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
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
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
      
      // Check for overflow and handle page creation
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        if (checkPageOverflow()) {
          handlePageOverflow();
        }
        
        // Update the parent with the combined content from all pages
        const combinedContent = getAllPagesContent();
        onChange(combinedContent);
      }, 50);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-full page-editor',
        style: `font-family: ${fontFamily}; font-size: ${fontSize}pt;`,
      },
    },
  });

  const [pages, setPages] = useState<string[]>(['']);
  const [pageHeights, setPageHeights] = useState<number[]>([]);
  const [currentEditingPage, setCurrentEditingPage] = useState(0); // 0-based index

  const currentPageSize = PAGE_SIZES[pageSize];

  // Function to get the complete content from all pages
  const getAllPagesContent = () => {
    if (pages.length <= 1) {
      return editor?.getHTML() || '';
    }
    
    // Combine all pages with page break markers
    return pages.map(page => page.trim()).join(PAGE_BREAK_MARKER);
  };

  const calculatePages = useCallback((html: string) => {
    if (!html.trim()) {
      setPages(['']);
      setTotalPages(1);
      return;
    }

    // Split content by page break markers
    const pageContents: string[] = [];
    const parts = html.split(/<div class="page-break-marker"[^>]*><\/div>/);
    
    // If no page breaks, check if content needs to be split due to overflow
    if (parts.length === 1) {
      const content = parts[0].trim();
      
      // Create a temporary element to measure content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      tempDiv.style.cssText = `
        width: ${inchesToPixels(currentPageSize.width - pageMargins.left - pageMargins.right)}px;
        font-family: ${fontFamily};
        font-size: ${fontSize}pt;
        line-height: 1.5;
        padding: 0;
        margin: 0;
        position: absolute;
        visibility: hidden;
        left: -9999px;
      `;
      document.body.appendChild(tempDiv);
      
      const contentHeight = tempDiv.scrollHeight;
      document.body.removeChild(tempDiv);
      
      // Calculate available height
      const pageHeight = inchesToPixels(currentPageSize.height);
      const topMargin = inchesToPixels(pageMargins.top);
      const bottomMargin = inchesToPixels(pageMargins.bottom);
      const headerHeight = headers.enabled && (currentPage > 1 || headers.showOnFirstPage) ? 32 : 0;
      const footerHeight = footers.enabled ? 32 : 0;
      const availableHeight = pageHeight - topMargin - bottomMargin - headerHeight - footerHeight;
      
      // If content fits in one page, keep it as one page
      if (contentHeight <= availableHeight) {
        setPages([content]);
        setTotalPages(1);
        return;
      }
      
      // Content overflows, so we need to split it
      // For now, just keep it as one page and let the overflow handler deal with it
      setPages([content]);
      setTotalPages(1);
      return;
    }
    
    // Process each part separated by page breaks
    parts.forEach(part => {
      const trimmedPart = part.trim();
      if (trimmedPart) {
        pageContents.push(trimmedPart);
      }
    });
    
    // Ensure we have at least one page
    if (pageContents.length === 0) {
      pageContents.push('');
    }
    
    setPages(pageContents);
    setTotalPages(pageContents.length);
  }, [currentPageSize, pageMargins, fontSize, fontFamily, headers, footers, currentPage]);

  const insertPageBreak = () => {
    if (!editor) return;
    // Insert an invisible page break marker
    editor.chain().focus().insertContent(PAGE_BREAK_MARKER).run();
    
    // Force a page recalculation after inserting a page break
    setTimeout(() => {
      const currentContent = editor.getHTML();
      calculatePages(currentContent);
    }, 50);
  };

  // Check if content overflows the current page within margins
  const checkPageOverflow = useCallback(() => {
    if (!editor || !containerRef.current) return false;

    // Calculate available height within margins
    const pageHeight = inchesToPixels(currentPageSize.height);
    const topMargin = inchesToPixels(pageMargins.top);
    const bottomMargin = inchesToPixels(pageMargins.bottom);
    const availableHeight = pageHeight - topMargin - bottomMargin;

    // Account for headers and footers if enabled
    const headerHeight = headers.enabled && (currentPage > 1 || headers.showOnFirstPage) ? 32 : 0;
    const footerHeight = footers.enabled ? 32 : 0;
    const finalAvailableHeight = availableHeight - headerHeight - footerHeight;

    // Get current content and measure it
    const currentContent = editor.getHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentContent;
    tempDiv.style.cssText = `
      width: ${inchesToPixels(currentPageSize.width - pageMargins.left - pageMargins.right)}px;
      font-family: ${fontFamily};
      font-size: ${fontSize}pt;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      position: absolute;
      visibility: hidden;
      left: -9999px;
    `;
    document.body.appendChild(tempDiv);
    
    const contentHeight = tempDiv.scrollHeight;
    document.body.removeChild(tempDiv);
    
    // Check if content exceeds available height
    return contentHeight > finalAvailableHeight;
  }, [editor, currentPageSize, pageMargins, fontSize, fontFamily, headers, footers, currentPage]);

  // Handle automatic page creation when content overflows
  const handlePageOverflow = useCallback(() => {
    if (!checkPageOverflow() || !editor) return;

    // Get the current content and find where to split it
    const currentContent = editor.getHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentContent;
    
    // Calculate available height
    const pageHeight = inchesToPixels(currentPageSize.height);
    const topMargin = inchesToPixels(pageMargins.top);
    const bottomMargin = inchesToPixels(pageMargins.bottom);
    const headerHeight = headers.enabled && (currentPage > 1 || headers.showOnFirstPage) ? 32 : 0;
    const footerHeight = footers.enabled ? 32 : 0;
    const availableHeight = pageHeight - topMargin - bottomMargin - headerHeight - footerHeight;

    // Find the best place to insert a page break
    const elements = Array.from(tempDiv.children);
    let accumulatedHeight = 0;
    let splitIndex = -1;
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // Skip page breaks
      if (element.classList.contains('page-break')) {
        continue;
      }
      
      // Measure this element
      const elementDiv = document.createElement('div');
      elementDiv.innerHTML = element.outerHTML;
      elementDiv.style.cssText = `
        width: ${inchesToPixels(currentPageSize.width - pageMargins.left - pageMargins.right)}px;
        font-family: ${fontFamily};
        font-size: ${fontSize}pt;
        line-height: 1.5;
        padding: 0;
        margin: 0;
        position: absolute;
        visibility: hidden;
        left: -9999px;
      `;
      document.body.appendChild(elementDiv);
      
      const elementHeight = elementDiv.scrollHeight;
      document.body.removeChild(elementDiv);
      
      // Check if adding this element would cause overflow
      if (accumulatedHeight + elementHeight > availableHeight && i > 0) {
        splitIndex = i;
        break;
      }
      
      accumulatedHeight += elementHeight;
    }
    
    // Insert page break at the split point
    if (splitIndex > 0) {
      // Get the content up to the split point
      const contentBeforeSplit = elements.slice(0, splitIndex).map(el => el.outerHTML).join('');
      const contentAfterSplit = elements.slice(splitIndex).map(el => el.outerHTML).join('');
      
      // Update the editor content with a page break inserted
      const newContent = contentBeforeSplit + PAGE_BREAK_MARKER + contentAfterSplit;
      editor.commands.setContent(newContent);
      
      // Recalculate pages
      setTimeout(() => {
        calculatePages(newContent);
      }, 100);
    } else {
      // If we can't find a good split point, just insert a page break at the end
      editor.chain().focus().insertContent(PAGE_BREAK_MARKER).run();
      
      setTimeout(() => {
        const currentContent = editor.getHTML();
        calculatePages(currentContent);
      }, 100);
    }
  }, [checkPageOverflow, editor, calculatePages, currentPageSize, pageMargins, fontSize, fontFamily, headers, footers, currentPage]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (content) {
      calculatePages(content);
    }
  }, [content, calculatePages]);

  // Monitor content changes for overflow detection
  useEffect(() => {
    if (!editor) return;

    // Check for overflow when page settings change
    const checkOverflow = () => {
      setTimeout(() => {
        // Recalculate pages when settings change
        const currentContent = editor.getHTML();
        calculatePages(currentContent);
        
        // Check if we need to split content
        if (checkPageOverflow()) {
          handlePageOverflow();
        }
      }, 50);
    };

    // Check overflow when page size, margins, or font settings change
    checkOverflow();
  }, [editor, pageSize, pageMargins, fontSize, fontFamily, headers, footers, checkPageOverflow, handlePageOverflow, calculatePages]);

  // Add keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

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
  }, [editor, insertPageBreak]);

  // Measure toolbar width for responsive behavior
  useEffect(() => {
    const updateToolbarWidth = () => {
      if (toolbarRef.current) {
        const newWidth = toolbarRef.current.clientWidth;
        setToolbarWidth(newWidth);
      }
    };

    // Initial measurement
    updateToolbarWidth();
    
    // Use ResizeObserver for more accurate measurements
    let resizeObserver: ResizeObserver | null = null;
    if (toolbarRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateToolbarWidth();
      });
      resizeObserver.observe(toolbarRef.current);
    }
    
    // Fallback to window resize
    window.addEventListener('resize', updateToolbarWidth);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateToolbarWidth);
    };
  }, []);


  // Reset to page 1 when content changes significantly
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && editor) {
      setCurrentPage(pageNumber);
      
      // If we're navigating to the last page, allow editing
      if (pageNumber === totalPages) {
        setCurrentEditingPage(pageNumber - 1);
        // If this is the last page, show the live editor
        if (pages.length > 0) {
          const targetPageContent = pages[pageNumber - 1];
          if (targetPageContent !== undefined) {
            editor.commands.setContent(targetPageContent);
          }
        }
      } else {
        // For non-last pages, show static content
        setCurrentEditingPage(totalPages - 1); // Keep editing on the last page
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
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

  const ToolbarGroup = ({ children, className = "", title, forceDropdown = false }: { children: React.ReactNode; className?: string; title?: string; forceDropdown?: boolean }) => {
    const shouldUseDropdown = forceDropdown || (toolbarWidth > 0 && toolbarWidth < 800);
    
    if (shouldUseDropdown) {
      return (
        <div className={`relative ${className}`}>
          <ToolbarDropdown label={title || ""} icon={null}>
            <div className="flex flex-col gap-1 min-w-[200px]">
              {children}
            </div>
          </ToolbarDropdown>
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center p-1 border-r border-slate-700 last:border-r-0 h-24 ${className}`} title={title}>
        <div className="flex flex-col items-center gap-0.5 flex-1 justify-center">{children}</div>
        <span className="text-xs text-slate-400 mt-auto mb-0.5">{title}</span>
      </div>
    );
  };

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
      className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-colors border-b-2 ${
        activeTab === tab 
          ? 'bg-slate-700 text-white border-purple-500' 
          : 'text-slate-400 hover:bg-slate-700 hover:text-white border-transparent'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );

  const ToolbarDropdown: React.FC<{
    label: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
  }> = ({ label, children, icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded text-slate-300 hover:bg-slate-700 flex items-center gap-1 transition-colors"
        >
          {icon && <span className="h-3 w-3 lg:h-4 lg:w-4">{icon}</span>}
          <span className="text-xs hidden lg:inline">{label}</span>
          <ArrowDownIcon className="h-1.5 w-1.5 ml-1" />
        </button>
        {isOpen && (
          <div className="absolute z-20 bg-slate-700 p-2 rounded-lg shadow-lg mt-2 min-w-[150px]">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Render Home tab content
  const renderHomeTab = () => (
    <>
      {/* Clipboard Group */}
      <ToolbarGroup title="Clipboard">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <div className="relative">
              <ToolbarButton onClick={() => navigator.clipboard.readText().then(text => editor?.commands.insertContent(text))} title="Paste">
                <ClipboardDocumentIcon className="h-3 w-3 lg:h-4 lg:w-4" />
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <ToolbarButton onClick={() => editor?.chain().focus().deleteSelection().run()} title="Cut">
              <ScissorsIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => navigator.clipboard.writeText(editor?.getText() || '')} title="Copy">
              <DocumentDuplicateIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {/* Format painter functionality */}} title="Format Painter">
              <FormatPainterIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
          </div>
        </div>
      </ToolbarGroup>

      {/* Font Group */}
      <ToolbarGroup title="Font">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                editor?.chain().focus().setFontFamily(e.target.value).run();
              }}
              className="bg-slate-700 border border-slate-600 rounded text-white text-xs px-1 py-0.5 w-16 lg:w-20"
              title="Font Family"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Calibri">Calibri</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
            </select>
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(parseInt(e.target.value));
                editor?.chain().focus().setFontSize(`${e.target.value}pt`).run();
              }}
              className="bg-slate-700 border border-slate-600 rounded text-white text-xs px-1 py-0.5 w-8"
              title="Font Size"
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <ToolbarButton onClick={() => setFontSize(Math.min(72, fontSize + 1))} title="Increase Font Size">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold leading-none">A</span>
                <ArrowUpIcon className="h-1.5 w-1.5 -mt-0.5" />
              </div>
            </ToolbarButton>
            <ToolbarButton onClick={() => setFontSize(Math.max(8, fontSize - 1))} title="Decrease Font Size">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold leading-none">A</span>
                <ArrowDownIcon className="h-1.5 w-1.5" />
              </div>
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="relative">
              <ToolbarButton onClick={() => {/* Change case functionality */}} title="Change Case">
                <span className="text-xs font-bold">Aa</span>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <ToolbarButton onClick={() => editor?.chain().focus().unsetAllMarks().run()} title="Clear All Formatting">
              <div className="flex items-center">
                <span className="text-xs font-bold">A</span>
                <ClearIcon className="h-2 w-2 ml-0.5" />
              </div>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              isActive={editor?.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              isActive={editor?.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
            <div className="relative">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive('underline')}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="h-3 w-3 lg:h-4 lg:w-4" />
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              isActive={editor?.isActive('strike')}
              title="Strikethrough"
            >
              <StrikethroughIcon className="h-3 w-3 lg:h-4 lg:w-4" />
            </ToolbarButton>
          </div>
        </div>
      </ToolbarGroup>

      {/* Font Formatting Group */}
      <ToolbarGroup title="Font Formatting">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleSubscript().run()}
              isActive={editor?.isActive('subscript')}
              title="Subscript"
            >
              <span className="text-xs font-bold">X₂</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleSuperscript().run()}
              isActive={editor?.isActive('superscript')}
              title="Superscript"
            >
              <span className="text-xs font-bold">X²</span>
            </ToolbarButton>
            <div className="relative">
              <ToolbarButton onClick={() => {/* Text effects */}} title="Text Effects and Typography">
                <div className="flex items-center">
                  <span className="text-xs font-bold">A</span>
                  <SparklesIcon className="h-2 w-2 ml-0.5" />
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <div className="relative">
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHighlight().run()} title="Text Highlight Color">
                <div className="flex items-center">
                  <span className="text-xs font-bold">A</span>
                  <div className="w-2 h-0.5 bg-yellow-400 ml-0.5"></div>
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <div className="relative">
              <ToolbarButton onClick={() => {/* Font color */}} title="Font Color">
                <div className="flex items-center">
                  <span className="text-xs font-bold">A</span>
                  <div className="w-2 h-0.5 bg-red-500 ml-0.5"></div>
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
          </div>
        </div>
      </ToolbarGroup>

              {/* Paragraph Group */}
              <ToolbarGroup title="Paragraph">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <div className="relative">
                      <ToolbarDropdown label="Lists" icon={<ListBulletIcon className="h-3 w-3 lg:h-4 lg:w-4" />}>
                        <button
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-600 flex items-center gap-2 ${
                            editor?.isActive('bulletList') ? 'bg-slate-600' : ''
                          }`}
                        >
                          <ListBulletIcon className="h-4 w-4" />
                          Bullet List
                        </button>
                        <button
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-600 flex items-center gap-2 ${
                            editor?.isActive('orderedList') ? 'bg-slate-600' : ''
                          }`}
                        >
                          <NumberedListIcon className="h-4 w-4" />
                          Numbered List
                        </button>
                        <button
                          onClick={() => {/* Multilevel list */}}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-600 flex items-center gap-2"
                        >
                          <ListBulletIcon className="h-4 w-4" />
                          <span>Multilevel List (1, a, i)</span>
                        </button>
                      </ToolbarDropdown>
                    </div>
                    <ToolbarButton onClick={() => {/* Decrease indent */}} title="Decrease Indent">
                      <div className="flex items-center">
                        <span className="text-xs">←</span>
                        <ListBulletIcon className="h-2 w-2 ml-0.5" />
                      </div>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => {/* Increase indent */}} title="Increase Indent">
                      <div className="flex items-center">
                        <span className="text-xs">→</span>
                        <ListBulletIcon className="h-2 w-2 ml-0.5" />
                      </div>
                    </ToolbarButton>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="relative">
                      <ToolbarButton onClick={() => {/* Sort */}} title="Sort">
                        <div className="flex items-center">
                          <span className="text-xs font-bold">A</span>
                          <span className="text-xs font-bold">Z</span>
                        </div>
                      </ToolbarButton>
                      <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
                    </div>
                    <ToolbarButton onClick={() => {/* Show paragraph marks */}} title="Show/Hide ¶">
                      <span className="text-xs font-bold">¶</span>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      isActive={editor?.isActive({ textAlign: 'left' })}
                      title="Align Left"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <div className="w-3 h-0.5 bg-current"></div>
                        <div className="w-2 h-0.5 bg-current"></div>
                        <div className="w-3 h-0.5 bg-current"></div>
                        <div className="w-1 h-0.5 bg-current"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      isActive={editor?.isActive({ textAlign: 'center' })}
                      title="Center"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <div className="w-2 h-0.5 bg-current mx-auto"></div>
                        <div className="w-3 h-0.5 bg-current mx-auto"></div>
                        <div className="w-2 h-0.5 bg-current mx-auto"></div>
                        <div className="w-1 h-0.5 bg-current mx-auto"></div>
                      </div>
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      isActive={editor?.isActive({ textAlign: 'right' })}
                      title="Align Right"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <div className="w-3 h-0.5 bg-current ml-auto"></div>
                        <div className="w-2 h-0.5 bg-current ml-auto"></div>
                        <div className="w-3 h-0.5 bg-current ml-auto"></div>
                        <div className="w-1 h-0.5 bg-current ml-auto"></div>
                      </div>
                    </ToolbarButton>
                  </div>
                </div>
              </ToolbarGroup>

      {/* Alignment Group */}
      <ToolbarGroup title="Alignment">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
              isActive={editor?.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <div className="flex flex-col space-y-0.5">
                <div className="w-3 h-0.5 bg-current"></div>
                <div className="w-3 h-0.5 bg-current"></div>
                <div className="w-3 h-0.5 bg-current"></div>
                <div className="w-3 h-0.5 bg-current"></div>
              </div>
            </ToolbarButton>
            <div className="relative">
              <ToolbarButton onClick={() => {/* Line spacing */}} title="Line and Paragraph Spacing">
                <div className="flex items-center space-x-0.5">
                  <div className="flex flex-col space-y-0.5">
                    <div className="w-2 h-0.5 bg-current"></div>
                    <div className="w-2 h-0.5 bg-current"></div>
                    <div className="w-2 h-0.5 bg-current"></div>
                  </div>
                  <ArrowUpIcon className="h-1.5 w-1.5" />
                  <ArrowDownIcon className="h-1.5 w-1.5" />
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <div className="relative">
              <ToolbarButton onClick={() => {/* Shading */}} title="Shading">
                <div className="flex items-center">
                  <div className="w-3 h-2 border border-current"></div>
                  <div className="w-1 h-1 bg-current ml-0.5"></div>
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <div className="relative">
              <ToolbarButton onClick={() => {/* Borders */}} title="Borders">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1 h-1 border border-current"></div>
                  <div className="w-1 h-1 border border-current"></div>
                  <div className="w-1 h-1 border border-current"></div>
                  <div className="w-1 h-1 border border-current"></div>
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
          </div>
        </div>
      </ToolbarGroup>

      {/* Styles Group */}
      <ToolbarGroup title="Styles">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <div className="relative">
              <ToolbarButton onClick={() => {/* Styles */}} title="Styles">
                <div className="flex items-center">
                  <span className="text-xs font-bold">A</span>
                  <PaintBrushIcon className="h-2 w-2 ml-0.5" />
                </div>
              </ToolbarButton>
              <ArrowDownIcon className="absolute -bottom-1 -right-1 h-1.5 w-1.5 text-slate-400" />
            </div>
            <ToolbarButton onClick={() => {/* Styles pane */}} title="Styles Pane">
              <div className="flex items-center">
                <DocumentIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                <PaintBrushIcon className="h-2 w-2 ml-0.5" />
              </div>
            </ToolbarButton>
          </div>
        </div>
      </ToolbarGroup>
    </>
  );

  // Render Insert tab content
  const renderInsertTab = () => (
    <>
      {/* Pages Group */}
      <ToolbarGroup title="Pages">
        <ToolbarButton onClick={insertPageBreak} title="Page Break (Ctrl+Enter)">
          <DocumentPlusIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Tables Group */}
      <ToolbarGroup title="Tables">
        <ToolbarButton onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table">
          <TableCellsIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Illustrations Group */}
      <ToolbarGroup title="Illustrations">
        <ToolbarButton onClick={() => editor?.chain().focus().setImage({ src: 'https://via.placeholder.com/300x200' }).run()} title="Picture">
          <PhotoIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Links Group */}
      <ToolbarGroup title="Links">
        <ToolbarButton onClick={() => editor?.chain().focus().toggleLink({ href: 'https://example.com' }).run()} title="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </>
  );

  // Render Layout tab content
  const renderLayoutTab = () => (
    <>
      {/* Page Setup Group */}
      <ToolbarGroup title="Page Setup">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as keyof typeof PAGE_SIZES)}
          className="bg-slate-700 border border-slate-600 rounded text-white text-sm px-2 py-1"
          title="Page Size"
        >
          {Object.entries(PAGE_SIZES).map(([key, size]) => (
            <option key={key} value={key}>
              {size.name}
            </option>
          ))}
        </select>
        <ToolbarButton onClick={() => setShowPageSettings(!showPageSettings)} title="Margins">
          <ViewColumnsIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Paragraph Group */}
      <ToolbarGroup title="Paragraph">
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Decrease Indent">
          <span className="text-xs">←</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Increase Indent">
          <span className="text-xs">→</span>
        </ToolbarButton>
      </ToolbarGroup>
    </>
  );

  // Render Design tab content
  const renderDesignTab = () => (
    <>
      {/* Document Formatting Group */}
      <ToolbarGroup title="Document Formatting">
        <ToolbarButton onClick={() => setPageBorders(!pageBorders)} title="Page Borders">
          <Square3Stack3DIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Page Background Group */}
      <ToolbarGroup title="Page Background">
        <input
          type="color"
          onChange={(e) => {
            // This would change the page background color
            console.log('Background color:', e.target.value);
          }}
          className="w-8 h-8 rounded border border-slate-600"
          title="Page Color"
        />
      </ToolbarGroup>
    </>
  );

  // Render View tab content
  const renderViewTab = () => (
    <>
      {/* Views Group */}
      <ToolbarGroup title="Views">
        <ToolbarButton onClick={() => setZoom(100)} title="Print Layout">
          <EyeIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Zoom Group */}
      <ToolbarGroup title="Zoom">
        <ToolbarButton onClick={() => setZoom(Math.max(50, zoom - 10))} title="Zoom Out">
          <MagnifyingGlassMinusIcon className="h-4 w-4" />
        </ToolbarButton>
        <span className="text-sm text-slate-300 min-w-[3rem] text-center">{zoom}%</span>
        <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Zoom In">
          <MagnifyingGlassPlusIcon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>

      {/* Show Group */}
      <ToolbarGroup title="Show">
        <ToolbarButton onClick={() => setShowPageSettings(!showPageSettings)} title="Ruler">
          <Bars3Icon className="h-4 w-4" />
        </ToolbarButton>
      </ToolbarGroup>
    </>
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 min-h-0 overflow-hidden">
      {/* Word-style Tab Navigation */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left side - Document title and tabs */}
          <div className="flex items-center min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-xl font-semibold text-white bg-transparent border-none outline-none min-w-[150px] max-w-[250px] flex-shrink-0"
              placeholder="Enter title..."
            />
            <div className="flex items-center space-x-1 flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 px-2">
              {(['home', 'insert', 'layout', 'design', 'view'] as TabType[]).map((tab) => {
                const getTabIcon = (tab: TabType) => {
                  switch (tab) {
                    case 'home': return HomeIcon;
                    case 'insert': return InsertIcon;
                    case 'layout': return LayoutIcon;
                    case 'design': return DesignIcon;
                    case 'view': return EyeIcon;
                    default: return HomeIcon;
                  }
                };

                const getTabLabel = (tab: TabType) => {
                  switch (tab) {
                    case 'home': return 'Home';
                    case 'insert': return 'Insert';
                    case 'layout': return 'Layout';
                    case 'design': return 'Design';
                    case 'view': return 'View';
                    default: return tab;
                  }
                };

                return (
                  <TabButton 
                    key={tab} 
                    tab={tab} 
                    icon={getTabIcon(tab)}
                  >
                    {getTabLabel(tab)}
                  </TabButton>
                );
              })}
            </div>
          </div>

          {/* Right side - Quick actions with proper separation */}
          <div className="flex items-center space-x-4 pl-4 border-l border-slate-600 flex-shrink-0">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2 text-slate-300">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-sm min-w-0">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            
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
        </div>
      </div>

      {/* Tab Content Toolbar */}
      <div ref={toolbarRef} className="bg-slate-750 border-b border-slate-700 px-1 py-2 h-28 overflow-x-auto">
        <div className="flex items-stretch space-x-1 lg:space-x-2 h-24 min-w-fit">
          {activeTab === 'home' && renderHomeTab()}
          {activeTab === 'insert' && renderInsertTab()}
          {activeTab === 'layout' && renderLayoutTab()}
          {activeTab === 'design' && renderDesignTab()}
          {activeTab === 'view' && renderViewTab()}
        </div>
      </div>

      {/* Page Settings Dropdown */}
      {showPageSettings && (
        <div className="absolute top-32 right-4 z-50 bg-slate-700 border border-slate-600 rounded-lg shadow-xl p-4 w-80">
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

      {/* Page Navigation and Display */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100"
        style={{ 
          zoom: `${zoom}%`, 
          height: '100%',
          scrollBehavior: 'smooth' // Smooth scrolling between pages
        }}
      >
        <div className="max-w-6xl mx-auto p-8 min-h-full">
          {/* Document Pages with Google Docs-like spacing */}
          <div className="space-y-8">
            {pages.map((pageContent, index) => (
              <div key={index} className="flex justify-center">
                <div 
                  className="bg-white shadow-lg page-container relative"
                  style={{
                    width: `${inchesToPixels(currentPageSize.width)}px`,
                    height: `${inchesToPixels(currentPageSize.height)}px`,
                    padding: `${inchesToPixels(pageMargins.top)}px ${inchesToPixels(pageMargins.right)}px ${inchesToPixels(pageMargins.bottom)}px ${inchesToPixels(pageMargins.left)}px`,
                    boxSizing: 'border-box',
                    border: pageBorders ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Header */}
                  {headers.enabled && (index > 0 || headers.showOnFirstPage) && (
                    <div className="text-center text-xs text-gray-600 mb-4 pb-2 border-b border-gray-200">
                      {headers.text}
                    </div>
                  )}

                  {/* Page Content */}
                  <div 
                    className="flex-1"
                    style={{ 
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}pt`,
                      lineHeight: '1.5',
                      overflow: 'hidden'
                    }}
                  >
                    {index === pages.length - 1 ? (
                      // Show live editor on the last page
                      <div style={{ height: '100%', overflow: 'hidden' }}>
                        <EditorContent editor={editor} />
                      </div>
                    ) : (
                      // Show static content for previous pages
                      <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: pageContent || '' 
                        }}
                      />
                    )}
                  </div>

                  {/* Footer */}
                  {footers.enabled && (
                    <div className="text-center text-xs text-gray-600 mt-4 pt-2 border-t border-gray-200">
                      {footers.text && <span className="mr-4">{footers.text}</span>}
                      {footers.showPageNumbers && <span>Page {index + 1}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Page Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous Page
                </button>
                <span className="px-4 py-2 bg-slate-700 text-white rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next Page →
                </button>
              </div>
              {currentPage === totalPages && (
                <div className="text-sm text-slate-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  ✏️ Currently editing - content will automatically flow to new pages as you type
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-slate-400">
          <span>Page {currentPage} of {totalPages}</span>
          <span>{currentPageSize.name}</span>
          <span>{editor.storage.characterCount.words()} words</span>
          <span>{editor.storage.characterCount.characters()} characters</span>
        </div>
        <div className="text-slate-400">
          {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

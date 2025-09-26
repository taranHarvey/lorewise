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
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  onSave, 
  saving, 
  lastSaved 
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-6 min-h-full',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
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
      title={title}
      className={`p-2 rounded hover:bg-slate-700 transition-colors ${
        isActive ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <BoldIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <ItalicIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
              >
                <StrikethroughIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Code"
              >
                <span className="text-xs font-bold">&lt;/&gt;</span>
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              <select
                value={editor.getAttributes('heading').level || 'paragraph'}
                onChange={(e) => {
                  const level = e.target.value;
                  if (level === 'paragraph') {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: parseInt(level) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
                  }
                }}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              >
                <option value="paragraph">Paragraph</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="4">Heading 4</option>
                <option value="5">Heading 5</option>
                <option value="6">Heading 6</option>
              </select>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
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
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
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
            </div>

            {/* Special Elements */}
            <div className="flex items-center space-x-1 border-r border-slate-600 pr-2">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
              >
                <CodeBracketIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
              >
                <MinusIcon className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Media */}
            <div className="flex items-center space-x-1">
              <ToolbarButton
                onClick={addLink}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addImage}
                title="Add Image"
              >
                <PhotoIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={addTable}
                title="Add Table"
              >
                <TableCellsIcon className="h-4 w-4" />
              </ToolbarButton>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400">
              {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
            </div>
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="h-full"
        />
      </div>

      {/* Footer */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Words: {editor.storage.characterCount?.words() || 0}</span>
            <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
            <span>Lines: {content.split('\n').length}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Rich Text Editor</span>
          </div>
        </div>
      </div>
    </div>
  );
}

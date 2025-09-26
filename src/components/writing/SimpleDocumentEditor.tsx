'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { PageBreak } from './PageBreakExtension';

interface SimpleDocumentEditorProps {
  content: string;
  onSave: (content: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export default function SimpleDocumentEditor({
  content,
  onSave,
  title,
  onTitleChange,
}: SimpleDocumentEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const lastContentRef = useRef<string>('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize editor content from prop
  useEffect(() => {
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      setIsLoading(false);
    }
  }, [content]);

  // Single editor for the entire document
  const editor = useEditor({
    extensions: [
      StarterKit,
      PageBreak, // Use the custom page break extension
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();

      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Set new timeout for debounced save
      updateTimeoutRef.current = setTimeout(() => {
        onSave(newContent);
      }, 500);
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Insert page break
  const insertPageBreak = () => {
    if (!editor) return;

    // Use the proper page break command
    editor.commands.setPageBreak();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">{title || 'Untitled Novel'}</h2>
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
      <div className="flex-1 overflow-auto p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          {/* Document Content */}
          <div className="bg-white shadow-lg rounded-lg p-12 min-h-[calc(100vh-200px)] novel-page">
            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none focus:outline-none novel-prose cursor-text h-full"
              style={{ 
                color: 'black',
                fontFamily: 'Times New Roman, serif',
                fontSize: '12pt',
                lineHeight: '1.75',
                textAlign: 'justify',
                height: '100%',
                overflow: 'hidden'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
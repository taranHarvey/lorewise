'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import OnlyOfficeEditor, { OnlyOfficeEditorRef } from './OnlyOfficeEditor';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface OpenDocument {
  id: string;
  title: string;
  isActive: boolean;
  isDirty: boolean; // Has unsaved changes
  lastAccessed: Date;
}

interface SortableTabProps {
  doc: OpenDocument;
  isActive: boolean;
  onTabChange: (documentId: string) => void;
  onTabClose: (documentId: string) => void;
  index: number;
}

const SortableTab: React.FC<SortableTabProps> = ({
  doc,
  isActive,
  onTabChange,
  onTabClose,
  index
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableDragging,
  } = useSortable({ 
    id: doc.id,
    disabled: !dragEnabled,
  });

  // Global mouse move tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isTracking && !hasMovedRef.current && (startPos.x !== 0 || startPos.y !== 0)) {
        const dx = Math.abs(e.clientX - startPos.x);
        const dy = Math.abs(e.clientY - startPos.y);
        
        // If moved more than 3 pixels in any direction, consider it a drag
        if (dx > 3 || dy > 3) {
          hasMovedRef.current = true;
          setHasMoved(true);
          setDragEnabled(true);
          setIsDragging(true);
        }
      }
    };

    if (isTracking) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isTracking, startPos]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableDragging ? 0.5 : 1,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setHasMoved(false);
    hasMovedRef.current = false;
    setIsDragging(false);
    setDragEnabled(false);
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsTracking(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!hasMovedRef.current && (startPos.x !== 0 || startPos.y !== 0)) {
      const dx = Math.abs(e.clientX - startPos.x);
      const dy = Math.abs(e.clientY - startPos.y);
      
      // If moved more than 3 pixels in any direction, consider it a drag
      if (dx > 3 || dy > 3) {
        hasMovedRef.current = true;
        setHasMoved(true);
        setDragEnabled(true);
        setIsDragging(true);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // If no movement occurred AND we haven't started dragging, treat as click
    if (!hasMovedRef.current && !isDragging && !dragEnabled) {
      onTabChange(doc.id);
    }
    
    setIsTracking(false);
    setHasMoved(false);
    hasMovedRef.current = false;
    setIsDragging(false);
    setDragEnabled(false);
    setStartPos({ x: 0, y: 0 });
  };

  const handlePointerCancel = () => {
    setIsTracking(false);
    setHasMoved(false);
    hasMovedRef.current = false;
    setIsDragging(false);
    setDragEnabled(false);
    setStartPos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 px-4 py-2 min-w-0 border-r border-gray-700 relative
        ${isActive ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'}
        ${doc.isDirty ? 'border-t-orange-400 border-t-2' : ''}
        ${index === 0 ? 'rounded-tl-lg' : ''}
        ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
        select-none
      `}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onDragStart={(e) => e.preventDefault()}
      {...attributes}
      {...(dragEnabled ? listeners : {})}
    >
      <span 
        className={`text-sm truncate ${doc.isDirty ? 'text-orange-300' : isActive ? 'text-white' : 'text-gray-300'} flex-1 min-w-0 select-none`}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
      >
        {doc.title}
      </span>
      {doc.isDirty && (
        <span className="text-orange-400 text-xs">•</span>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTabClose(doc.id);
        }}
        className="text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
        title="Close document"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

interface MultiDocumentTabsProps {
  openDocuments: OpenDocument[];
  onTabChange: (documentId: string) => void;
  onTabClose: (documentId: string) => void;
  onTabReorder: (reorderedDocs: OpenDocument[]) => void;
  activeDocumentId: string | null;
}

const MultiDocumentTabs: React.FC<MultiDocumentTabsProps> = ({
  openDocuments,
  onTabChange,
  onTabClose,
  onTabReorder,
  activeDocumentId
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = openDocuments.findIndex(doc => doc.id === active.id);
      const newIndex = openDocuments.findIndex(doc => doc.id === over.id);
      
      const reorderedDocs = arrayMove(openDocuments, oldIndex, newIndex);
      onTabReorder(reorderedDocs);
    }
  }
  return (
    <div className="bg-gray-900 border-b border-gray-700">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={openDocuments} strategy={horizontalListSortingStrategy}>
          <div className="flex overflow-x-auto scrollbar-hide">
            {openDocuments.map((doc, index) => (
              <SortableTab
                key={doc.id}
                doc={doc}
                isActive={doc.id === activeDocumentId}
                onTabChange={onTabChange}
                onTabClose={onTabClose}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MultiDocumentTabs;

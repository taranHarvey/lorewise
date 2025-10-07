'use client';

import React, { useState } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  ListOrderedIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  LinkIcon,
  PhotoIcon,
  TableCellsIcon,
  CodeBracketIcon,
  MinusIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface CustomToolbarProps {
  onFormatChange: (format: string, value?: any) => void;
  onInsert: (type: string, data?: any) => void;
  className?: string;
}

export default function CustomToolbar({ onFormatChange, onInsert, className = '' }: CustomToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  const textFormats = [
    { name: 'bold', icon: BoldIcon, action: () => onFormatChange('bold') },
    { name: 'italic', icon: ItalicIcon, action: () => onFormatChange('italic') },
    { name: 'underline', icon: UnderlineIcon, action: () => onFormatChange('underline') },
  ];

  const alignmentOptions = [
    { name: 'alignLeft', icon: AlignLeftIcon, action: () => onFormatChange('align', 'left') },
    { name: 'alignCenter', icon: AlignCenterIcon, action: () => onFormatChange('align', 'center') },
    { name: 'alignRight', icon: AlignRightIcon, action: () => onFormatChange('align', 'right') },
    { name: 'alignJustify', icon: AlignJustifyIcon, action: () => onFormatChange('align', 'justify') },
  ];

  const listOptions = [
    { name: 'bulletList', icon: ListBulletIcon, action: () => onFormatChange('list', 'bullet') },
    { name: 'numberedList', icon: ListOrderedIcon, action: () => onFormatChange('list', 'number') },
  ];

  const insertOptions = [
    { name: 'link', icon: LinkIcon, action: () => onInsert('link') },
    { name: 'image', icon: PhotoIcon, action: () => onInsert('image') },
    { name: 'table', icon: TableCellsIcon, action: () => onInsert('table') },
    { name: 'code', icon: CodeBracketIcon, action: () => onInsert('code') },
    { name: 'divider', icon: MinusIcon, action: () => onInsert('divider') },
  ];

  const historyOptions = [
    { name: 'undo', icon: ArrowUturnLeftIcon, action: () => onFormatChange('undo') },
    { name: 'redo', icon: ArrowUturnRightIcon, action: () => onFormatChange('redo') },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
    '#C0C0C0', '#FF8080', '#80FF80', '#8080FF', '#FFFF80', '#FF80FF', '#80FFFF'
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

  return (
    <div className={`bg-white border-b border-gray-200 p-2 ${className}`}>
      <div className="flex items-center space-x-1 flex-wrap">
        {/* History */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
          {historyOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={option.name}
            >
              <option.icon className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Text Formatting */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
          {textFormats.map((format) => (
            <button
              key={format.name}
              onClick={format.action}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={format.name}
            >
              <format.icon className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Font Size */}
        <div className="relative border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => setShowFontSize(!showFontSize)}
            className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center space-x-1"
            title="Font Size"
          >
            <span className="text-sm text-gray-600">12</span>
            <PlusIcon className="h-3 w-3 text-gray-400" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-20 max-h-40 overflow-y-auto">
              {fontSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    onFormatChange('fontSize', size);
                    setShowFontSize(false);
                  }}
                  className="w-full px-3 py-1 text-left hover:bg-gray-100 text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative border-r border-gray-300 pr-2 mr-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Text Color"
          >
            <PaintBrushIcon className="h-4 w-4 text-gray-600" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 p-2 w-48">
              <div className="grid grid-cols-7 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onFormatChange('color', color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
          {alignmentOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={option.name}
            >
              <option.icon className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
          {listOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={option.name}
            >
              <option.icon className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Insert Options */}
        <div className="flex items-center space-x-1">
          {insertOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={option.name}
            >
              <option.icon className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

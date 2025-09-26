import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Add a page break
       */
      setPageBreak: () => ReturnType;
    };
  }
}

const PageBreakComponent = () => {
  return React.createElement(NodeViewWrapper, {
    className: 'page-break-divider',
    contentEditable: false,
  }, React.createElement('div', {
    className: 'page-break-divider',
  }));
};

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      class: {
        default: 'page-break-visual',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.page-break-divider',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'page-break-divider' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakComponent);
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
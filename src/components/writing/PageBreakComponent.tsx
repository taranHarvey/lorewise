import { NodeViewWrapper } from '@tiptap/react'
import { useCallback } from 'react'

interface PageBreakComponentProps {
  node: {
    attrs: Record<string, any>
  }
  updateAttributes: (attrs: Record<string, any>) => void
  selected: boolean
}

export default function PageBreakComponent({ node, updateAttributes, selected }: PageBreakComponentProps) {
  const handleClick = useCallback(() => {
    // Optional: Handle click events on page break
    console.log('Page break clicked')
  }, [])

  return (
    <NodeViewWrapper
      className={`page-break-node ${selected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="page-break-content">
        <div className="page-break-line"></div>
        <span className="page-break-text">Page Break</span>
        <div className="page-break-line"></div>
      </div>
    </NodeViewWrapper>
  )
}

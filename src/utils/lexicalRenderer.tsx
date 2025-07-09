import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
// import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical'

interface LexicalRendererProps {
  content: any
  className?: string
}

// Helper function to render different node types
const renderNode = (node: any, index: number): React.ReactNode => {
  if (!node) return null

  const key = `${node.type || 'text'}-${index}`

  // Handle text nodes
  if (node.text !== undefined) {
    let textElement = <span key={key}>{node.text}</span>
    
    // Apply text formatting
    if (node.format) {
      if (node.format & 1) textElement = <strong key={key}>{textElement}</strong> // Bold
      if (node.format & 2) textElement = <em key={key}>{textElement}</em> // Italic
      if (node.format & 8) textElement = <u key={key}>{textElement}</u> // Underline
      if (node.format & 16) textElement = <s key={key}>{textElement}</s> // Strikethrough
      if (node.format & 32) textElement = <code key={key} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">{textElement}</code> // Code
    }
    
    return textElement
  }

  // Handle different node types
  switch (node.type) {
    case 'root':
      return (
        <div key={key} className="lexical-root">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </div>
      )

    case 'paragraph':
      return (
        <p key={key} className="mb-4 leading-relaxed">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </p>
      )

    case 'heading':
      const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements
      const headingClasses = {
        h1: 'text-4xl lg:text-5xl font-bold mb-6 mt-8 text-foreground',
        h2: 'text-3xl lg:text-4xl font-bold mb-5 mt-7 text-foreground',
        h3: 'text-2xl lg:text-3xl font-bold mb-4 mt-6 text-foreground',
        h4: 'text-xl lg:text-2xl font-bold mb-3 mt-5 text-foreground',
        h5: 'text-lg lg:text-xl font-bold mb-2 mt-4 text-foreground',
        h6: 'text-base lg:text-lg font-bold mb-2 mt-3 text-foreground',
      }
      
      return (
        <HeadingTag key={key} className={headingClasses[node.tag as keyof typeof headingClasses] || headingClasses.h2}>
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </HeadingTag>
      )

    case 'list':
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'
      const listClasses = node.listType === 'number' 
        ? 'list-decimal list-inside mb-4 space-y-2'
        : 'list-disc list-inside mb-4 space-y-2'
      
      return (
        <ListTag key={key} className={listClasses}>
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </ListTag>
      )

    case 'listitem':
      return (
        <li key={key} className="ml-4">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </li>
      )

    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-primary pl-6 my-6 italic text-gray-700 dark:text-gray-300">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </blockquote>
      )

    case 'link':
      const isExternal = node.url?.startsWith('http')
      
      if (isExternal) {
        return (
          <a
            key={key}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-600 underline"
          >
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </a>
        )
      }
      
      return (
        <Link key={key} href={node.url || '#'} className="text-primary hover:text-primary-600 underline">
          {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
        </Link>
      )

    case 'upload':
      // Handle both direct upload data and relationship data
      const imageData = node.value || node.relationTo
      if (imageData && imageData.url) {
        return (
          <div key={key} className="my-8">
            <div className="relative w-full">
              <Image
                src={imageData.url}
                alt={imageData.alt || 'Blog image'}
                width={imageData.width || 800}
                height={imageData.height || 600}
                className="rounded-lg w-full h-auto shadow-md"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            {imageData.caption && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                {imageData.caption}
              </p>
            )}
          </div>
        )
      }
      return null

    case 'code':
      return (
        <pre key={key} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
          <code className="text-sm">
            {node.children?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </code>
        </pre>
      )

    case 'linebreak':
      return <br key={key} />

    case 'horizontalrule':
      return <hr key={key} className="my-8 border-gray-300 dark:border-gray-600" />

    default:
      // Fallback for unknown node types
      if (node.children) {
        return (
          <div key={key}>
            {node.children.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </div>
        )
      }
      return null
  }
}

export function LexicalRenderer({ content, className = '' }: LexicalRendererProps) {
  if (!content) {
    return <div className={className}>No content available</div>
  }

  try {
    // Handle both serialized and direct content
    const contentData = typeof content === 'string' ? JSON.parse(content) : content
    
    return (
      <div className={`lexical-content ${className}`}>
        {contentData.root?.children?.map((node: any, index: number) => renderNode(node, index))}
      </div>
    )
  } catch (error) {
    console.error('Error rendering Lexical content:', error)
    return (
      <div className={className}>
        <p className="text-red-500">Error rendering content</p>
      </div>
    )
  }
}
import type { EditorState } from 'lexical'

const WORDS_PER_MINUTE = 200 // Average reading speed
const WORDS_PER_MINUTE_TECHNICAL = 150 // Slower for technical content

export function calculateReadingTime(content: EditorState | string, isTechnical: boolean = false): string {
  let wordCount: number

  if (typeof content === 'string') {
    // Handle plain text
    wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
  } else {
    // Handle Lexical EditorState
    wordCount = extractWordCountFromLexical(content)
  }

  const wordsPerMinute = isTechnical ? WORDS_PER_MINUTE_TECHNICAL : WORDS_PER_MINUTE
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  
  if (minutes === 1) {
    return '1 min read'
  }
  
  return `${minutes} min read`
}

function extractWordCountFromLexical(editorState: EditorState): number {
  let wordCount = 0
  
  try {
    const serializedState = editorState as any
    
    if (serializedState?.root?.children) {
      wordCount = countWordsInChildren(serializedState.root.children)
    }
  } catch (error) {
    console.warn('Error extracting word count from Lexical content:', error)
    return 0
  }
  
  return wordCount
}

function countWordsInChildren(children: any[]): number {
  let count = 0
  
  for (const child of children) {
    if (child.text) {
      // Text node
      count += child.text.trim().split(/\s+/).filter((word: string) => word.length > 0).length
    } else if (child.children) {
      // Element node with children
      count += countWordsInChildren(child.children)
    }
  }
  
  return count
}

export function isContentTechnical(content: any, tags?: string[]): boolean {
  // Check tags for technical indicators
  const technicalTags = [
    'programming', 'coding', 'development', 'javascript', 'typescript', 
    'react', 'nextjs', 'api', 'database', 'algorithm', 'tutorial',
    'technical', 'software', 'engineering', 'web development'
  ]
  
  if (tags) {
    const hasMatchingTag = tags.some(tag => 
      technicalTags.some(techTag => 
        tag.toLowerCase().includes(techTag.toLowerCase())
      )
    )
    if (hasMatchingTag) return true
  }
  
  // Check content for technical keywords
  const contentString = typeof content === 'string' ? content : JSON.stringify(content)
  const technicalKeywords = [
    'function', 'const', 'let', 'var', 'class', 'interface', 'type',
    'import', 'export', 'return', 'async', 'await', 'promise',
    'component', 'props', 'state', 'hook', 'api', 'endpoint',
    'database', 'query', 'schema', 'migration', 'deployment'
  ]
  
  const keywordCount = technicalKeywords.filter(keyword => 
    contentString.toLowerCase().includes(keyword.toLowerCase())
  ).length
  
  // If more than 3 technical keywords found, consider it technical
  return keywordCount > 3
}
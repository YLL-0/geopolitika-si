type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

type LexicalDoc = { root?: LexicalNode } | null | undefined

/** Flatten a Lexical rich-text document to plain text (for search indexing and reading time). */
export function lexicalToPlainText(doc: LexicalDoc): string {
  if (!doc?.root) return ''
  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
  }
  walk(doc.root)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

const WORDS_PER_MINUTE = 200

export function readingTimeMinutes(doc: LexicalDoc): number {
  const words = lexicalToPlainText(doc).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

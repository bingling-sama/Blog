export interface ReadingTimeResult {
  minutes: number
  words: number
  text: string
}

/**
 * Calculates estimated reading time for markdown content.
 * Cleans markdown syntax, code blocks, math, html tags, and frontmatter.
 * Assumes reading speed:
 * - ~300 Chinese/CJK characters per minute
 * - ~160 English words per minute
 */
export function calculateReadingTime(
  content: string,
  cpm = 300,
  wpm = 160
): ReadingTimeResult {
  if (!content) {
    return { minutes: 1, words: 0, text: "1 分钟" }
  }

  // Strip frontmatter if present
  let clean = content.replace(/^---[\s\S]*?---\s*/, "")

  // Strip code blocks and inline code
  clean = clean.replace(/```[\s\S]*?```/g, "")
  clean = clean.replace(/`[^`]*`/g, "")

  // Strip math formulas
  clean = clean.replace(/\$\$[\s\S]*?\$\$/g, "")
  clean = clean.replace(/\$[^$]*\$/g, "")

  // Strip HTML tags
  clean = clean.replace(/<[^>]+>/g, "")

  // Strip markdown images and links formatting: ![alt](url) -> "", [text](url) -> text
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, "")
  clean = clean.replace(/\[(.*?)\]\(.*?\)/g, "$1")

  // Strip blockquotes, headers, horizontal rules, bold/italic markers
  clean = clean.replace(/^[>#\-*+]\s+/gm, "")
  clean = clean.replace(/[*_~=]/g, "")

  // Count Chinese / CJK characters
  const cjkChars = clean.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g)
  const cjkCount = cjkChars ? cjkChars.length : 0

  // Count Latin / English words
  const nonCjk = clean.replace(
    /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g,
    " "
  )
  const words = nonCjk.match(/[a-zA-Z0-9_-]+/g)
  const wordCount = words ? words.length : 0

  const totalWords = cjkCount + wordCount
  const readingMinutes = Math.max(
    1,
    Math.ceil(cjkCount / cpm + wordCount / wpm)
  )

  return {
    minutes: readingMinutes,
    words: totalWords,
    text: `${readingMinutes} 分钟`
  }
}

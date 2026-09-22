import { createContentLoader } from "vitepress"
import type { Post } from "./functions"
import { calculateReadingTime } from "./readingTime"

export default createContentLoader("posts/**/*.md", {
  includeSrc: true,
  transform(raw): Post[] {
    return raw
      .sort(
        (a, b) =>
          new Date(b.frontmatter.date).getTime() -
          new Date(a.frontmatter.date).getTime()
      )
      .map(({ url, frontmatter, src }) => {
        const { text, words } = calculateReadingTime(src ?? "")
        return {
          url: url,
          title: frontmatter.title,
          description: frontmatter.description,
          date: transformDate(frontmatter.date),
          category: frontmatter.category,
          tags: frontmatter.tags,
          readingTime: text,
          wordCount: words
        } as Post
      })
  }
})

function transformDate(date: string): string {
  const d = new Date(date)
  return d.toISOString().replace("T", " ").substring(0, 19)
}

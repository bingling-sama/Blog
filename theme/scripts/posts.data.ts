import { createContentLoader } from "vitepress"
import type { Post } from "./functions"
import { calculateReadingTime } from "./readingTime.ts"
import { getExternalPost } from "./external-posts.mjs"

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
        const filePath = `blog${url.replace(/\.html$/, "").replace(/\/$/, "/index")}.md`
        const external = getExternalPost(frontmatter, filePath)
        const reading = external.externalLink
          ? {}
          : calculateReadingTime(src ?? "")
        return {
          url: url,
          title: frontmatter.title,
          description: frontmatter.description,
          date: transformDate(frontmatter.date),
          category: frontmatter.category,
          tags: frontmatter.tags,
          ...external,
          readingTime: "text" in reading ? reading.text : undefined,
          wordCount: "words" in reading ? reading.words : undefined
        } as Post
      })
  }
})

function transformDate(date: string): string {
  const d = new Date(date)
  return d.toISOString().replace("T", " ").substring(0, 19)
}

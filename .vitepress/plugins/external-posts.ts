import type MarkdownIt from "markdown-it"
import { getExternalPost } from "../../theme/scripts/external-posts.mjs"

/** Keep metadata-only recommendations useful in both rendered pages and search. */
export function externalPosts(md: MarkdownIt) {
  // Run before VitePress's heading/anchor extraction, so empty-body posts are searchable.
  md.core.ruler.after("inline", "external-posts", (state) => {
    const frontmatter = state.env.frontmatter ?? {}
    const external = getExternalPost(
      frontmatter,
      state.env.relativePath ?? "external post"
    )
    if (!external.externalLink) return

    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "heading_open" && tokens[i].tag === "h1") {
        if (tokens[i + 1]?.content === frontmatter.title) {
          tokens.splice(i, 3)
          i--
        } else {
          tokens[i].tag = "h2"
          tokens[i + 2].tag = "h2"
        }
      }
    }

    const open = new state.Token("heading_open", "h1", 1)
    const inline = new state.Token("inline", "", 0)
    const text = new state.Token("text", "", 0)
    text.content = frontmatter.title
    inline.content = frontmatter.title
    inline.children = [text]
    const close = new state.Token("heading_close", "h1", -1)
    const record = new state.Token("html_block", "", 0)
    record.content = "<ExternalPostRecord />\n"
    tokens.unshift(open, inline, close, record)
  })
}

import fs from "node:fs/promises"
import path from "node:path"
import { DOMParser, XMLSerializer } from "@xmldom/xmldom"
import { recommendationTitle } from "../theme/scripts/external-posts.mjs"

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]
  )
}

/** Adapt only external entries after the existing plugin generates the feed. */
export function transformRecommendationRss(xml, recommendations) {
  if (!recommendations.size) return xml
  const doc = new DOMParser().parseFromString(xml, "text/xml")
  for (const item of Array.from(doc.getElementsByTagName("item"))) {
    const link = item.getElementsByTagName("link")[0]?.textContent
    const post = recommendations.get(link)
    if (!post) continue
    const summary = [
      `<p>${escapeHtml(post.description)}</p>`,
      "<p>本站推荐者：Booling</p>",
      post.sourceAuthor
        ? `<p>原作者：${escapeHtml(post.sourceAuthor)}</p>`
        : "",
      `<p><a href="${escapeHtml(post.externalLink)}">阅读原文</a> · <a href="${escapeHtml(link)}">本站推荐记录</a></p>`,
      "<p>外部文章推荐，原文版权归原作者所有。</p>"
    ].join("")
    const setText = (name, value) => {
      const nodes = Array.from(item.childNodes).filter(
        (node) => node.nodeName === name
      )
      const node = nodes.shift() ?? doc.createElement(name)
      for (const duplicate of nodes) item.removeChild(duplicate)
      while (node.firstChild) node.removeChild(node.firstChild)
      node.appendChild(doc.createTextNode(value))
      if (!node.parentNode) item.appendChild(node)
      return node
    }
    setText("title", recommendationTitle(post.title))
    setText("link", post.externalLink)
    setText("guid", link).setAttribute("isPermaLink", "false")
    setText("description", summary)
    setText("content:encoded", summary)
    setText(
      "dc:creator",
      `本站推荐者：Booling${post.sourceAuthor ? `；原作者：${post.sourceAuthor}` : ""}`
    )
    for (const author of Array.from(item.getElementsByTagName("author")))
      item.removeChild(author)
  }
  const rss = doc.documentElement
  rss.setAttribute("xmlns:content", "http://purl.org/rss/1.0/modules/content/")
  rss.setAttribute("xmlns:dc", "http://purl.org/dc/elements/1.1/")
  return new XMLSerializer().serializeToString(doc)
}

export function recommendationRssPlugin(rssPlugin, recommendations) {
  const wrapped = new WeakSet()
  return {
    ...rssPlugin,
    async configResolved(config) {
      await rssPlugin.configResolved.call(this, config)
      const vp = config.vitepress
      if (!vp || wrapped.has(vp)) return
      wrapped.add(vp)
      const buildEnd = vp.buildEnd
      vp.buildEnd = async (siteConfig) => {
        await buildEnd?.(siteConfig)
        const filename = path.join(siteConfig.outDir, "feed.xml")
        const xml = await fs.readFile(filename, "utf8")
        await fs.writeFile(
          filename,
          transformRecommendationRss(xml, recommendations)
        )
      }
    }
  }
}

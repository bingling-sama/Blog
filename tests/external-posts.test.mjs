import assert from "node:assert/strict"
import { test } from "node:test"
import { DOMParser } from "@xmldom/xmldom"
import {
  getExternalPost,
  getPostLink
} from "../theme/scripts/external-posts.mjs"
import { parsePost, createPostPayload } from "../scripts/notify-teleblog.mjs"
import { transformRecommendationRss } from "../scripts/recommendation-rss.mjs"
import { createMarkdownRenderer } from "vitepress"
import { externalPosts } from "../.vitepress/plugins/external-posts.ts"

const post = {
  title: "外链 <标题> & 测试",
  description: "我推荐它，因为 <案例> & 分析很清楚。",
  date: "2026-11-13 12:00:00",
  externalLink: "https://example.com/article?x=1&y=2#section",
  sourceAuthor: "  作者 <A> & B  "
}

test("metadata-only records get an escaped, anchored H1 before heading extraction", async () => {
  const md = await createMarkdownRenderer(process.cwd())
  md.use(externalPosts)
  const env = { frontmatter: post, relativePath: "record.md" }
  const html = md.render("", env)
  assert.match(html, /<h1 id="[^"]+"/)
  assert.match(html, /外链 &lt;标题&gt; &amp; 测试/)
  assert.match(html, /<ExternalPostRecord \/>/)
  const commentHtml = md.render(`# ${post.title}\n\n我的评论\n\n# 另一节`, {
    frontmatter: post,
    relativePath: "comments.md"
  })
  assert.equal((commentHtml.match(/<h1\b/g) ?? []).length, 1)
  assert.match(commentHtml, /<h2 id="[^"]+"/)
  assert.match(commentHtml, /我的评论/)
})

test("ordinary posts retain their data contract and base-aware links", () => {
  assert.deepEqual(getExternalPost({ title: "旧文章" }, "old.md"), {})
  assert.deepEqual(
    getPostLink({ url: "/posts/old" }, (url) => `/sub${url}`),
    { href: "/sub/posts/old" }
  )
})

test("external links trim whitespace, preserve queries/hash and bypass the site base", () => {
  const external = getExternalPost(
    { ...post, externalLink: ` ${post.externalLink} ` },
    "post.md"
  )
  assert.equal(external.externalLink, post.externalLink)
  assert.equal(external.sourceAuthor, "作者 <A> & B")
  assert.deepEqual(
    getPostLink({ url: "/posts/record", ...external }, () => {
      throw new Error("must not call withBase")
    }),
    {
      href: post.externalLink,
      target: "_blank",
      rel: "noopener noreferrer"
    }
  )
  assert.equal(
    getExternalPost(
      { ...post, externalLink: "http://example.com", sourceAuthor: " " },
      "p.md"
    ).sourceAuthor,
    undefined
  )
})

for (const value of [
  "",
  "  ",
  null,
  42,
  [],
  {},
  "/relative",
  "//example.com",
  "javascript:alert(1)",
  "data:text/html,a",
  "file:///x",
  "https://user:pass@example.com",
  "https://user@example.com",
  "https:/example.com",
  "https:example.com",
  "https://example.com/a b",
  "https://example.com/a\u0000",
  "https://exam\nple.com/",
  "not-a-url"
]) {
  test(`rejects invalid externalLink: ${JSON.stringify(value)}`, () => {
    assert.throws(
      () => getExternalPost({ ...post, externalLink: value }, "bad-post.md"),
      /bad-post\.md: externalLink/
    )
  })
}

for (const [field, value] of [
  ["title", " "],
  ["description", null],
  ["date", "invalid"],
  ["date", undefined],
  ["date", true],
  ["date", 123],
  ["sourceAuthor", []]
]) {
  test(`validates external metadata: ${field}=${JSON.stringify(value)}`, () => {
    assert.throws(
      () => getExternalPost({ ...post, [field]: value }, "metadata.md"),
      new RegExp(`metadata.md: ${field}`)
    )
  })
}

test("notification YAML parser handles block summaries and real field types", () => {
  const { frontmatter, body } = parsePost(
    `---\ntitle: 测试\ndescription: >-\n  第一行\n  第二行\nexternalLink: 123\ntags: [A, B]\ndraft: true\n---\n正文`
  )
  assert.equal(frontmatter.description, "第一行 第二行")
  assert.equal(frontmatter.externalLink, 123)
  assert.deepEqual(frontmatter.tags, ["A", "B"])
  assert.equal(frontmatter.draft, true)
  assert.equal(body, "正文")
})

test("external notification preserves record URL and adds full source information", () => {
  const payload = createPostPayload(
    { ...post, tags: ["推荐阅读", "推荐阅读"], category: "Development" },
    "",
    "blog/posts/test/recommend.md"
  )
  assert.equal(payload.title, `[推荐阅读] ${post.title}`)
  assert.equal(payload.url, "https://blog.booling.cn/posts/test/recommend")
  assert.match(payload.description, /原作者：作者 <A> & B/)
  assert.ok(payload.description.endsWith(`原文：${post.externalLink}`))
  assert.deepEqual(payload.tags, ["推荐阅读", "Development"])
  assert.throws(
    () =>
      createPostPayload(
        { ...post, externalLink: "javascript:x" },
        "",
        "bad.md"
      ),
    /bad.md: externalLink/
  )
})

test("ordinary notification payload remains unchanged", () => {
  assert.deepEqual(
    createPostPayload(
      { title: "普通文章", description: "摘要", tags: ["A"], category: "Life" },
      "正文",
      "blog/posts/life/ordinary.md"
    ),
    {
      title: "普通文章",
      url: "https://blog.booling.cn/posts/life/ordinary",
      description: "摘要",
      tags: ["A", "Life"]
    }
  )
})

test("RSS rewrites only recommendations, escapes source text and keeps stable non-permalink GUID", () => {
  const recordUrl = "https://blog.booling.cn/sub/posts/test/recommend"
  const xml = `<?xml version="1.0"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item><title>Original</title><link>https://blog.booling.cn/posts/original</link><guid>original</guid><description><![CDATA[ordinary <body>]]></description></item><item><title>Old title</title><link>${recordUrl}</link><guid>override</guid><author>Wrong author</author><dc:creator>Wrong author</dc:creator><content:encoded><![CDATA[should not copy original content]]></content:encoded><pubDate>Fri, 13 Nov 2026 12:00:00 GMT</pubDate></item></channel></rss>`
  const transform = (externalLink) =>
    transformRecommendationRss(
      xml,
      new Map([
        [recordUrl, { ...post, externalLink, sourceAuthor: "作者 <A> & B" }]
      ])
    )
  const parsed = new DOMParser().parseFromString(
    transform(post.externalLink),
    "text/xml"
  )
  const [ordinary, recommendation] = Array.from(
    parsed.getElementsByTagName("item")
  )
  const text = (item, tag) => item.getElementsByTagName(tag)[0]?.textContent
  assert.equal(text(ordinary, "title"), "Original")
  assert.equal(text(ordinary, "description"), "ordinary <body>")
  assert.equal(text(recommendation, "title"), `[推荐阅读] ${post.title}`)
  assert.equal(text(recommendation, "link"), post.externalLink)
  assert.equal(text(recommendation, "guid"), recordUrl)
  assert.equal(
    recommendation.getElementsByTagName("guid")[0].getAttribute("isPermaLink"),
    "false"
  )
  assert.equal(recommendation.getElementsByTagName("author").length, 0)
  assert.match(
    text(recommendation, "dc:creator"),
    /本站推荐者：Booling；原作者：作者/
  )
  assert.match(text(recommendation, "description"), /&lt;案例&gt; &amp;/)
  assert.match(text(recommendation, "description"), /x=1&amp;y=2#section/)
  assert.ok(
    !text(recommendation, "content:encoded").includes("should not copy")
  )
  const changed = new DOMParser().parseFromString(
    transform("https://example.net/new"),
    "text/xml"
  )
  assert.equal(text(changed.getElementsByTagName("item")[1], "guid"), recordUrl)
  assert.equal(transformRecommendationRss(xml, new Map()), xml)
})

import assert from "node:assert/strict"
import { test } from "node:test"
import { createMarkdownRenderer } from "vitepress"
import footnote from "markdown-it-footnote"

const md = await createMarkdownRenderer(process.cwd())
md.use(footnote)

test("Obsidian footnotes render superscripts, external sources and backlinks", () => {
  const html = md.render(
    "正文。[^source]\n\n[^source]: [参考文章](https://example.com)，**补充说明**。"
  )
  assert.match(
    html,
    /<sup class="footnote-ref"><a href="#fn1" id="fnref1">\[1\]<\/a><\/sup>/
  )
  assert.match(html, /<section class="footnotes">/)
  assert.match(html, /<li id="fn1" class="footnote-item">/)
  assert.match(html, /href="https:\/\/example.com"/)
  assert.match(html, /<strong>补充说明<\/strong>/)
  assert.match(html, /href="#fnref1" class="footnote-backref"/)
})

test("repeated references share one note with distinct return targets", () => {
  const html = md.render("第一次。[^note] 第二次。[^note]\n\n[^note]: 说明。")
  assert.equal((html.match(/class="footnote-item"/g) ?? []).length, 1)
  assert.match(html, /id="fnref1"/)
  assert.match(html, /id="fnref1:1"/)
  assert.match(html, /href="#fnref1:1"/)
})

test("footnote syntax inside code stays literal", () => {
  const html = md.render("```markdown\n正文。[^note]\n\n[^note]: 说明。\n```")
  assert.doesNotMatch(html, /class="footnote-ref"/)
  assert.doesNotMatch(html, /class="footnotes"/)
})

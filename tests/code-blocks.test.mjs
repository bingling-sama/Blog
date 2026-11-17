import assert from "node:assert/strict"
import { test } from "node:test"
import { createMarkdownRenderer } from "vitepress"
import { codeBlocks } from "../.vitepress/plugins/code-blocks.ts"

const md = await createMarkdownRenderer(process.cwd())
// Register explicitly, matching the site's markdown.config.
md.use(codeBlocks)
const lines = Array.from(
  { length: 30 },
  (_, i) => `const line${i} = ${i}`
).join("\n")
const fence = (info, code = lines) => `\`\`\`${info}\n${code}\n\`\`\``

test("ordinary blocks are unchanged and do not automatically collapse", async () => {
  const plain = await createMarkdownRenderer(process.cwd())
  assert.equal(md.render(fence("ts")), plain.render(fence("ts")))
})

test("height keeps the code and gutter inside a shared scrollport", () => {
  const html = md.render(fence("ts{3} :line-numbers :height=320px"))
  assert.match(html, /line highlighted/)
  assert.match(html, /--code-max-height:320px/)
  assert.match(html, /class="code-scroll"[^>]*><pre/)
  assert.match(html, /<\/pre>\s*<div class="line-numbers-wrapper"/)
  assert.match(html, /<\/div><\/div><\/div>$/)
  assert.equal((html.match(/class="copy"/g) ?? []).length, 1)
})

for (const height of ["24rem", "50vh", ".5rem", "320.5px"]) {
  test(`accepts height ${height}`, () => {
    assert.ok(
      md
        .render(fence(`ts :height=${height}`))
        .includes(`--code-max-height:${height}`)
    )
  })
}

for (const height of [
  "0px",
  "-1px",
  "320",
  "10%",
  "1px;color:red",
  '1px"onclick="alert(1)'
]) {
  test(`rejects invalid height ${height}`, () => {
    assert.throws(
      () => md.render(fence(`ts :height=${height}`)),
      /Invalid code block height/
    )
  })
}

test("height, highlighting, diff and folding compose", () => {
  const html = md.render(
    fence(
      "ts{3} :collapsed-lines=2 :height=24rem",
      "const a = 1 // [!code --]\nconst b = 2 // [!code ++]\nconst c = 3\nconst d = 4"
    )
  )
  assert.match(html, /has-collapsed-lines collapsed/)
  assert.match(html, /--vp-collapsed-lines:2;/)
  assert.match(html, /--code-max-height:24rem/)
  assert.match(html, /diff remove/)
  assert.match(html, /diff add/)
  assert.match(html, /highlighted/)
  assert.match(
    html,
    /<button type="button" class="collapsed-lines" aria-expanded="false">展开代码<\/button>/
  )
  assert.match(
    html,
    /<\/pre>\s*<\/div><button type="button" class="collapsed-lines"/
  )
})

test("folding has a default preview and leaves short blocks alone", () => {
  assert.match(
    md.render(fence("ts :collapsed-lines")),
    /--vp-collapsed-lines:15;/
  )
  assert.doesNotMatch(
    md.render(fence("ts :collapsed-lines=10", "const a = 1")),
    /has-collapsed-lines/
  )
})

test("details and code groups retain their native containers", () => {
  assert.match(
    md.render(`::: details 完整代码\n${fence("ts :height=20rem")}\n:::`),
    /<details/
  )
  const html = md.render(
    `::: code-group\n${fence("ts :height=20rem [one.ts]")}\n${fence("js [two.js]")}\n:::`
  )
  assert.match(html, /vp-code-group/)
  assert.match(html, /one.ts/)
  assert.match(html, /--code-max-height:20rem/)
})

test("mermaid directives bypass code block enhancements", () => {
  assert.doesNotMatch(
    md.render(
      fence("mermaid :height=20rem :collapsed-lines=2", "graph TD\nA --> B")
    ),
    /code-scroll|has-collapsed-lines/
  )
})

test("rendering does not mutate the fence info token", () => {
  const tokens = md.parse(fence("ts :height=320px"), {})
  md.renderer.render(tokens, md.options, {})
  assert.equal(tokens[0].info, "ts :height=320px")
})

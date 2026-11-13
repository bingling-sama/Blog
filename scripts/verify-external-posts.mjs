import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { spawnSync } from "node:child_process"
import matter from "gray-matter"
import { DOMParser } from "@xmldom/xmldom"

// Never publish fixtures: this runner owns and removes only its temporary directory.
const directory = fs.mkdtempSync("blog/posts/external-test-")
const slug = path.basename(directory)
const tempRoot = path.join(os.tmpdir(), "opencode")
fs.mkdirSync(tempRoot, { recursive: true })
const artifacts = fs.mkdtempSync(path.join(tempRoot, "external-posts-"))
const externalLink = "https://example.com/article?x=1&y=2#section"
const metadata = {
  title: "外链验收：一篇值得读的文章",
  date: "2099-11-13 12:00:00",
  description: "本站推荐语 <不是 HTML> & 案例分析。",
  category: "ExternalTest",
  tags: ["ExternalTest"],
  externalLink: ` ${externalLink} `,
  sourceAuthor: " 原作者 <A> & B "
}
const files = []
const write = (name, data, body = "") => {
  const filename = path.join(directory, `${name}.md`)
  fs.writeFileSync(filename, matter.stringify(body, data))
  if (!files.includes(filename)) files.push(filename)
  return filename
}
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: "utf8", ...options })
  if (result.error) throw result.error
  return result
}
const mustRun = (command, args) => {
  const result = run(command, args, { stdio: "inherit" })
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed`)
}

try {
  const emptyFile = write("empty", metadata)
  write(
    "comments",
    { ...metadata, title: "无署名推荐", sourceAuthor: " " },
    "# 无署名推荐\n\n这是本站作者的补充评论。\n\n# 另一节\n\n更多评论。"
  )
  write(
    "ordinary",
    {
      title: "普通文章验收",
      date: "2099-11-12 12:00:00",
      description: "普通摘要",
      category: "ExternalTest",
      tags: ["ExternalTest"]
    },
    "# 普通文章验收\n\n这是普通正文，保持阅读时长和站内跳转。"
  )

  mustRun(process.execPath, [
    "scripts/notify-teleblog.mjs",
    "--dry-run",
    emptyFile
  ])
  for (const base of ["/", "/sub/"]) {
    mustRun("pnpm", ["build", "--base", base])
    const recordPath = `${base}posts/${slug}/empty`
    const xml = fs.readFileSync(".vitepress/dist/feed.xml", "utf8")
    const doc = new DOMParser().parseFromString(xml, "text/xml")
    const entry = Array.from(doc.getElementsByTagName("item")).find(
      (item) =>
        item.getElementsByTagName("guid")[0]?.textContent ===
        `https://blog.booling.cn${recordPath}`
    )
    assert.ok(entry, `stable RSS identity for ${base}`)
    assert.equal(
      entry.getElementsByTagName("link")[0].textContent,
      externalLink
    )
    assert.equal(
      entry.getElementsByTagName("guid")[0].getAttribute("isPermaLink"),
      "false"
    )
    assert.match(
      entry.getElementsByTagName("description")[0].textContent,
      /原作者/
    )
    assert.match(
      entry.getElementsByTagName("content:encoded")[0].textContent,
      /本站推荐记录/
    )
    assert.ok(
      !fs
        .readFileSync(".vitepress/dist/sitemap.xml", "utf8")
        .includes("example.com")
    )

    mustRun("uv", [
      "run",
      "--with",
      "playwright",
      "python",
      "tests/external-posts-browser.py",
      slug,
      base,
      artifacts
    ])
    console.log(
      `PASS production build, RSS XML, sitemap and browser regression: base=${base}`
    )
  }

  write("invalid", { ...metadata, externalLink: "javascript:alert(1)" })
  const invalidBuild = run("pnpm", ["build"])
  assert.notEqual(invalidBuild.status, 0)
  assert.match(
    invalidBuild.stdout + invalidBuild.stderr,
    /invalid\.md: externalLink/
  )
  const invalidNotice = run(process.execPath, [
    "scripts/notify-teleblog.mjs",
    "--dry-run",
    path.join(directory, "invalid.md")
  ])
  assert.notEqual(invalidNotice.status, 0)
  assert.match(
    invalidNotice.stdout + invalidNotice.stderr,
    /invalid\.md: externalLink/
  )
  assert.ok(!invalidNotice.stdout.includes('"url":'))
  console.log("PASS invalid metadata blocks production build and notification")
} finally {
  for (const filename of files) fs.unlinkSync(filename)
  fs.rmdirSync(directory)
  console.log(`Temporary source fixtures removed. Screenshots: ${artifacts}`)
}

// Leave deployable output free of test recommendations and restore the normal base.
mustRun("pnpm", ["build"])
console.log("PASS fixture-free final production build")

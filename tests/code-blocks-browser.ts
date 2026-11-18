/**
 * Run against `pnpm dev`: node tests/code-blocks-browser.ts
 */
import os from "node:os"
import path from "node:path"
import fs from "node:fs"
import { chromium } from "playwright"

const root = path.resolve(import.meta.dirname, "..")
const artifactDir = path.join(os.tmpdir(), "opencode")
fs.mkdirSync(artifactDir, { recursive: true })
const fixtureFile = path.join(root, "blog/pages", `code-blocks-check-${Date.now()}.md`)
const code = Array.from({ length: 40 }, (_, i) => `const line${i} = ${i}`).join("\n")
const body = [
  "# Code block checks",
  "",
  "```ts{3} :line-numbers :collapsed-lines=5 :height=200px",
  code,
  "```",
  "",
  "```ts :height=200px",
  "const short = true",
  "```",
  "",
  "```ts :collapsed-lines=5",
  code,
  "```",
  "",
  "::: code-group",
  "```ts :height=200px [one.ts]",
  code,
  "```",
  "```js [two.js]",
  "const second = true",
  "```",
  ":::",
  "",
  "```ts",
  "const a = 1 // [!code --]",
  "const b = 2 // [!code ++]",
  "```",
  ""
].join("\n")

fs.writeFileSync(fixtureFile, body)

try {
  const cached = fs
    .readdirSync(path.join(os.homedir(), "Library/Caches/ms-playwright"), {
      withFileTypes: true
    })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium_headless_shell-"))
    .sort()
    .map((entry) =>
      path.join(
        os.homedir(),
        "Library/Caches/ms-playwright",
        entry.name,
        "chrome-headless-shell-mac-arm64",
        "chrome-headless-shell"
      )
    )
    .filter((file) => fs.existsSync(file))
  const browser = await chromium.launch(cached.length ? { executablePath: cached.at(-1) } : {})
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"]
  })
  await context.route("**/*", (route) =>
    route.request().url().startsWith("http://localhost:3000")
      ? route.continue()
      : route.abort()
  )
  const page = await context.newPage()
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(`http://localhost:3000/${path.basename(fixtureFile, ".md")}`)
  await page.waitForLoadState("networkidle")
  const block = page.locator(".vp-doc .has-collapsed-lines").first()
  const button = block.locator("button.collapsed-lines")
  const scroll = block.locator(".code-scroll")
  if (await button.getAttribute("aria-expanded") !== "false") throw new Error("code block should start collapsed")
  if (await block.locator(".line.highlighted").count() !== 1) throw new Error("highlighted line missing")
  await button.focus()
  await page.keyboard.press("Enter")
  if (await button.getAttribute("aria-expanded") !== "true") throw new Error("Enter did not expand code")
  if (await scroll.evaluate((el) => el.clientHeight) !== 200) throw new Error("height mismatch")
  if (!(await scroll.evaluate((el) => el.scrollHeight > el.clientHeight))) throw new Error("scrollport missing")
  const before = (await block.locator(".line-number").first().boundingBox())?.y ?? 0
  await scroll.evaluate((el) => { el.scrollTop = 100 })
  const after = (await block.locator(".line-number").first().boundingBox())?.y ?? 0
  if (Math.abs(before - after - 100) >= 1) throw new Error("gutter does not scroll with code")
  await block.hover()
  await block.locator("button.copy").click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  if (!copied.includes("const line39 = 39") || copied.includes("展开代码")) throw new Error("copy output mismatch")
  await button.focus()
  await page.keyboard.press("Space")
  if (await button.getAttribute("aria-expanded") !== "false") throw new Error("Space did not collapse code")
  if (await scroll.evaluate((el) => el.scrollTop) !== 0) throw new Error("collapse did not reset scroll")
  const short = page.locator(".vp-doc .code-scroll").nth(1)
  if ((await short.evaluate((el) => el.clientHeight)) >= 200) throw new Error("short block has a forced height")
  if (await page.locator(".vp-doc .diff.add").count() !== 1 || await page.locator(".vp-doc .diff.remove").count() !== 1) throw new Error("diff markers missing")
  await page.locator(".vp-code-group label").filter({ hasText: "two.js" }).click()
  if (!(await page.locator(".vp-code-group .active").innerText()).includes("second")) throw new Error("code group did not switch")
  await page.locator(".vp-code-group label").filter({ hasText: "one.ts" }).click()
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle("dark", value), dark)
    await page.evaluate(async () => {
      document.body.getBoundingClientRect()
      await Promise.all(document.getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})))
    })
    await page.screenshot({ path: path.join(artifactDir, `code-blocks-${dark ? "dark" : "light"}.png`) })
  }
  for (const width of [280, 320, 414]) {
    await page.setViewportSize({ width, height: 900 })
    const box = await scroll.boundingBox()
    if (!box || box.right > width + 1 || box.left < -1) throw new Error(`overflow at ${width}px`)
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.locator(".VPNavBarTitle").click()
  await page.waitForURL("http://localhost:3000/")
  await page.goBack()
  await page.waitForLoadState("networkidle")
  await page.locator(".vp-doc button.collapsed-lines").first().click()
  if (await page.locator(".vp-doc button.collapsed-lines").first().getAttribute("aria-expanded") !== "true") throw new Error("SPA navigation lost folding handler")
  if (errors.length) throw new Error(errors.join("\n"))
  console.log(`Browser checks passed: keyboard folding, scroll/gutter, copy, code groups, diff, themes, mobile, SPA.\nScreenshots: ${artifactDir}/code-blocks-{light,dark}.png`)
  await browser.close()
} finally {
  fs.rmSync(fixtureFile, { force: true })
}

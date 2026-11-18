import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"

const [slug, base, artifacts] = process.argv.slice(2)
const dist = path.resolve(".vitepress/dist")
const externalUrl = "https://example.com/article?x=1&y=2#section"
const record = `${base}posts/${slug}/empty`

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://localhost")
  if (!requestUrl.pathname.startsWith(base)) {
    response.writeHead(404)
    response.end()
    return
  }
  const relative = requestUrl.pathname.slice(base.length)
  const candidates = [
    path.join(dist, relative),
    path.join(dist, `${relative}.html`),
    path.join(dist, relative, "index.html")
  ]
  const file = candidates.find((candidate) => {
    try { return fs.statSync(candidate).isFile() } catch { return false }
  })
  if (!file) {
    response.writeHead(404)
    response.end()
    return
  }
  fs.createReadStream(file).pipe(response)
})

const contrast = async (locator) => locator.evaluate((element) => {
  const rgb = (color) => color.match(/[\d.]+/g).map(Number)
  const over = (foreground, background) =>
    foreground.slice(0, 3).map((channel, index) =>
      channel * (foreground[3] ?? 1) + background[index] * (1 - (foreground[3] ?? 1)))
  const ancestors = []
  for (let node = element; node; node = node.parentElement) ancestors.unshift(node)
  let background = [255, 255, 255]
  for (const node of ancestors) background = over(rgb(getComputedStyle(node).backgroundColor), background)
  const foreground = over(rgb(getComputedStyle(element).color), background)
  const luminance = (color) => color.map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
})

try {
  await new Promise((resolve) => server.listen(0, resolve))
  const address = server.address()
  const origin = `http://127.0.0.1:${address.port}`
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname
    if (host === "127.0.0.1") return route.continue()
    if (host === "example.com") return route.fulfill({ body: "<h1>Original article fixture</h1>", contentType: "text/html" })
    return route.abort()
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(String(error)))

  const visit = async (route) => {
    await page.goto(origin + route)
    await page.waitForLoadState("networkidle")
    await page.waitForFunction(() => {
      const info = document.querySelector(".post-info")
      const image = document.querySelector(".hero-image")
      return (!info || getComputedStyle(info).display === "flex") &&
        (!image || getComputedStyle(image).width !== "1920px")
    })
  }
  const externalLink = (title = "外链验收：一篇值得读的文章") => {
    const link = title === "阅读原文"
      ? page.locator('a[href^="https://example.com/article"]').first()
      : page.locator("a.post-link").first()
    return link
  }
  const settle = () => page.evaluate(() =>
    Promise.allSettled(document.getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished)))

  await visit(base)
  let link = externalLink()
  await link.waitFor()
  if (await link.getAttribute("href") !== externalUrl ||
      await link.getAttribute("target") !== "_blank" ||
      !(new Set((await link.getAttribute("rel")).split(" ")).has("noopener")) ||
      !(await link.innerText()).includes("推荐阅读")) throw new Error("external link contract failed")
  const card = link.locator("xpath=ancestor::div[contains(@class, 'post-list')]").first()
  if (!(await card.locator(".recommendation-mark").isVisible()) ||
      (await card.locator(".post-reading-time").count()) !== 0) throw new Error("recommendation card contract failed")
  const ordinary = page.getByRole("link", { name: "普通文章验收", exact: true })
  if (await ordinary.getAttribute("target") !== null ||
      (await ordinary.locator("xpath=ancestor::div[contains(@class, 'post-list')]").first().locator(".post-reading-time").count()) !== 1) throw new Error("ordinary post contract failed")
  const popupPromise = context.waitForEvent("page")
  await link.focus()
  await page.keyboard.press("Enter")
  const popup = await popupPromise
  await popup.waitForLoadState()
  if (popup.url() !== externalUrl || await popup.evaluate(() => window.opener !== null)) throw new Error("external popup is unsafe")
  await popup.close()
  await card.getByRole("link", { name: "ExternalTest", exact: true }).click()
  await page.waitForURL("**/tags?tag=ExternalTest")
  for (const route of [base + "archives", base + "category", base + "tags?tag=ExternalTest"]) {
    await visit(route)
    link = externalLink()
    if (await link.getAttribute("target") !== "_blank") throw new Error(`external link missing target on ${route}`)
    if (!(await link.locator(".recommendation-mark svg").isVisible())) throw new Error(`recommendation mark missing on ${route}`)
  }

  await visit(record)
  if (await page.locator(".vp-doc h1").count() !== 1 ||
      await page.locator(".external-post-record").count() !== 1 ||
      (await page.locator(".post-reading-time").count()) !== 0) throw new Error("record page contract failed")
  if (!(await page.locator(".post-meta").innerText()).includes("本页访问量") ||
      !(await page.locator(".external-post-record").innerText()).includes("example.com")) throw new Error("record metadata missing")
  await visit(`${base}posts/${slug}/comments`)
  if (await page.locator(".vp-doc h1").count() !== 1 ||
      (await page.locator(".vp-doc").innerText()).includes("原作者：")) throw new Error("comment page contract failed")

  await visit(base)
  await page.getByRole("button", { name: "Search K", exact: true }).click()
  await page.locator("#localsearch-input").fill("外链验收")
  const result = page.locator(`.result[href^="${record}"]`).first()
  await result.waitFor()
  await result.click()
  await page.waitForURL(`**${record}*`)
  await page.locator(".external-post-record").waitFor()

  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: theme })
    for (const width of [280, 320, 414, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of [base, base + "archives", base + "category", base + "tags?tag=ExternalTest", record]) {
        await visit(route)
        await settle()
        if (await page.evaluate(() => document.documentElement.classList.contains("dark")) !== (theme === "dark")) throw new Error("theme mismatch")
        if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error(`horizontal overflow: ${route} ${width}`)
        const target = externalLink(route === record ? "阅读原文" : "外链验收：一篇值得读的文章")
        await target.scrollIntoViewIfNeeded()
        if (!(await target.isVisible())) throw new Error("external link is not visible")
        if (width === 1280) {
          for (const state of ["default", "hover", "focus", "active"]) {
            if (state === "hover") await target.hover()
            if (state === "focus") await target.focus()
            if (state === "active") { await target.hover(); await page.mouse.down() }
            await settle()
            if (await contrast(target) < 4.5 || await contrast(target.locator(".recommendation-mark")) < 4.5) throw new Error(`contrast failed: ${state}`)
            if (state === "active") { await page.mouse.up(); await page.mouse.move(0, 0) }
          }
          await target.blur()
        }
        if (width === 320 || width === 1280) {
          const label = route === record ? "record" : route === base ? "home" : route.split("/").at(-1)
          await page.screenshot({ path: path.join(artifacts, `${base.replaceAll("/", "") || "root"}-${label}-${theme}-${width}.png`) })
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"))
  console.log("PASS production browser regression")
  await browser.close()
} finally {
  server.close()
}

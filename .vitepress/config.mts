import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { defineConfig, loadEnv } from "vitepress"
import { withResponsiveImages } from "vitepress-plugin-responsive-images"
import { RssPlugin } from "vitepress-plugin-rss"
import type { PostInfo, RSSOptions } from "vitepress-plugin-rss"
import { bnfLanguage, caddyfileLanguage } from "./shiki-languages"
import { markdownItObsidian } from "./plugins/markdown-it-obsidian"
import { tasklist } from "@mdit/plugin-tasklist"

const env = loadEnv("", process.cwd(), "")
const defaultSrcExclude = ["README.md"]
const envSrcExclude = (env.EXCLUDE ?? "")
  .split(",")
  .map((item) => item.trim().replace(/^["'“”‘’]|["'“”‘’]$/g, ""))
  .filter(Boolean)

const srcExclude = [...defaultSrcExclude, ...envSrcExclude]
const siteUrl = "https://blog.booling.cn"

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value ? [value] : []
}

function toCategoryName(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value
  }

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === "string" ? name : undefined
  }
}

function normalizePostCategories(post: PostInfo): void {
  const categoryNames = [
    ...toArray(post.frontmatter.category),
    ...toArray(post.frontmatter.tags)
  ]
    .map(toCategoryName)
    .filter((name): name is string => Boolean(name))

  post.frontmatter.category = [...new Set(categoryNames)].map((name) => ({
    name
  }))
}

const RSS: RSSOptions = {
  title: "Booling✨",
  description: "vitepress,blog,booling,bingling_sama",
  baseUrl: siteUrl,
  copyright: "Copyright (c) 2022-present Booling",
  language: "zh-CN",
  filename: "feed.xml",
  ariaLabel: "RSS Feed",
  author: {
    name: "Booling",
    link: "https://github.com/bingling-sama"
  },
  filter(post) {
    if (
      !post.url.startsWith("/posts/") ||
      post.filepath.includes("/.drafts/")
    ) {
      return false
    }

    normalizePostCategories(post)
    return true
  }
}

export default withResponsiveImages(
  defineConfig({
    title: "Booling✨",
    base: "/",
    srcDir: "blog",
    cacheDir: "./node_modules/vitepress_cache",
    description: "vitepress,blog,booling,bingling_sama",
    markdown: {
      math: true,
      languages: [caddyfileLanguage, bnfLanguage],
      config(md) {
        md.use(tasklist)
        md.use(
          markdownItObsidian({
            publicDir: "blog/public",
            srcDir: "blog",
            base: "/"
          })
        )

        const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules)
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const info = token.info.trim()
          if (info === "mermaid" || info === "mmd") {
            return `<Suspense><template #default><Mermaid id="mermaid-${idx}" graph="${encodeURIComponent(token.content)}"></Mermaid></template><template #fallback><div class="mermaid-loading">Loading diagram...</div></template></Suspense>`
          }
          return defaultFence(tokens, idx, options, env, self)
        }
      }
    },
    ignoreDeadLinks: true,
    head: [
      [
        "link",
        {
          rel: "icon",
          href: "/favicon.png"
        }
      ],
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "Booling✨ RSS Feed",
          href: "/feed.xml"
        }
      ],
      [
        "meta",
        {
          name: "referrer",
          content: "no-referrer-when-downgrade"
        }
      ]
    ],
    rewrites: {
      "pages/:page.md": ":page.md"
    },
    themeConfig: {
      website: "https://github.com/bingling-sama/Blog",
      nav: [
        { text: "Home", link: "/" },
        { text: "Category", link: "/category" },
        { text: "Archives", link: "/archives" },
        { text: "Tags", link: "/tags" },
        { text: "About", link: "/about" }
      ],
      search: {
        provider: "local",
        options: {
          translations: {
            button: {
              buttonText: "Search",
              buttonAriaLabel: "Search K"
            }
          }
        }
      },
      outline: {
        label: "文章摘要"
      },
      socialLinks: [
        { icon: "github", link: "https://github.com/bingling-sama" }
      ]
    } as any,
    srcExclude,
    lastUpdated: true,
    cleanUrls: true,
    sitemap: {
      hostname: siteUrl
    },
    buildEnd: async (siteConfig) => {
      // 1. 生成响应式 hero 图片
      const heroPath = path.resolve(siteConfig.outDir, "hero.webp")
      if (fs.existsSync(heroPath)) {
        await sharp(heroPath)
          .resize({ width: 768, withoutEnlargement: true })
          .webp({ quality: 80, effort: 5 })
          .toFile(path.resolve(siteConfig.outDir, "hero-768w.webp"))

        await sharp(heroPath)
          .resize({ width: 1440, withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(path.resolve(siteConfig.outDir, "hero-1440w.webp"))
      }

      // 2. 将 vp-icons.css 内联进所有生成的 HTML 中，消除渲染阻塞外链
      const iconsPath = path.resolve(siteConfig.outDir, "vp-icons.css")
      if (fs.existsSync(iconsPath)) {
        const iconsCss = fs.readFileSync(iconsPath, "utf-8").trim()
        const walkHtml = (dir: string) => {
          for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item)
            if (fs.statSync(full).isDirectory()) {
              walkHtml(full)
            } else if (item.endsWith(".html")) {
              const html = fs.readFileSync(full, "utf-8")
              if (html.includes("vp-icons.css")) {
                const replaced = html.replace(
                  /<link[^>]+href="[^"]*vp-icons\.css"[^>]*>/i,
                  `<style id="vp-icons">${iconsCss}</style>`
                )
                fs.writeFileSync(full, replaced, "utf-8")
              }
            }
          }
        }
        walkHtml(siteConfig.outDir)
      }
    },
    vite: {
      plugins: [
        RssPlugin(RSS),
        {
          name: "hero-responsive-dev",
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              const match = req.url?.match(/^\/hero-(\d+)w\.webp$/)
              if (match) {
                const width = parseInt(match[1], 10)
                const heroPath = path.resolve(
                  process.cwd(),
                  "blog/public/hero.webp"
                )
                if (fs.existsSync(heroPath)) {
                  const buf = await sharp(heroPath)
                    .resize({ width, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer()
                  res.setHeader("Content-Type", "image/webp")
                  res.end(buf)
                  return
                }
              }
              next()
            })
          }
        }
      ],
      server: { port: 3000 },
      build: {
        cssCodeSplit: true,
        cssMinify: "lightningcss"
      },
      optimizeDeps: {
        include: ["dayjs"]
      },
      resolve: {
        alias: [
          {
            find: /^dayjs$/,
            replacement: "dayjs/esm/index.js"
          }
        ]
      }
    }
  }),
  {
    widths: [640, 1024, 1600],
    formats: ["webp"],
    sizes: "(max-width: 768px) 100vw, 720px",
    quality: {
      webp: 85
    }
  }
)

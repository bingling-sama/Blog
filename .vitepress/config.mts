import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vitepress"
import { withMermaid } from "vitepress-plugin-mermaid"
import { RssPlugin } from "vitepress-plugin-rss"
import type { PostInfo, RSSOptions } from "vitepress-plugin-rss"
import { bnfLanguage, caddyfileLanguage } from "./shiki-languages"

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

export default withMermaid(
  defineConfig({
    title: "Booling✨",
    base: "/",
    srcDir: "blog",
    cacheDir: "./node_modules/vitepress_cache",
    description: "vitepress,blog,booling,bingling_sama",
    markdown: {
      math: true,
      languages: [caddyfileLanguage, bnfLanguage]
    },
    mermaid: {
      theme: "base",
      themeVariables: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: "13px",
        background: "#ffffff",
        primaryColor: "#ffffff",
        primaryTextColor: "#18181b",
        primaryBorderColor: "#d4d4d8",
        lineColor: "#71717a",
        arrowheadColor: "#ff5e1f",
        edgeLabelBackground: "#ffffff",
        textColor: "#18181b",
        secondaryColor: "#fafafa",
        secondaryBorderColor: "#d4d4d8",
        secondaryTextColor: "#18181b",
        tertiaryColor: "#f4f4f5",
        tertiaryBorderColor: "#d4d4d8",
        tertiaryTextColor: "#18181b",
        clusterBkg: "#fafafa",
        clusterBorder: "#e4e4e7",
        noteBkgColor: "#fff7ed",
        noteTextColor: "#9a3412",
        noteBorderColor: "#fed7aa",
        actorBkg: "#ffffff",
        actorBorder: "#d4d4d8",
        actorTextColor: "#18181b",
        actorLineColor: "#a1a1aa",
        signalColor: "#18181b",
        signalTextColor: "#18181b",
        labelBoxBkgColor: "#ffffff",
        labelBoxBorderColor: "#d4d4d8",
        labelTextColor: "#18181b",
        loopTextColor: "#18181b",
        activationBorderColor: "#ff5e1f",
        activationBkgColor: "#ffedd5"
      },
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
        padding: 16,
        nodeSpacing: 45,
        rankSpacing: 75,
        wrappingWidth: 350,
        subGraphTitleMargin: { top: 5, bottom: 15 }
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
        provider: "local"
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
		vite: {
			plugins: [RssPlugin(RSS)],
			server: { port: 3000 },
			optimizeDeps: {
				include: [
					'mermaid',
					'fastdom',
					'dayjs'
				]
			},
			resolve: {
				alias: [
					{
						find: /^dayjs$/,
						replacement: 'dayjs/esm/index.js'
					}
				]
			}
		}
  })
)

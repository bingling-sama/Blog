import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vitepress'
import { RssPlugin } from 'vitepress-plugin-rss'
import type { PostInfo, RSSOptions } from 'vitepress-plugin-rss'

const env = loadEnv('', process.cwd(), '')
const defaultSrcExclude = ['README.md']
const envSrcExclude = (env.EXCLUDE ?? '')
	.split(',')
	.map((item) => item.trim().replace(/^["'“”‘’]|["'“”‘’]$/g, ''))
	.filter(Boolean)

const srcExclude = [...defaultSrcExclude, ...envSrcExclude]
const siteUrl = 'https://blog.booling.cn'

function toArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : value ? [value] : []
}

function toCategoryName(value: unknown): string | undefined {
	if (typeof value === 'string') {
		return value
	}

	if (value && typeof value === 'object' && 'name' in value) {
		const name = (value as { name?: unknown }).name
		return typeof name === 'string' ? name : undefined
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
	title: 'Booling✨',
	description: 'vitepress,blog,booling,bingling_sama',
	baseUrl: siteUrl,
	copyright: 'Copyright (c) 2022-present Booling',
	language: 'zh-CN',
	filename: 'feed.xml',
	ariaLabel: 'RSS Feed',
	author: {
		name: 'Booling',
		link: 'https://github.com/bingling-sama'
	},
	filter(post) {
		if (!post.url.startsWith('/posts/') || post.filepath.includes('/.drafts/')) {
			return false
		}

		normalizePostCategories(post)
		return true
	}
}

export default defineConfig({
	title: 'Booling✨',
	base: '/',
	srcDir: 'blog',
	cacheDir: './node_modules/vitepress_cache',
	description: 'vitepress,blog,booling,bingling_sama',
	markdown: {
		math: true
	},
	ignoreDeadLinks: true,
	head: [
		["link", {
			rel: "icon",
			href: "/favicon.png"
		}],
		["link", {
			rel: "alternate",
			type: "application/rss+xml",
			title: "Booling✨ RSS Feed",
			href: "/feed.xml"
		}]
	],
	rewrites: {
		'pages/:page.md': ':page.md',
	},
	themeConfig: {
		website: 'https://github.com/bingling-sama/Blog',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Category', link: '/category' },
			{ text: 'Archives', link: '/archives' },
			{ text: 'Tags', link: '/tags' },
			{ text: 'About', link: '/about' }
		],
		search: {
			provider: 'local',
		},
		outline: {
			label: '文章摘要'
		},
		socialLinks: [{ icon: 'github', link: 'https://github.com/bingling-sama' }]
	} as any,
	srcExclude,
	lastUpdated: true,
	cleanUrls: true,
	sitemap: {
		hostname: siteUrl
	},
	vite: {
		plugins: [RssPlugin(RSS)],
		server: { port: 3000 }
	}
})

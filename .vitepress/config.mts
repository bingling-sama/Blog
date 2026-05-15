import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vitepress'

const env = loadEnv('', process.cwd(), '')
const defaultSrcExclude = ['README.md']
const envSrcExclude = (env.EXCLUDE ?? '')
	.split(',')
	.map((item) => item.trim().replace(/^["'“”‘’]|["'“”‘’]$/g, ''))
	.filter(Boolean)

const srcExclude = [...defaultSrcExclude, ...envSrcExclude]

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
		hostname: 'https://blog.booling.cn'
	},
	vite: {
		server: { port: 3000 }
	}
})

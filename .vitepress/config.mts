import { defineConfig } from 'vitepress'
import { getPosts } from '../theme/serverUtils'

const pageSize = 10

export default defineConfig({
	title: 'Booling✨',
	base: '/',
	cacheDir: './node_modules/vitepress_cache',
	description: 'vitepress,blog,booling,bingling_sama',
	ignoreDeadLinks: true,
	head: [
		["link", {
			rel: "icon",
			href: "/favicon.png"
		}]
	],
	themeConfig: {
		posts: await getPosts(pageSize),
		website: 'https://github.com/bingling-sama/Blog',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Category', link: '/pages/category' },
			{ text: 'Archives', link: '/pages/archives' },
			{ text: 'Tags', link: '/pages/tags' },
			{ text: 'About', link: '/pages/about' }
		],
		search: {
			provider: 'local',
		},
		outline: {
			label: '文章摘要'
		},
		socialLinks: [{ icon: 'github', link: 'https://github.com/bingling-sama' }]
	} as any,
	srcExclude: ['README.md'],
	vite: {
		server: { port: 5000 }
	}
})

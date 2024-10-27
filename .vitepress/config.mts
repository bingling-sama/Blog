import { defineConfig } from 'vitepress'
import { getPosts } from '../theme/serverUtils'

//每页的文章数量
const pageSize = 10

export default defineConfig({
	title: 'Booling✨',
	base: '/',
	cacheDir: './node_modules/vitepress_cache',
	description: 'vitepress,blog,booling,bingling_sama',
	ignoreDeadLinks: true,
	themeConfig: {
		posts: await getPosts(pageSize),
		website: 'https://github.com/bingling-sama/Blog', //copyright link
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
		socialLinks: [{ icon: 'github', link: 'https://github.com/airene/vitepress-blog-pure' }]
	} as any,
	srcExclude: ['README.md'],
	vite: {
		server: { port: 5000 }
	}
})

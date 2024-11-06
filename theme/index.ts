import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import MyLayout from './components/MyLayout.vue'
import Archives from './components/Archives.vue'
import Category from './components/Category.vue'
import Tags from './components/Tags.vue'
import Page from './components/Page.vue'
import Comment from './components/Comment.vue'

import './custom.css'

export default {
	...DefaultTheme,
	Layout: MyLayout,
	enhanceApp({ app }) {
		// register global component
		app.component('Tags', Tags)
		app.component('Category', Category)
		app.component('Archives', Archives)
		app.component('Page', Page)
		app.component('Comment', Comment)
	}
} satisfies Theme

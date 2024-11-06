import { createContentLoader } from 'vitepress'
import type { Post } from './functions'

export default createContentLoader("posts/**/*.md", {
	transform(raw): Post[] {
		return raw.map(({ url, frontmatter }) => ({
			url: url,
			title: frontmatter.title,
			description: frontmatter.description,
			date: transformDate(frontmatter.date),
			category: frontmatter.category,
			tags: frontmatter.tags
		} as Post))
	}
})

function transformDate(date: string): string {
	const d = new Date(date);
	return d.toISOString().replace('T', ' ').substring(0, 19);
}
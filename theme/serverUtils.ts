// import { globby } from 'globby'
// import matter from 'gray-matter'
// import fs from 'fs-extra'
// import { resolve } from 'path'

// // ...existing code...

// async function generatePaginationPages(total: number, pageSize: number) {
// 	//  pagesNum
// 	let pagesNum = total % pageSize === 0 ? total / pageSize : Math.floor(total / pageSize) + 1
// 	const paths = resolve('./')
// 	if (total > 0) {
// 		for (let i = 1; i < pagesNum + 1; i++) {
// 			const page = `
// ---
// page: true
// title: ${i === 1 ? 'Home' : 'page_' + i}
// aside: false
// ---
// <script setup>
// import Page from "./theme/components/Page.vue";
// import { useData } from "vitepress";
// const { theme } = useData();
// const posts = theme.value.posts.slice(${pageSize * (i - 1)},${pageSize * i})
// </script>
// <Page :posts="posts" :pageCurrent="${i}" :pagesNum="${pagesNum}" />
// `.trim()
// 			const file = paths + `/page_${i}.md`
// 			await fs.writeFile(file, page)
// 		}
// 	}
// 	// rename page_1 to index for homepage
// 	await fs.move(paths + '/page_1.md', paths + '/index.md', { overwrite: true })
// }

// // ...existing code...

// export { generatePaginationPages }

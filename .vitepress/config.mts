import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Booling",
	description: "bingling_sama's personal blog site",
	head: [
		["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
		[
			"link",
			{
				href: "https://cdn.jsdelivr.net/npm/misans@3.1.1/lib/misans-400-regular.min.css",
				rel: "stylesheet"
			}
		]
	]
})

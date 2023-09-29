<script setup lang="ts">
import { useData } from "vitepress"
import Home from "./layouts/Home.vue"
import Header from "./components/Header.vue"
import Post from "./layouts/Post.vue"

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()
</script>

<template>
	<v-layout row wrap>
		<Header></Header>
		<Home v-if="frontmatter.home">
			<template #content>
				<Content class="typo" />
			</template>
		</Home>
		<Post v-else>
			<template #content>
				<Content class="typo" />
			</template>
		</Post>
	</v-layout>
</template>

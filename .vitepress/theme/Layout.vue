<script setup lang="ts">
import { useData } from 'vitepress'
import Home from './components/Home.vue'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()
</script>

<template>
	<v-layout row wrap>
		<Home>
			<template #content>
				<Content />
			</template>
		</Home>
	</v-layout>
</template>

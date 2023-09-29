<script lang="ts" setup>
import { useData } from 'vitepress'

const { site, frontmatter } = useData()
</script>

<template>
	<v-main>
		<v-parallax src="/images/hero.webp" max-height="600" cover>
			<div
				class="d-flex flex-column fill-height justify-center align-center text-white"
			>
				<h1 class="title text-h4 font-weight-bold mb-4">
					{{ site.title }}
				</h1>
				<h4 class="subheading">{{ frontmatter.slogan }}</h4>
			</div>
		</v-parallax>
		<slot name="content"></slot>
	</v-main>
</template>

<style lang="stylus" scoped>
.title
.subheading
	color #e0eef0
</style>

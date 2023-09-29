<script lang="ts" setup>
import { useData } from 'vitepress'

const { site, page } = useData()
</script>

<template>
	<v-app-bar density="compact" scroll-behavior="hide" elevate>
		<template #prepend>
			<a href="/"
				><v-avatar image="/images/avatar.webp" size="40"> </v-avatar>
			</a>
		</template>

		<v-app-bar-title>{{ site.title }} | {{ page.title }}</v-app-bar-title>

		<template #append> </template>
	</v-app-bar>
</template>

<style lang="stylus" scoped></style>

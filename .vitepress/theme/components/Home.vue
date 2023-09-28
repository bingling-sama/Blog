<script lang="ts" setup>
import Header from './Header.vue'
</script>

<template>
	<Header></Header>
	<v-main>
		<slot name="content"></slot>
	</v-main>
</template>

<style lang="stylus" scoped></style>

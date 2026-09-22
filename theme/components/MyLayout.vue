<template>
  <Layout>
    <template #doc-before>
      <div
        v-if="!$frontmatter.page"
        style="padding-top: 20px"
        class="post-info"
      >
        <span class="post-date">
          {{ $frontmatter.date?.substring(0, 10) }}
        </span>
        <span v-if="readingTime" class="post-reading-time">
          <svg
            class="reading-time-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ readingTime }}
        </span>
        <span v-for="item in $frontmatter.tags" :key="item" class="post-tag">
          <a :href="withBase(`/pages/tags.html?tag=${item}`)">{{ item }}</a>
        </span>
        <span id="counter_container_page_pv" class="post-info-pv">
          <svg
            class="pv-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          阅读量
          <span id="counter_value_page_pv">{{
            counterData.pagePv || "--"
          }}</span>
          次
        </span>
        <span
          v-if="counterData.pageUv"
          id="counter_container_page_uv"
          class="post-info-uv"
        >
          <svg
            class="uv-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          访客数
          <span id="counter_value_page_uv">{{ counterData.pageUv }}</span> 人
        </span>
      </div>
    </template>
    <template #home-hero-after>
      <img :src="withBase('/hero.webp')" alt="Hero Image" />
    </template>
  </Layout>
  <Copyright />
</template>
<script setup>
import { computed, onMounted } from "vue"
import DefaultTheme from "vitepress/theme"
import Copyright from "./Copyright.vue"
import { useRoute, withBase } from "vitepress"
import { counterData, fetchCounter } from "../scripts/counter"
import { useScrollHash } from "../scripts/useScrollHash"
// @ts-expect-error
import { data as posts } from "../scripts/posts.data"

const { Layout } = DefaultTheme

useScrollHash()

const route = useRoute()

const readingTime = computed(() => {
  const currentPath = route.path
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/$/, "")

  const matched = posts.find((p) => {
    const postUrl = p.url
      .replace(/\.html$/, "")
      .replace(/\/index$/, "")
      .replace(/\/$/, "")
    return postUrl === currentPath
  })

  return matched?.readingTime || ""
})

onMounted(() => {
  fetchCounter()
})
</script>

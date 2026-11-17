<template>
  <Layout>
    <template #doc-before>
      <div v-if="!$frontmatter.page" class="post-header-info">
        <ScrollHashSync />
        <div class="post-meta">
          <span class="post-date">
            {{ $frontmatter.date?.substring(0, 10) }}
          </span>
          <span v-if="readingTime" class="post-reading-time">
            <Clock class="reading-time-icon" aria-hidden="true" />
            {{ readingTime }}
          </span>
          <span id="counter_container_page_pv" class="post-info-pv">
            <Eye class="pv-icon" aria-hidden="true" />
            {{ $frontmatter.externalLink ? "本页访问量" : "阅读量" }}
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
            <User class="uv-icon" aria-hidden="true" />
            访客数
            <span id="counter_value_page_uv">{{ counterData.pageUv }}</span> 人
          </span>
        </div>
        <div v-if="$frontmatter.tags?.length" class="post-tags">
          <span v-for="item in $frontmatter.tags" :key="item" class="post-tag">
            <a :href="withBase(`/tags?tag=${item}`)">{{ item }}</a>
          </span>
        </div>
      </div>
    </template>
    <template #home-hero-after>
      <div class="hero-image-wrapper">
        <div class="hero-skeleton" aria-hidden="true" />
        <img
          :src="withBase('/hero.webp')"
          :srcset="`
            ${withBase('/hero-480w.webp')} 480w,
            ${withBase('/hero-768w.webp')} 768w,
            ${withBase('/hero-1440w.webp')} 1440w,
            ${withBase('/hero.webp')} 1920w
          `"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1920px"
          alt="Hero Image"
          class="hero-image"
          width="1920"
          height="735"
          fetchpriority="high"
          decoding="async"
          @load="onHeroImageLoad"
        />
      </div>
    </template>
  </Layout>
  <Copyright />
</template>
<script setup>
import { computed, onMounted, ref } from "vue"
import Clock from "@vicons/tabler/Clock"
import Eye from "@vicons/tabler/Eye"
import User from "@vicons/tabler/User"
import DefaultTheme from "vitepress/theme-without-fonts"
import Copyright from "./Copyright.vue"
import ScrollHashSync from "./ScrollHashSync.vue"
import { useData, useRoute, withBase } from "vitepress"
import { counterData, fetchCounter } from "../scripts/counter"
// @ts-expect-error
import { data as posts } from "../scripts/posts.data"

const { Layout } = DefaultTheme

const route = useRoute()
const { frontmatter } = useData()

const isHeroLoaded = ref(false)
const onHeroImageLoad = () => {
  isHeroLoaded.value = true
}

const readingTime = computed(() => {
  if (frontmatter.value.externalLink) return ""
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

<style scoped>
.hero-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 4000 / 1532;
  overflow: hidden;
  background-color: var(--vp-c-bg-soft);
  /* margin-top: 1.5rem; */
}

.hero-skeleton {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--vp-c-bg-soft) 25%,
    var(--vp-c-bg-alt) 37%,
    var(--vp-c-bg-soft) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.hero-image {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4000 / 1532;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
}
</style>

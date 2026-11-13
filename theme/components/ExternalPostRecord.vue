<template>
  <section
    v-if="frontmatter.externalLink"
    class="external-post-record"
    aria-label="推荐阅读来源"
  >
    <p class="recommendation-label">推荐阅读</p>
    <p>{{ frontmatter.description }}</p>
    <p v-if="frontmatter.sourceAuthor">
      原作者：{{ frontmatter.sourceAuthor }}
    </p>
    <p>来源：{{ hostname }}</p>
    <p>
      <PostLink :post="{ url: '', externalLink: frontmatter.externalLink }"
        >阅读原文</PostLink
      >
    </p>
    <p class="copyright-note">
      本文为外部文章推荐，原文版权归原作者所有；本站 MIT 许可不适用于外部原文。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useData } from "vitepress"
import PostLink from "./PostLink.vue"

const { frontmatter } = useData()
const hostname = computed(() =>
  frontmatter.value.externalLink
    ? new URL(frontmatter.value.externalLink).hostname
    : ""
)
</script>

<style scoped>
.external-post-record {
  overflow-wrap: anywhere;
}
.recommendation-label {
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.copyright-note {
  color: var(--vp-c-text-2);
  font-size: var(--vp-custom-block-font-size);
}
</style>

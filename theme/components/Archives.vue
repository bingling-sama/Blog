<template>
  <div v-for="yearList in data">
    <div class="year">
      {{ yearList[0].date.split("-")[0] }}
    </div>
    <a
      v-for="(post, index) in yearList"
      :key="index"
      :href="withBase(post.url)"
      class="posts"
    >
      <div class="post-container">
        <div class="post-dot" />
        {{ post.title }}
      </div>
      <div class="date">{{ post.date.slice(5) }}</div>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { withBase } from "vitepress"
import { computed } from "vue"
import { useYearSort } from "../scripts/functions"

// @ts-expect-error
import { data as posts } from "../scripts/posts.data"

const data = computed(() => useYearSort(posts))
</script>

<style scoped>
.year {
  padding: 14px 0 8px 0;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: var(--date-font-family), serif;
}
</style>

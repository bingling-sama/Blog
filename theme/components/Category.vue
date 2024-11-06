<template>
  <div v-for="(posts, key) in data">
    <div class="category">
      {{ key }}
    </div>
    <a
      v-for="(post, index) in posts"
      :key="index"
      :href="withBase(post.url)"
      class="posts"
    >
      <div class="post-container">
        <div class="post-dot" />
        {{ post.title }}
      </div>
      <div class="date">{{ post.date }}</div>
    </a>
  </div>
</template>
<script lang="ts" setup>
import { withBase } from 'vitepress'
import { computed } from 'vue'
import { initCategory } from '../scripts/functions'

//@ts-expect-error
import {data as posts} from "../scripts/posts.data"

const data = computed(() => initCategory(posts))
</script>

<style scoped>
.category {
    padding: 14px 0 8px 0;
    font-size: 1.25rem;
    font-weight: 500;
    font-family: var(--date-font-family),serif;
}
</style>

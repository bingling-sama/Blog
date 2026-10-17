<template>
  <div v-for="(posts, key) in data">
    <div class="category">
      {{ key }}
    </div>
    <PostItem
      v-for="(post, index) in posts"
      :key="index"
      :url="post.url"
      :title="post.title"
      :date="post.date"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue"
import PostItem from "./PostItem.vue"
import { initCategory } from "../scripts/functions"

//@ts-expect-error
import { data as posts } from "../scripts/posts.data"

const data = computed(() => initCategory(posts))
</script>

<style scoped>
.category {
  padding: 14px 0 8px 0;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: var(--date-font-family), serif;
}
</style>

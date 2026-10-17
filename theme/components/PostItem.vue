<template>
  <a :href="withBase(url)" class="posts">
    <div class="post-container">
      <div class="post-dot" />
      {{ title }}
    </div>
    <div class="date">{{ date }}</div>
  </a>
</template>

<script setup lang="ts">
import { withBase } from "vitepress"

defineProps<{
  url: string
  title: string
  date: string
}>()
</script>

<style scoped>
.posts {
  padding: 4px 0 4px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-dot {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--li-dot-color);
}

.post-container {
  color: var(--vp-c-text-2);
  font-size: 0.9375rem;
  font-weight: 400;
}

.post-container:hover {
  color: var(--vp-c-brand);
}

.date {
  color: var(--date-color);
  font-family: var(--date-font-family);
}

@media screen and (max-width: 768px) {
  .posts {
    padding: 4px;
  }

  .post-dot {
    margin-right: 4px;
  }

  .post-container {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 16.5em;
  }

  .date {
    font-size: 0.75rem;
  }
}
</style>

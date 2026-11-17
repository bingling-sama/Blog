<template>
  <div class="posts">
    <PostLink :post="{ url, externalLink }" class="post-container" compact>
      <div class="post-dot" />
      <span>{{ title }}</span>
    </PostLink>
    <div class="date">{{ date }}</div>
  </div>
</template>

<script setup lang="ts">
import PostLink from "./PostLink.vue"

defineProps<{
  url: string
  title: string
  date: string
  externalLink?: string
}>()
</script>

<style scoped>
.posts {
  padding: 4px 0 4px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;
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

.vp-doc a.post-container:any-link {
  flex: 1 1 60%;
  min-width: 0;
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

  .date {
    font-size: 0.75rem;
  }
}
</style>

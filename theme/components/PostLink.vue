<template>
  <a
    class="post-link"
    v-bind="getPostLink(post, withBase)"
    :title="post.externalLink ? '将在新标签页打开' : undefined"
  >
    <slot />
    <span v-if="post.externalLink" class="recommendation-mark">
      <ExternalLink class="recommendation-icon" aria-hidden="true" />
      <span :class="{ 'visually-hidden': compact }">推荐阅读</span>
      <span class="visually-hidden">，将在新标签页打开</span>
    </span>
  </a>
</template>

<script setup lang="ts">
import { withBase } from "vitepress"
import { ExternalLink } from "@vicons/tabler"
import type { Post } from "../scripts/functions"
import { getPostLink } from "../scripts/external-posts.mjs"

defineProps<{
  post: Pick<Post, "url" | "externalLink">
  compact?: boolean
}>()
</script>

<style scoped>
a {
  overflow-wrap: anywhere;
}
.vp-doc a.post-link:any-link {
  color: var(--vp-c-text-1);
  border-bottom: 0;
  text-decoration: none !important;
}
.vp-doc a.post-link:any-link:hover {
  color: var(--vp-c-brand-1);
}
.vp-doc a.post-link:any-link:active {
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
}
a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.recommendation-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  margin-inline-start: 0.5em;
  font-size: var(--vp-custom-block-font-size);
  font-weight: 400;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.recommendation-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  vertical-align: middle;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>

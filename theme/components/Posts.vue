<template>
  <div class="container">
    <div
      v-for="(post, index) in pages[pageCurrent - 1]"
      :key="index"
      class="post-list"
    >
      <div class="post-header">
        <div class="post-title">
          <a :href="withBase(post.url)"> {{ post.title }}</a>
        </div>
      </div>
      <p class="describe" v-html="post.description"></p>
      <div class="post-info">
        {{ post.date }}
        <span v-for="item in post.tags"
          ><a :href="withBase(`/tags?tag=${item}`)"> {{ item }}</a></span
        >
      </div>
    </div>
  </div>

  <div class="pagination">
    <span
      class="link"
      :class="{ active: pageCurrent === i }"
      v-for="i in pages.length"
      :key="i"
      @click="setPage(i)"
      >{{ i }}</span
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { Post } from "../scripts/functions"
import { withBase } from "vitepress"
// @ts-expect-error
import { data as posts } from "../scripts/posts.data"

const MOBILE_BREAKPOINT = 768
const DESKTOP_PAGE_SIZE = 10
const MOBILE_PAGE_SIZE = 6

const pageCurrent = ref(1)
const pageSize = ref(DESKTOP_PAGE_SIZE)

const pages = computed(() => splitPosts(posts, pageSize.value))

function setPage(page: number) {
  pageCurrent.value = page
}

function updatePageSize() {
  pageSize.value =
    window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE
}

function splitPosts(items: Post[], size: number) {
  if (items.length <= size) return [items]

  return items.reduce((acc, post, index) => {
    if (index % size === 0) acc.push([])
    acc[acc.length - 1].push(post)
    return acc
  }, [] as Post[][])
}

function clampCurrentPage() {
  if (pageCurrent.value > pages.value.length) {
    pageCurrent.value = pages.value.length || 1
  }
}

let resizeHandler: (() => void) | null = null

onMounted(() => {
  updatePageSize()
  clampCurrentPage()

  resizeHandler = () => {
    const nextPageSize =
      window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE

    if (nextPageSize !== pageSize.value) {
      pageSize.value = nextPageSize
    }
  }

  window.addEventListener("resize", resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler)
  }
})

watch(pages, clampCurrentPage)
</script>

<style scoped>
.container {
  margin: 2rem 0;
}

.post-list {
  border-bottom: 1px dashed var(--vp-c-divider-light);
  padding: 14px 0 14px 0;
}
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.post-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0.1rem 0;
}

.describe {
  font-size: 0.9375rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  overflow: hidden;
  color: var(--vp-c-text-2);
  margin: 10px 0;
  line-height: 1.5rem;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.link {
  cursor: pointer;
  display: inline-block;
  width: 24px;
  text-align: center;
  border: 1px var(--vp-c-divider-light) solid;
  border-right: none;
  font-weight: 400;
}
.link.active {
  background: var(--vp-c-text-1);
  color: var(--vp-c-neutral-inverse);
  border: 1px solid var(--vp-c-text-1) !important;
}
.link:first-child {
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;
}
.link:last-child {
  border-bottom-right-radius: 2px;
  border-top-right-radius: 2px;
  border-right: 1px var(--vp-c-divider-light) solid;
}

@media screen and (max-width: 768px) {
  .post-list {
    padding: 14px 0 14px 0;
  }
  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .post-title {
    font-size: 1.0625rem;
    font-weight: 400;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
    width: 17rem;
  }
  .describe {
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    overflow: hidden;
    margin: 0.5rem 0 1rem;
  }
}
</style>

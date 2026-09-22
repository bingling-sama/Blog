<template>
  <div class="site-footer">
    MIT Licensed | Copyright © 2021-2022
    <a class="vitepress" :href="website">{{ webTitle }}</a
    ><br />
    Powered by
    <a class="vitepress" target="_blank" href="//vitepress.vuejs.org/"
      >VitePress - 1.4.1</a
    >
    Theme by
    <a
      class="vitepress"
      target="_blank"
      href="//github.com/airene/vitepress-blog-pure"
      >Vitepress-blog</a
    >
    <div class="counter-stats">
      <span
        id="counter_container_site_pv"
        class="counter-item"
        :style="{ display: counterData.sitePv ? 'inline-block' : 'none' }"
      >
        本站总访问量
        <span id="counter_value_site_pv">{{ counterData.sitePv }}</span> 次
      </span>
      <span
        v-if="counterData.sitePv && counterData.siteUv"
        class="counter-divider"
      >
        |
      </span>
      <span
        id="counter_container_site_uv"
        class="counter-item"
        :style="{ display: counterData.siteUv ? 'inline-block' : 'none' }"
      >
        本站访客数
        <span id="counter_value_site_uv">{{ counterData.siteUv }}</span> 人次
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useData } from "vitepress"
import { counterData } from "../scripts/counter"

const { site, theme } = useData()
const website = theme.value.website
const webTitle = site.value.title
</script>

<style>
.site-footer {
  color: #888;
  text-align: center;
  font-size: 0.75rem;
  width: 100%;
  padding: 15px 0;
  overflow: auto;
}
.vitepress {
  color: var(--vp-c-text-1);
  font-weight: 700;
}
.counter-stats {
  margin-top: 6px;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}
.counter-item {
  display: inline-block;
}
.counter-stats span[id^="counter_value_"] {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.counter-divider {
  margin: 0 8px;
  color: var(--vp-c-divider);
}
</style>

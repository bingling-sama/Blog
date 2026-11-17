<template>
  <div
    ref="containerRef"
    class="pele-viewer"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <div class="pele-toolbar" @pointerdown.stop>
      <button class="toolbar-btn" type="button" title="放大" @click="zoomIn">
        +
      </button>
      <button
        class="toolbar-btn scale-btn"
        type="button"
        title="切换适应大小 / 100%"
        @click="toggleFit"
      >
        {{ scaleLabel }}
      </button>
      <button class="toolbar-btn" type="button" title="缩小" @click="zoomOut">
        −
      </button>
      <button
        class="toolbar-btn"
        type="button"
        title="适应画布"
        @click="resetZoom"
      >
        ↺
      </button>
      <button
        class="toolbar-btn"
        type="button"
        :title="copied ? '已复制源码' : '复制 Mermaid 源码'"
        @click="copySource"
      >
        {{ copied ? "✓" : "⧉" }}
      </button>
      <button
        class="toolbar-btn"
        type="button"
        :title="isFullscreen ? '退出全屏' : '全屏预览'"
        @click="toggleFullscreen"
      >
        {{ isFullscreen ? "×" : "⛶" }}
      </button>
    </div>

    <div
      v-if="loading"
      class="pele-loading"
      role="status"
    >
      Loading diagram...
    </div>
    <div
      ref="diagramRef"
      class="pele-diagram"
      :aria-label="`Mermaid diagram ${id}`"
      @pointerup="syncScale"
    />
    <div v-if="errorMessage" class="pele-error">
      <strong>图表渲染失败</strong>
      <pre>{{ errorMessage }}</pre>
    </div>
    <div v-if="isFullscreen" class="fullscreen-hint">
      按 <kbd>Esc</kbd> 或点击右上角退出全屏
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue"

interface Props {
  id: string
  source: string
}

interface PeleZoom {
  scale: number
  fit: number
  zoomBy(factor: number): void
  zoomTo(scale: number): void
  reset(): void
}

interface PeleDiagram {
  refresh(): void
  destroy(): void
  zoom?: PeleZoom
}

const props = defineProps<Props>()
const source = computed(() => decodeURIComponent(props.source))

const containerRef = ref<HTMLElement | null>(null)
const diagramRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const errorMessage = ref("")
const copied = ref(false)
const isFullscreen = ref(false)
const scale = ref(1)
const fitScale = ref(1)
let diagram: PeleDiagram | null = null
let copyTimer: ReturnType<typeof setTimeout> | undefined

const scaleLabel = computed(() => `${Math.round(scale.value * 100)}%`)

const syncScale = () => {
  if (!diagram?.zoom) return
  scale.value = diagram.zoom.scale
  fitScale.value = diagram.zoom.fit
}

const renderDiagram = async () => {
  if (!diagramRef.value || typeof window === "undefined") return

  loading.value = true
  errorMessage.value = ""

  try {
    const { mount } = await import("pele")
    diagram?.destroy()
    diagram = mount(diagramRef.value, source.value, {
      idPrefix: props.id,
      responsive: true,
      zoom: {
        always: true,
        controls: false,
        maxScale: 5
      },
      onError(error) {
        errorMessage.value =
          error instanceof Error ? error.message : "Unknown rendering error"
      }
    })
    await nextTick()
    syncScale()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unknown rendering error"
  } finally {
    loading.value = false
  }
}

const zoomIn = () => {
  diagram?.zoom?.zoomBy(1.25)
  syncScale()
}

const zoomOut = () => {
  diagram?.zoom?.zoomBy(0.8)
  syncScale()
}

const resetZoom = () => {
  diagram?.zoom?.reset()
  syncScale()
}

const toggleFit = () => {
  if (!diagram?.zoom) return
  diagram.zoom.zoomTo(
    Math.abs(diagram.zoom.scale - diagram.zoom.fit) < 0.05
      ? 1
      : diagram.zoom.fit
  )
  syncScale()
}

const copySource = async () => {
  try {
    await navigator.clipboard.writeText(source.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    errorMessage.value = "无法复制源码，请检查浏览器权限"
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isFullscreen.value) toggleFullscreen()
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  document.body.style.overflow = isFullscreen.value ? "hidden" : ""
  if (isFullscreen.value) {
    window.addEventListener("keydown", handleKeydown)
  } else {
    window.removeEventListener("keydown", handleKeydown)
  }
  nextTick(() => {
    diagram?.refresh()
    resetZoom()
  })
}

onMounted(renderDiagram)

onUnmounted(() => {
  diagram?.destroy()
  if (copyTimer) clearTimeout(copyTimer)
  document.body.style.overflow = ""
  window.removeEventListener("keydown", handleKeydown)
})
</script>

<style scoped>
.pele-viewer {
  --pele-bg: var(--vp-c-bg-soft);
  --pele-fg: var(--vp-c-text-1);
  --pele-muted: var(--vp-c-text-2);
  --pele-line: var(--vp-c-text-2);
  --pele-surface: var(--vp-c-bg);
  --pele-surface-alt: var(--vp-c-bg-mute);
  --pele-border: var(--vp-c-divider);
  --pele-accent: #ff5e1f;
  --pele-radius: 2px;
  position: relative;
  margin: 2rem 0;
  min-height: 160px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.pele-viewer.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: var(--vp-c-bg);
}

.pele-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  gap: 2px;
  padding: 3px 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
  backdrop-filter: blur(8px);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font: inherit;
}

.toolbar-btn:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.scale-btn {
  width: 48px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

.pele-diagram {
  min-height: 160px;
  padding: 32px 24px;
}

.pele-viewer.is-fullscreen .pele-diagram {
  height: 100vh;
  padding: 56px 32px 32px;
}

.pele-loading,
.pele-error {
  padding: 32px 24px;
  color: var(--vp-c-text-2);
}

.pele-error pre {
  white-space: pre-wrap;
}

.fullscreen-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  padding: 6px 14px;
  transform: translateX(-50%);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  pointer-events: none;
}

.fullscreen-hint kbd {
  padding: 1px 5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-mute);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
}

:deep(.pele) {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}
</style>

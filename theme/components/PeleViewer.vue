<template>
  <div
    ref="containerRef"
    class="pele-viewer"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <div v-if="loading" class="pele-loading">Loading diagram...</div>
    <div
      ref="diagramRef"
      class="pele-diagram"
      :aria-label="`Mermaid diagram ${id}`"
    />
    <div v-if="errorMessage" class="pele-error">
      <strong>图表渲染失败</strong>
      <pre>{{ errorMessage }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

interface Props {
  id: string
  source: string
}

interface PeleZoom {
  scale: number
  fit: number
  zoomBy(factor: number): void
  reset(): void
}

interface PeleDiagram {
  refresh(): void
  destroy(): void
  zoom?: PeleZoom
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement | null>(null)
const diagramRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const errorMessage = ref("")
let diagram: PeleDiagram | null = null

const renderDiagram = async () => {
  if (!diagramRef.value || typeof window === "undefined") return

  loading.value = true
  errorMessage.value = ""

  try {
    const { mount } = await import("pele")
    diagram = mount(diagramRef.value, decodeURIComponent(props.source), {
      idPrefix: props.id,
      responsive: true,
      zoom: false,
      onError(error) {
        errorMessage.value =
          error instanceof Error ? error.message : "Unknown rendering error"
      }
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unknown rendering error"
  } finally {
    loading.value = false
  }
}

onMounted(renderDiagram)

onUnmounted(() => {
  diagram?.destroy()
})
</script>

<style scoped>
.pele-viewer {
  position: relative;
  margin: 2rem 0;
  min-height: 160px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.pele-diagram {
  min-height: 160px;
  padding: 32px 24px;
}

.pele-loading,
.pele-error {
  padding: 32px 24px;
  color: var(--vp-c-text-2);
}

.pele-error pre {
  white-space: pre-wrap;
}
</style>

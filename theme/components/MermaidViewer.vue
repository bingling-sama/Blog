<template>
  <div
    ref="containerRef"
    class="mermaid-viewer"
    :class="{ 'is-fullscreen': isFullscreen, 'is-dragging': isDragging }"
  >
    <!-- Top Floating Toolbar -->
    <div class="mermaid-toolbar" @pointerdown.stop>
      <!-- Zoom In -->
      <button
        class="toolbar-btn"
        type="button"
        title="放大 / Zoom in (Ctrl + 滚轮)"
        @click="zoomIn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <!-- Scale Badge (Click to toggle Fit / 100%) -->
      <button
        class="toolbar-btn scale-btn"
        type="button"
        title="点击切换 适应大小 / 100%"
        @click="toggleFitOrOriginal"
      >
        {{ Math.round(scale * 100) }}%
      </button>

      <!-- Zoom Out -->
      <button
        class="toolbar-btn"
        type="button"
        title="缩小 / Zoom out"
        @click="zoomOut"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <!-- Reset View / Fit (↺) -->
      <button
        class="toolbar-btn"
        type="button"
        title="适应画布 / Fit view (双击画布)"
        @click="resetToFit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>

      <!-- Copy Source Code -->
      <button
        class="toolbar-btn"
        type="button"
        :title="copied ? '已复制源码' : '复制 Mermaid 源码 / Copy code'"
        @click="copyCode"
      >
        <svg
          v-if="copied"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="color: #22c55e"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
          ></path>
        </svg>
      </button>

      <!-- Fullscreen Toggle -->
      <button
        class="toolbar-btn"
        type="button"
        :title="
          isFullscreen
            ? '退出全屏 / Exit fullscreen (Esc)'
            : '全屏预览 / Fullscreen'
        "
        @click="toggleFullscreen"
      >
        <svg
          v-if="isFullscreen"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="4 14 10 14 10 20"></polyline>
          <polyline points="20 10 14 10 14 4"></polyline>
          <line x1="14" y1="10" x2="21" y2="3"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
    </div>

    <!-- Viewport & Canvas -->
    <div
      ref="viewportRef"
      class="mermaid-viewport"
      :style="{
        height: isFullscreen
          ? '100vh'
          : viewportHeight
            ? `${viewportHeight}px`
            : 'auto'
      }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheel"
      @dblclick="resetToFit"
    >
      <div
        class="mermaid-canvas"
        :style="{
          width: canvasWidth ? `${canvasWidth}px` : 'auto',
          height: canvasHeight ? `${canvasHeight}px` : 'auto',
          transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), 0) scale(${scale})`,
          transition: isTransitioning
            ? 'transform 0.25s cubic-bezier(0.19, 1, 0.22, 1)'
            : 'none'
        }"
      >
        <RawMermaid
          :id="props.id"
          :graph="props.graph"
          :class="props.class || 'mermaid'"
        />
      </div>
    </div>

    <!-- Fullscreen Esc Hint -->
    <div v-if="isFullscreen" class="fullscreen-hint">
      按 <kbd>Esc</kbd> 或点击右上角退出全屏
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import RawMermaid from "vitepress-plugin-mermaid/Mermaid.vue"

interface Props {
  id: string
  graph: string
  class?: string
}

const props = defineProps<Props>()

const containerRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)

// Natural SVG dimensions
const canvasWidth = ref<number | null>(null)
const canvasHeight = ref<number | null>(null)
const viewportHeight = ref<number | null>(null)

// Transform states
const scale = ref(1)
const initialFitScale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isTransitioning = ref(false)
const hasUserInteracted = ref(false)

// Dragging & Interaction states
const isDragging = ref(false)
const isFullscreen = ref(false)
const copied = ref(false)

// Active pointer tracking for dragging & multi-touch pinch
const pointers = new Map<number, { x: number; y: number }>()
let initialPinchDistance = 0
let initialPinchScale = 1
let lastPointerPos = { x: 0, y: 0 }

let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

const getSvgDimensions = (
  svg: SVGSVGElement
): { width: number; height: number } | null => {
  // 1. viewBox attribute (standard in Mermaid)
  if (
    svg.viewBox &&
    svg.viewBox.baseVal &&
    svg.viewBox.baseVal.width > 0 &&
    svg.viewBox.baseVal.height > 0
  ) {
    return {
      width: svg.viewBox.baseVal.width,
      height: svg.viewBox.baseVal.height
    }
  }

  // 2. getBBox()
  try {
    const bbox = svg.getBBox()
    if (bbox.width > 0 && bbox.height > 0) {
      return { width: bbox.width, height: bbox.height }
    }
  } catch {
    // Ignore error if SVG is not yet attached
  }

  // 3. style or attribute width/height
  const w = parseFloat(svg.getAttribute("width") || "")
  const h = parseFloat(svg.getAttribute("height") || "")
  if (w > 0 && h > 0) {
    return { width: w, height: h }
  }

  const rect = svg.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height }
  }

  return null
}

const updateDimensionsAndFit = (forceReset = false) => {
  const viewport = viewportRef.value
  if (!viewport) return

  const svg = viewport.querySelector("svg") as SVGSVGElement | null
  if (!svg) return

  const dims = getSvgDimensions(svg)
  if (!dims || dims.width === 0 || dims.height === 0) return

  canvasWidth.value = dims.width
  canvasHeight.value = dims.height

  // Viewport dimensions
  const containerW =
    viewport.clientWidth || containerRef.value?.clientWidth || 700

  // Calculate fit scale and adaptive height
  if (!isFullscreen.value) {
    // Horizontal padding (48px)
    const availW = Math.max(containerW - 48, 100)
    // Scale to fit container width, capped at 1 (do not upscale small charts)
    const fitW = Math.min(Number((availW / dims.width).toFixed(3)), 1)

    // Calculate adaptive container height
    const renderedH = dims.height * fitW
    // Add vertical padding (60px) for toolbar and spacing
    const targetH = Math.round(renderedH + 60)
    // For wide / low-profile graphs (like single-line LR), ensure comfortable headroom
    const aspectRatio = dims.width / dims.height
    const minH = aspectRatio > 3 ? 220 : 160
    // Clamp container height between minH and 560px
    viewportHeight.value = Math.max(minH, Math.min(targetH, 560))

    // Re-check vertical fit if container height was clamped
    const availH = Math.max(viewportHeight.value - 56, 80)
    const fitH = Number((availH / dims.height).toFixed(3))
    const fullFitScale = Math.min(fitW, fitH, 1)

    initialFitScale.value = fullFitScale

    const isVertical = isVerticalDiagram(props.graph, dims.width, dims.height)

    if (!hasUserInteracted.value || forceReset) {
      // If fitting full width would make the diagram text too small (< 0.72):
      // Start with a comfortable legible scale (0.82)
      const chosenScale = fullFitScale < 0.72 ? 0.82 : fullFitScale
      scale.value = chosenScale

      const pos = computeInitialTranslation(
        chosenScale,
        dims.width,
        dims.height,
        containerW,
        viewportHeight.value,
        isVertical
      )
      translateX.value = pos.x
      translateY.value = pos.y
    }
  } else {
    // Fullscreen mode: fit both width and height
    const availW = Math.max(window.innerWidth - 64, 100)
    const availH = Math.max(window.innerHeight - 80, 100)
    const fitScale = Math.min(
      Number((availW / dims.width).toFixed(3)),
      Number((availH / dims.height).toFixed(3)),
      1.5
    )

    initialFitScale.value = fitScale
    if (!hasUserInteracted.value || forceReset) {
      scale.value = fitScale
      const isVertical = isVerticalDiagram(props.graph, dims.width, dims.height)
      const pos = computeInitialTranslation(
        fitScale,
        dims.width,
        dims.height,
        window.innerWidth,
        window.innerHeight,
        isVertical
      )
      translateX.value = pos.x
      translateY.value = pos.y
    }
  }
}

const isVerticalDiagram = (
  rawGraph: string,
  svgW: number,
  svgH: number
): boolean => {
  const raw = decodeURIComponent(rawGraph)
  if (/\b(graph\s+LR|flowchart\s+LR)\b/i.test(raw)) {
    return false
  }
  if (
    /\b(graph\s+(TD|TB)|flowchart\s+(TD|TB)|sequenceDiagram|stateDiagram)\b/i.test(
      raw
    )
  ) {
    return true
  }
  return svgH >= svgW * 0.75
}

const computeInitialTranslation = (
  currentScale: number,
  svgW: number,
  svgH: number,
  viewW: number,
  viewH: number,
  isVertical: boolean
): { x: number; y: number } => {
  const renderedW = svgW * currentScale
  const renderedH = svgH * currentScale

  let x = 0
  let y = 0

  if (isVertical) {
    // 纵向图 (TD / TB / Sequence):
    // 1. 水平方向：绝对居中！对齐视口正中心 (x = 0)，保证头节点与左右子图完全对称居中
    x = 0

    // 2. 垂直方向：如果渲染高度超出视口，顶部对齐留白 48px（避开右上角工具栏），确保头节点在正上方
    if (renderedH > viewH - 56) {
      y = 48 + (renderedH - viewH) / 2
    } else {
      y = 0
    }
  } else {
    // 横向图 (LR):
    // 1. 水平方向：如果渲染宽度超出视口，左对齐留白 32px，确保起始节点（步骤 1）从左侧展开
    if (renderedW > viewW - 48) {
      x = 32 + (renderedW - viewW) / 2
    } else {
      x = 0
    }

    // 2. 垂直方向：垂直居中
    y = 0
  }

  return { x, y }
}

const zoomIn = () => {
  hasUserInteracted.value = true
  isTransitioning.value = true
  scale.value = Math.min(Number((scale.value * 1.25).toFixed(2)), 5)
}

const zoomOut = () => {
  hasUserInteracted.value = true
  isTransitioning.value = true
  scale.value = Math.max(Number((scale.value / 1.25).toFixed(2)), 0.1)
}

const toggleFitOrOriginal = () => {
  hasUserInteracted.value = true
  isTransitioning.value = true
  const viewport = viewportRef.value
  const viewW = viewport?.clientWidth || containerRef.value?.clientWidth || 700
  const viewH = viewport?.clientHeight || viewportHeight.value || 300
  const svgW = canvasWidth.value || 700
  const svgH = canvasHeight.value || 300
  const isVertical = isVerticalDiagram(props.graph, svgW, svgH)

  // If close to fit scale, zoom to 100%; otherwise toggle to fit scale
  if (Math.abs(scale.value - initialFitScale.value) < 0.05) {
    scale.value = 1
    const pos = computeInitialTranslation(
      1,
      svgW,
      svgH,
      viewW,
      viewH,
      isVertical
    )
    translateX.value = pos.x
    translateY.value = pos.y
  } else {
    scale.value = initialFitScale.value
    const pos = computeInitialTranslation(
      initialFitScale.value,
      svgW,
      svgH,
      viewW,
      viewH,
      isVertical
    )
    translateX.value = pos.x
    translateY.value = pos.y
  }
}

const resetToFit = () => {
  hasUserInteracted.value = false
  isTransitioning.value = true
  updateDimensionsAndFit(true)
}

const copyCode = async () => {
  try {
    const raw = decodeURIComponent(props.graph)
    await navigator.clipboard.writeText(raw)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error("Failed to copy mermaid code", err)
  }
}

const onPointerDown = (e: PointerEvent) => {
  const target = e.target as HTMLElement
  if (target.closest(".mermaid-toolbar")) return

  const viewport = viewportRef.value
  if (!viewport) return

  viewport.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pointers.size === 1) {
    isDragging.value = true
    isTransitioning.value = false
    lastPointerPos = { x: e.clientX, y: e.clientY }
  } else if (pointers.size === 2) {
    isDragging.value = false
    const pts = Array.from(pointers.values())
    initialPinchDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    initialPinchScale = scale.value
  }
}

const onPointerMove = (e: PointerEvent) => {
  if (!pointers.has(e.pointerId)) return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pointers.size === 1 && isDragging.value) {
    hasUserInteracted.value = true
    const dx = e.clientX - lastPointerPos.x
    const dy = e.clientY - lastPointerPos.y
    translateX.value += dx
    translateY.value += dy
    lastPointerPos = { x: e.clientX, y: e.clientY }
  } else if (pointers.size === 2 && initialPinchDistance > 0) {
    hasUserInteracted.value = true
    const pts = Array.from(pointers.values())
    const currentDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    const factor = currentDistance / initialPinchDistance
    scale.value = Math.min(
      Math.max(Number((initialPinchScale * factor).toFixed(2)), 0.1),
      5
    )
  }
}

const onPointerUp = (e: PointerEvent) => {
  pointers.delete(e.pointerId)
  if (viewportRef.value?.hasPointerCapture(e.pointerId)) {
    viewportRef.value.releasePointerCapture(e.pointerId)
  }

  if (pointers.size === 1) {
    const remaining = Array.from(pointers.values())[0]
    lastPointerPos = { x: remaining.x, y: remaining.y }
    isDragging.value = true
  } else if (pointers.size === 0) {
    isDragging.value = false
    initialPinchDistance = 0
  }
}

const onWheel = (e: WheelEvent) => {
  // Allow zooming when Ctrl/Cmd is pressed (trackpad pinch emits ctrlKey: true), or in fullscreen mode
  if (e.ctrlKey || e.metaKey || isFullscreen.value) {
    e.preventDefault()
    hasUserInteracted.value = true

    const viewport = viewportRef.value
    if (!viewport) return

    const rect = viewport.getBoundingClientRect()
    // Mouse relative to viewport center
    const mx = e.clientX - rect.left - rect.width / 2
    const my = e.clientY - rect.top - rect.height / 2

    const delta = -e.deltaY
    const factor = delta > 0 ? 1.15 : 1 / 1.15
    const newScale = Math.min(Math.max(scale.value * factor, 0.1), 5)

    // Keep point under cursor stable
    translateX.value = mx - (mx - translateX.value) * (newScale / scale.value)
    translateY.value = my - (my - translateY.value) * (newScale / scale.value)

    scale.value = Number(newScale.toFixed(2))
    isTransitioning.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isFullscreen.value) {
    toggleFullscreen()
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  isTransitioning.value = true

  if (typeof document !== "undefined") {
    if (isFullscreen.value) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeydown)
    } else {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeydown)
    }
  }

  nextTick(() => {
    updateDimensionsAndFit(true)
  })
}

onMounted(() => {
  // Wait for initial render
  nextTick(() => {
    updateDimensionsAndFit(true)
  })

  // Watch for SVG updates / theme switches
  if (viewportRef.value) {
    mutationObserver = new MutationObserver(() => {
      nextTick(() => {
        updateDimensionsAndFit(false)
      })
    })
    mutationObserver.observe(viewportRef.value, {
      childList: true,
      subtree: true
    })
  }

  // Watch for container width changes
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateDimensionsAndFit(false)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = ""
    window.removeEventListener("keydown", handleKeydown)
  }
  mutationObserver?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.mermaid-viewer {
  position: relative;
  margin: 2rem 0;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}

.mermaid-viewer:hover {
  border-color: var(--vp-c-divider-strong, var(--vp-c-divider));
}

.dark .mermaid-viewer {
  background-color: #141416;
  border-color: #27272a;
}

/* Fullscreen Mode */
.mermaid-viewer.is-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  z-index: 9999 !important;
  background-color: var(--vp-c-bg) !important;
}

.dark .mermaid-viewer.is-fullscreen {
  background-color: #0e0e10 !important;
}

/* Floating Toolbar */
.mermaid-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 4px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  opacity: 0.85;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  user-select: none;
}

.mermaid-viewer:hover .mermaid-toolbar {
  opacity: 1;
}

.dark .mermaid-toolbar {
  background-color: #1f1f23;
  border-color: #38383e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.toolbar-btn:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-mute);
}

.dark .toolbar-btn:hover {
  color: #ededed;
  background-color: #27272a;
}

.toolbar-btn.scale-btn {
  width: auto;
  min-width: 44px;
  padding: 0 6px;
  font-size: 11.5px;
  font-family: var(--vp-font-family-mono);
  font-weight: 500;
  letter-spacing: -0.02em;
}

/* Viewport */
.mermaid-viewport {
  position: relative;
  width: 100%;
  min-height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  transition: height 0.25s cubic-bezier(0.19, 1, 0.22, 1);
}

.mermaid-viewer.is-fullscreen .mermaid-viewport {
  height: 100vh !important;
  min-height: 100vh !important;
}

.mermaid-viewer.is-dragging .mermaid-viewport {
  cursor: grabbing !important;
}

/* Canvas layer */
.mermaid-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
  will-change: transform;
}

/* Override inner .mermaid container and SVG */
:deep(.mermaid) {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.mermaid svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  overflow: visible !important;
}

/* Fullscreen Esc Hint */
.fullscreen-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  animation: fadeInOut 3s forwards;
}

.dark .fullscreen-hint {
  background-color: #1f1f23;
  border-color: #38383e;
  color: #a1a1aa;
}

.fullscreen-hint kbd {
  padding: 1px 5px;
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  background-color: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -5px);
  }
}
</style>

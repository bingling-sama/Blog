<template>
  <span class="scroll-hash-sync" style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from "vue"
import { getScrollOffset, inBrowser, onContentUpdated, useRoute } from "vitepress"

if (inBrowser) {
  const route = useRoute()

  let headings: HTMLElement[] = []
  let isClickScrolling = false
  let clickScrollTimer: ReturnType<typeof setTimeout> | null = null
  let ticking = false
  let isInitialHashReady = true

  const refreshHeadings = () => {
    const docContainer =
      document.querySelector(".VPDoc .vp-doc") ||
      document.querySelector(".vp-doc")
    if (!docContainer) {
      headings = []
      return
    }
    headings = Array.from(
      docContainer.querySelectorAll<HTMLElement>(
        ":where(h2, h3, h4, h5, h6)[id]"
      )
    ).filter(
      (el) =>
        Boolean(el.id) &&
        !el.classList.contains("ignore-header") &&
        el.offsetParent !== null
    )
  }

  const updateHash = (targetId: string | null) => {
    if (!isInitialHashReady && targetId === null) {
      return
    }

    const rawCurrent = window.location.hash.replace(/^#/, "")
    let currentHash = ""
    try {
      currentHash = decodeURIComponent(rawCurrent)
    } catch {
      currentHash = rawCurrent
    }

    const nextHash = targetId ? targetId.replace(/^#/, "") : ""

    if (currentHash === nextHash) return

    const { pathname, search } = window.location
    const newHash = nextHash ? `#${encodeURIComponent(nextHash)}` : ""
    const newUrl = `${pathname}${search}${newHash}`

    window.history.replaceState(window.history.state, "", newUrl)
  }

  const getActiveHeadingId = (): string | null => {
    if (headings.length === 0) return null

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const scrollHeight = document.documentElement.scrollHeight

    if (scrollY < 80) {
      return null
    }

    const isBottom = Math.ceil(scrollY + innerHeight) >= scrollHeight - 20
    if (isBottom) {
      return headings[headings.length - 1].id
    }

    const scrollOffset =
      typeof getScrollOffset === "function" ? getScrollOffset() : 64
    const offset = scrollOffset + 30

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i]
      const top = heading.getBoundingClientRect().top
      if (top <= offset) {
        return heading.id
      }
    }

    return null
  }

  const syncHash = () => {
    if (isClickScrolling) return
    const activeId = getActiveHeadingId()
    updateHash(activeId)
  }

  const onScroll = () => {
    if (isClickScrolling) return
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (!isClickScrolling) {
          syncHash()
        }
        ticking = false
      })
      ticking = true
    }
  }

  const handleClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest?.("a")
    if (!target) return

    const href = target.getAttribute("href")
    if (href?.startsWith("#")) {
      isClickScrolling = true
      if (clickScrollTimer) clearTimeout(clickScrollTimer)
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false
        syncHash()
      }, 800)
    }
  }

  const onScrollEnd = () => {
    if (isClickScrolling) {
      if (clickScrollTimer) clearTimeout(clickScrollTimer)
      clickScrollTimer = setTimeout(() => {
        isClickScrolling = false
        syncHash()
      }, 100)
    }
  }

  const initPage = () => {
    // 延迟到首屏渲染完成后的空闲帧执行，避免破坏布局批处理导致 Forced Reflow
    window.requestAnimationFrame(() => {
      refreshHeadings()

      if (window.location.hash) {
        isInitialHashReady = false
        setTimeout(() => {
          isInitialHashReady = true
        }, 500)
      } else {
        isInitialHashReady = true
      }
    })
  }

  onMounted(() => {
    initPage()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("click", handleClick, { capture: true })
    window.addEventListener("scrollend", onScrollEnd, { passive: true })
  })

  onContentUpdated(() => {
    nextTick(() => {
      window.requestAnimationFrame(() => {
        refreshHeadings()
      })
    })
  })

  watch(
    () => route.path,
    () => {
      nextTick(() => {
        initPage()
      })
    }
  )

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("click", handleClick, { capture: true })
    window.removeEventListener("scrollend", onScrollEnd)
    if (clickScrollTimer) clearTimeout(clickScrollTimer)
  })
}
</script>

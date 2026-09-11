import { inBrowser } from "vitepress"
import { reactive } from "vue"

export interface BusuanziData {
  sitePv: string | number
  siteUv: string | number
  pagePv: string | number
  pageUv: string | number
  loaded: boolean
}

export const busuanziData = reactive<BusuanziData>({
  sitePv: "",
  siteUv: "",
  pagePv: "",
  pageUv: "",
  loaded: false
})

interface BusuanziResponse {
  site_pv?: number
  site_uv?: number
  page_pv?: number
  page_uv?: number
  version?: number
}

declare global {
  interface Window {
    [key: string]: any
    bszCaller?: {
      fetch: (url?: string, callback?: (data: BusuanziResponse) => void) => void
    }
    bszTag?: {
      bszs: string[]
      texts: (data: BusuanziResponse) => void
      shows: () => void
      hides: () => void
    }
  }
}

let currentScript: HTMLScriptElement | null = null
let lastFetchUrl = ""
let lastFetchTime = 0

function getPathHash(path: string): number {
  let hash = 0
  for (let i = 0; i < path.length; i++) {
    hash = (hash << 5) - hash + path.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function applyBusuanziData(data: BusuanziResponse): void {
  if (!data) return

  if (data.site_pv !== undefined) busuanziData.sitePv = data.site_pv
  if (data.site_uv !== undefined) busuanziData.siteUv = data.site_uv
  if (data.page_pv !== undefined) busuanziData.pagePv = data.page_pv
  if (data.page_uv !== undefined) busuanziData.pageUv = data.page_uv
  busuanziData.loaded = true

  // 回填标准的 DOM 元素并显示容器
  const bszKeys = ["site_pv", "site_uv", "page_pv", "page_uv"] as const
  bszKeys.forEach((key) => {
    const val = data[key]
    if (val !== undefined) {
      const valEl = document.getElementById(`busuanzi_value_${key}`)
      if (valEl) {
        valEl.innerText = String(val)
      }
      const containerEl = document.getElementById(`busuanzi_container_${key}`)
      if (containerEl) {
        containerEl.style.display = "inline-flex"
      }
    }
  })
}

export function fetchBusuanzi(): void {
  if (!inBrowser) return

  const now = Date.now()
  const currentUrl = window.location.href
  const currentPath = window.location.pathname

  // 防止短时间内对同一个 URL 发生重复请求
  if (currentUrl === lastFetchUrl && now - lastFetchTime < 300) {
    return
  }

  lastFetchUrl = currentUrl
  lastFetchTime = now

  // 路由跳转到新页面时，重置当前页的 PV / UV 状态
  busuanziData.pagePv = ""
  busuanziData.pageUv = ""

  // 如果有上一个还在挂载中的 script，先移除
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.removeChild(currentScript)
    currentScript = null
  }

  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"

  const callbackName = `BusuanziCallback_${Math.floor(1099511627776 * Math.random())}`

  const timeoutId = window.setTimeout(() => {
    try {
      delete window[callbackName]
    } catch {
      window[callbackName] = undefined
    }
  }, 10000)

  window[callbackName] = (data: BusuanziResponse) => {
    clearTimeout(timeoutId)
    applyBusuanziData(data)

    // 清理全局 callback 与 script
    try {
      delete window[callbackName]
    } catch {
      window[callbackName] = undefined
    }

    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.removeChild(currentScript)
      currentScript = null
    }
  }

  const script = document.createElement("script")
  script.type = "text/javascript"
  script.async = true
  script.referrerPolicy = "no-referrer-when-downgrade"
  script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callbackName}`

  script.onerror = () => {
    clearTimeout(timeoutId)
    try {
      delete window[callbackName]
    } catch {
      window[callbackName] = undefined
    }
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }

    // 本地开发环境因 Referer 为 localhost 不蒜子后端会报 502，提供模拟数据以供本地排版调试
    if (isLocalDev) {
      const mockPagePv = (getPathHash(currentPath) % 300) + 12
      applyBusuanziData({
        site_pv: 1988,
        site_uv: 668,
        page_pv: mockPagePv,
        page_uv: Math.max(1, Math.floor(mockPagePv * 0.6))
      })
    }
  }

  currentScript = script
  document.head.appendChild(script)
}

// 注册兼容旧版 busuanzi API
if (inBrowser) {
  window.bszCaller = {
    fetch: () => {
      fetchBusuanzi()
    }
  }
  window.bszTag = {
    bszs: ["site_pv", "page_pv", "site_uv", "page_uv"],
    texts: (data: BusuanziResponse) => {
      window.bszTag?.bszs.forEach((key) => {
        const val = data[key as keyof BusuanziResponse]
        if (val !== undefined) {
          const el = document.getElementById(`busuanzi_value_${key}`)
          if (el) el.innerHTML = String(val)
        }
      })
    },
    shows: () => {
      window.bszTag?.bszs.forEach((key) => {
        const el = document.getElementById(`busuanzi_container_${key}`)
        if (el) el.style.display = "inline-flex"
      })
    },
    hides: () => {
      window.bszTag?.bszs.forEach((key) => {
        const el = document.getElementById(`busuanzi_container_${key}`)
        if (el) el.style.display = "none"
      })
    }
  }
}

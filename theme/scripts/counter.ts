import { inBrowser } from "vitepress"
import { reactive } from "vue"

export interface CounterData {
  sitePv: string | number
  siteUv: string | number
  pagePv: string | number
  pageUv: string | number
  loaded: boolean
}

export const counterData = reactive<CounterData>({
  sitePv: "",
  siteUv: "",
  pagePv: "",
  pageUv: "",
  loaded: false
})

export interface CounterResponse {
  site_pv?: number
  site_uv?: number
  page_pv?: number
  page_uv?: number
  version?: number
}

declare global {
  interface Window {
    [key: string]: any
    counterCaller?: {
      fetch: (url?: string, callback?: (data: CounterResponse) => void) => void
    }
    counterTag?: {
      keys: string[]
      texts: (data: CounterResponse) => void
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

function applyCounterData(data: CounterResponse): void {
  if (!data) return

  if (data.site_pv !== undefined) counterData.sitePv = data.site_pv
  if (data.site_uv !== undefined) counterData.siteUv = data.site_uv
  if (data.page_pv !== undefined) counterData.pagePv = data.page_pv
  if (data.page_uv !== undefined) counterData.pageUv = data.page_uv
  counterData.loaded = true

  const keys = ["site_pv", "site_uv", "page_pv", "page_uv"] as const
  keys.forEach((key) => {
    const val = data[key]
    if (val !== undefined) {
      const valEl = document.getElementById(`counter_value_${key}`)
      if (valEl) {
        valEl.innerText = String(val)
      }
      const containerEl = document.getElementById(`counter_container_${key}`)
      if (containerEl) {
        containerEl.style.display = "inline-flex"
      }
    }
  })
}

export function fetchCounter(): void {
  if (!inBrowser) return

  const now = Date.now()
  const currentUrl = window.location.href
  const currentPath = window.location.pathname

  if (currentUrl === lastFetchUrl && now - lastFetchTime < 300) {
    return
  }

  lastFetchUrl = currentUrl
  lastFetchTime = now

  counterData.pagePv = ""
  counterData.pageUv = ""

  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.removeChild(currentScript)
    currentScript = null
  }

  const isLocalDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"

  const callbackName = `CounterCallback_${Math.floor(1099511627776 * Math.random())}`

  const timeoutId = window.setTimeout(() => {
    try {
      delete window[callbackName]
    } catch {
      window[callbackName] = undefined
    }
  }, 10000)

  window[callbackName] = (data: CounterResponse) => {
    clearTimeout(timeoutId)
    applyCounterData(data)

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
  script.src = `https://counter.booling.cn/?jsonpCallback=${callbackName}`

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

    if (isLocalDev) {
      const mockPagePv = (getPathHash(currentPath) % 300) + 12
      applyCounterData({
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

if (inBrowser) {
  window.counterCaller = {
    fetch: () => {
      fetchCounter()
    }
  }
  window.counterTag = {
    keys: ["site_pv", "page_pv", "site_uv", "page_uv"],
    texts: (data: CounterResponse) => {
      window.counterTag?.keys.forEach((key) => {
        const val = data[key as keyof CounterResponse]
        if (val !== undefined) {
          const el = document.getElementById(`counter_value_${key}`)
          if (el) el.innerHTML = String(val)
        }
      })
    },
    shows: () => {
      window.counterTag?.keys.forEach((key) => {
        const el = document.getElementById(`counter_container_${key}`)
        if (el) el.style.display = "inline-flex"
      })
    },
    hides: () => {
      window.counterTag?.keys.forEach((key) => {
        const el = document.getElementById(`counter_container_${key}`)
        if (el) el.style.display = "none"
      })
    }
  }
}

import fs from "node:fs"
import path from "node:path"

export interface ObsidianPluginOptions {
  /** Root directory for public assets (defaults to 'blog/public') */
  publicDir?: string
  /** Source directory for markdown notes (defaults to 'blog') */
  srcDir?: string
  /** VitePress base URL (defaults to '/') */
  base?: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function markdownItObsidian(options: ObsidianPluginOptions = {}) {
  const publicDir = path.resolve(process.cwd(), options.publicDir || "blog/public")
  const srcDir = path.resolve(process.cwd(), options.srcDir || "blog")
  const base = options.base || "/"

  // Scan public directory for assets
  function scanPublicFiles(): Map<string, string> {
    const map = new Map<string, string>()
    if (!fs.existsSync(publicDir)) return map

    try {
      const entries = fs.readdirSync(publicDir, { recursive: true }) as string[]
      for (const entry of entries) {
        const fullPath = path.join(publicDir, entry)
        if (fs.statSync(fullPath).isFile()) {
          const normalized = entry.replace(/\\/g, "/")
          const basename = path.basename(normalized)
          const webPath = path.posix.join(base, normalized)

          // Shortest path matching (e.g. 'layout2flexbox.png')
          if (!map.has(basename)) {
            map.set(basename, webPath)
          }
          // Relative path inside public (e.g. 'images/layout2flexbox.png')
          map.set(normalized, webPath)
          // With leading 'public/' (e.g. 'public/images/layout2flexbox.png')
          map.set(`public/${normalized}`, webPath)
        }
      }
    } catch {
      // ignore read errors
    }
    return map
  }

  // Scan markdown notes for internal wikilinks
  function scanNotes(): Map<string, string> {
    const map = new Map<string, string>()
    if (!fs.existsSync(srcDir)) return map

    try {
      const entries = fs.readdirSync(srcDir, { recursive: true }) as string[]
      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue
        const fullPath = path.join(srcDir, entry)
        if (fs.statSync(fullPath).isFile()) {
          const normalized = entry.replace(/\\/g, "/").replace(/\.md$/, "")
          const basename = path.basename(normalized)
          // VitePress route (clean URLs)
          let route = path.posix.join(base, normalized)
          if (route.endsWith("/index")) {
            route = route.slice(0, -6) || "/"
          }
          if (!map.has(basename)) {
            map.set(basename, route)
          }
          map.set(normalized, route)
        }
      }
    } catch {
      // ignore read errors
    }
    return map
  }

  let publicFileMap = scanPublicFiles()
  let noteMap = scanNotes()

  return (md: any) => {
    // 1. Image and media embeds: ![[target|options]]
    md.inline.ruler.before("link", "obsidian_embed", (state: any, silent: boolean) => {
      const start = state.pos
      if (
        state.src.charCodeAt(start) !== 33 /* ! */ ||
        state.src.charCodeAt(start + 1) !== 91 /* [ */ ||
        state.src.charCodeAt(start + 2) !== 91 /* [ */
      ) {
        return false
      }

      const end = state.src.indexOf("]]", start + 3)
      if (end === -1) return false

      if (silent) return true

      const raw = state.src.slice(start + 3, end).trim()
      const parts = raw.split("|").map((s: string) => s.trim())
      const target = parts[0]
      const params = parts.slice(1)

      const cleanTarget = target.replace(/^(\/?public\/|\/)/, "")
      const baseName = path.basename(cleanTarget)

      // Re-scan if file not found (allows dynamic cache update in dev mode)
      if (!publicFileMap.has(cleanTarget) && !publicFileMap.has(baseName)) {
        publicFileMap = scanPublicFiles()
      }

      let resolvedSrc = target
      if (publicFileMap.has(cleanTarget)) {
        resolvedSrc = publicFileMap.get(cleanTarget)!
      } else if (publicFileMap.has(baseName)) {
        resolvedSrc = publicFileMap.get(baseName)!
      } else if (
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("/")
      ) {
        // Fallback: assume root public asset
        resolvedSrc = path.posix.join(base, cleanTarget)
      }

      let alt = baseName
      let width = ""
      let height = ""

      for (const param of params) {
        if (/^\d+$/.test(param)) {
          width = param
        } else if (/^(\d+)x(\d+)$/.test(param)) {
          const match = param.match(/^(\d+)x(\d+)$/)
          if (match) {
            width = match[1]
            height = match[2]
          }
        } else {
          alt = param
        }
      }

      const token = state.push("html_inline", "", 0)
      const attrs = [
        `src="${escapeHtml(resolvedSrc)}"`,
        `alt="${escapeHtml(alt)}"`,
        'loading="lazy"'
      ]
      if (width) attrs.push(`width="${escapeHtml(width)}"`)
      if (height) attrs.push(`height="${escapeHtml(height)}"`)

      const styles: string[] = []
      if (width) styles.push(`max-width: ${escapeHtml(width)}px;`)
      if (height) styles.push(`height: ${escapeHtml(height)}px;`)
      if (styles.length) attrs.push(`style="${styles.join(" ")}"`)

      token.content = `<img ${attrs.join(" ")} />`
      state.pos = end + 2
      return true
    })

    // 2. Note wikilinks: [[target|label]]
    md.inline.ruler.before("link", "obsidian_link", (state: any, silent: boolean) => {
      const start = state.pos
      // Ensure it is not preceded by !
      if (
        (start > 0 && state.src.charCodeAt(start - 1) === 33) ||
        state.src.charCodeAt(start) !== 91 /* [ */ ||
        state.src.charCodeAt(start + 1) !== 91 /* [ */
      ) {
        return false
      }

      const end = state.src.indexOf("]]", start + 2)
      if (end === -1) return false

      if (silent) return true

      const raw = state.src.slice(start + 2, end).trim()
      const parts = raw.split("|").map((s: string) => s.trim())
      const targetWithHash = parts[0]
      const [target, hash] = targetWithHash.split("#")
      const label = parts[1] || targetWithHash

      const cleanTarget = target.replace(/\.md$/, "")
      const baseName = path.basename(cleanTarget)

      if (cleanTarget && !noteMap.has(cleanTarget) && !noteMap.has(baseName)) {
        noteMap = scanNotes()
      }

      let href: string | undefined
      if (!cleanTarget && hash) {
        // Page anchor, e.g. [[#Heading]]
        href = `#${encodeURIComponent(hash)}`
      } else if (noteMap.has(cleanTarget)) {
        href = noteMap.get(cleanTarget) + (hash ? `#${encodeURIComponent(hash)}` : "")
      } else if (noteMap.has(baseName)) {
        href = noteMap.get(baseName) + (hash ? `#${encodeURIComponent(hash)}` : "")
      }

      const token = state.push("html_inline", "", 0)
      if (href) {
        token.content = `<a href="${escapeHtml(href)}" class="obsidian-wikilink">${escapeHtml(label)}</a>`
      } else {
        token.content = `<span class="obsidian-wikilink-unresolved" title="Unresolved link">${escapeHtml(label)}</span>`
      }

      state.pos = end + 2
      return true
    })
  }
}

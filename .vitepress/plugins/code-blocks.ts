import type MarkdownIt from "markdown-it"
import { collapsedLinesMarkdownPlugin } from "vitepress-plugin-code-collapse"

/** Keep VitePress's highlighting/copy markup, enhancing only ordinary fences. */
export function codeBlocks(md: MarkdownIt) {
  const originalFence = md.renderer.rules.fence!
  // VitePress treats digits in unknown metadata as highlight/line-number input.
  // Let the collapse plugin read its directive, but hide it from the native fence.
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const info = token.info
    token.info = info.replace(
      /:collapsed-lines(?:=\d+)?\b|:no-collapsed-lines\b/g,
      ""
    )
    let lineNumbers = ""
    token.info = token.info.replace(
      /\s+(:(?:no-)?line-numbers(?:=\d+)?)(?=\s|$)/g,
      (_match, directive: string) => {
        lineNumbers = directive
        return ""
      }
    )
    if (lineNumbers) {
      token.info = token.info.replace(/^([^\s{]+)/, `$1${lineNumbers}`)
    }
    try {
      return originalFence(tokens, index, options, env, self)
    } finally {
      token.info = info
    }
  }
  md.use(collapsedLinesMarkdownPlugin, false)
  const collapsibleFence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    const originalInfo = token.info
    if (/^(mermaid|mmd)(?=\s|$)/.test(originalInfo.trim())) {
      return originalFence(tokens, index, options, env, self)
    }

    let height: string | undefined
    token.info = originalInfo.replace(
      /(?:^|\s):height=(\S+)/g,
      (_match, value: string) => {
        if (
          !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|vh)$/.test(value) ||
          parseFloat(value) <= 0
        ) {
          throw new Error(
            `Invalid code block height "${value}": use a positive px, rem or vh value`
          )
        }
        height = value
        return ""
      }
    )

    try {
      let html = collapsibleFence(tokens, index, options, env, self)
      // The upstream plugin emits a click-only div. Use a native keyboard button.
      html = html.replace(
        '<div class="collapsed-lines"></div>',
        '<button type="button" class="collapsed-lines" aria-expanded="false">展开代码</button>'
      )
      if (height) {
        // The gutter and pre must share a scrollport, while copy stays outside.
        html = html.replace(
          /<pre\b/,
          `<div class="code-scroll" tabindex="0" role="region" aria-label="代码，可滚动浏览" style="--code-max-height:${height}"><pre`
        )
        html = html.includes('<button type="button" class="collapsed-lines"')
          ? html.replace(
              '<button type="button" class="collapsed-lines"',
              '</div><button type="button" class="collapsed-lines"'
            )
          : html.replace(/(<\/div>)$/, "</div>$1")
      }
      return html
    } finally {
      token.info = originalInfo
    }
  }
}

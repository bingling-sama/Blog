/** Event delegation also covers code blocks inserted by SPA navigation. */
export function setupCodeBlocks() {
  const onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest<HTMLButtonElement>(
      ".vp-doc button.collapsed-lines"
    )
    const block = button?.parentElement
    if (!button || !block) return
    const collapsed = block.classList.toggle("collapsed")
    button.setAttribute("aria-expanded", String(!collapsed))
    button.textContent = collapsed ? "展开代码" : "收起代码"
    if (collapsed) {
      const scroll = block.querySelector(".code-scroll")
      if (scroll) scroll.scrollTop = 0
      if (block.getBoundingClientRect().top < 0) {
        button.scrollIntoView({ block: "nearest" })
      }
    }
  }
  document.addEventListener("click", onClick)
  return () => document.removeEventListener("click", onClick)
}

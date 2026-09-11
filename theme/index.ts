import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import { inBrowser } from "vitepress"
import MyLayout from "./components/MyLayout.vue"
import Archives from "./components/Archives.vue"
import Category from "./components/Category.vue"
import Tags from "./components/Tags.vue"
import Posts from "./components/Posts.vue"
import Comment from "./components/Comment.vue"
import MermaidViewer from "./components/MermaidViewer.vue"
import { fetchBusuanzi } from "./scripts/busuanzi"

import "./custom.css"

export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app, router }) {
    // register global component
    app.component("Tags", Tags)
    app.component("Category", Category)
    app.component("Archives", Archives)
    app.component("Posts", Posts)
    app.component("Comment", Comment)
    app.component("Mermaid", MermaidViewer)

    if (inBrowser) {
      const origOnAfterRouteChanged = router.onAfterRouteChanged
      router.onAfterRouteChanged = (to) => {
        origOnAfterRouteChanged?.(to)
        setTimeout(() => {
          fetchBusuanzi()
        }, 50)
      }
    }
  }
} satisfies Theme

import DefaultTheme from "vitepress/theme-without-fonts"
import type { Theme } from "vitepress"
import { inBrowser } from "vitepress"
import { defineAsyncComponent } from "vue"
import MyLayout from "./components/MyLayout.vue"
import Posts from "./components/Posts.vue"
import { fetchCounter } from "./scripts/counter"

const Archives = defineAsyncComponent(() => import("./components/Archives.vue"))
const Category = defineAsyncComponent(() => import("./components/Category.vue"))
const Tags = defineAsyncComponent(() => import("./components/Tags.vue"))
const Comment = defineAsyncComponent(() => import("./components/Comment.vue"))
const MermaidViewer = defineAsyncComponent(
  () => import("./components/MermaidViewer.vue")
)

import "./styles/index.css"

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
          fetchCounter()
        }, 50)
      }
    }
  }
} satisfies Theme

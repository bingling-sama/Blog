// https://vitepress.dev/guide/custom-theme
import Layout from "./Layout.vue"
import { createVuetify } from "vuetify"
import { EnhanceAppContext } from "vitepress"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import "./style.css"
import "vuetify/styles"

const vuetify = createVuetify({
	components,
	directives
})

export default {
	Layout,
	enhanceApp(ctx: EnhanceAppContext) {
		// ...
		ctx.app.use(vuetify)
	}
}

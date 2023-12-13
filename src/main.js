import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import 'virtual:uno.css'
import { createPinia } from 'pinia'

import { Icon } from 'vant'
import { Collapse, CollapseItem } from 'vant'
import { Image as VanImage } from 'vant'

const app = createApp(App)
app.use(router)
app.use(Vant)
app.use(createPinia())
app.use(Icon)
app.use(Collapse)
app.use(CollapseItem)
app.use(VanImage)


app.mount('#app')

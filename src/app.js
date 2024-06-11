import { createPinia } from 'pinia'
import { createSSRApp } from 'vue'

import App from './App.vue'

pinia = createPinia()

export function createApp() {
    let app = createSSRApp(App)
    app.use(pinia)
    return app
}


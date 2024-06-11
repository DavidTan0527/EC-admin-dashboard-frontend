import './assets/main.scss'

import { createApp } from './main'

const { app } = createApp()

// mount for client hydration
app.mount('#app')


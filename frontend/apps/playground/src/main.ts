import './assets/main.css'
import { createApp } from 'vue'
import { initTheme } from '@nerv-iip/ui'
import App from './App.vue'

initTheme()
createApp(App).mount('#app')

import './assets/main.css'
import { createApp } from 'vue'
import { initTheme } from '@nerv-ui/ui'
import App from './App.vue'

initTheme()
createApp(App).mount('#app')

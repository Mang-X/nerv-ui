import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// Keep the theme import before component modules for development injection.
// config.mts also registers layer order before stylesheets in HTML: production
// CSS extraction can reorder scoped SFC styles ahead of this source import.
import './style.css'
import Demo from './Demo.vue'
import Layout from './Layout.vue'
import MobileDoc from './MobileDoc.vue'
import SceneBadge from './SceneBadge.vue'
import ScreenDemo from './ScreenDemo.vue'
import ScreenGallery from './screen/ScreenGallery.vue'

// Nerv-IIP docs theme — extends VitePress's default, re-skinned via style.css
// (the `--vp-*` → design-token mapping) and wrapped by Layout.vue for the accent
// picker. `<Demo>` is the global live-preview wrapper used by component pages;
// `<ScreenDemo>` is its dark industrial-blue counterpart for the screen layer.
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
    app.component('MobileDoc', MobileDoc)
    app.component('SceneBadge', SceneBadge)
    app.component('ScreenDemo', ScreenDemo)
    app.component('ScreenGallery', ScreenGallery)
  },
} satisfies Theme

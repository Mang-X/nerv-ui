/** Build integration for the retained, unmodified DHTMLX 9.1.4 Evaluation CSS. */
export function schedulingVendorStyles() {
  return {
    name: 'nerv-scheduling-vendor-styles',
    enforce: 'pre',
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/vendor/dhtmlx/dhtmlxgantt.css')) return
      // The host already supplies --font-sans locally. Preserve the embedded icon
      // font and images, all declarations and Evaluation notice in the raw asset.
      const css = code.replace(/@font-face\s*\{[^}]*https:\/\/fonts\.gstatic\.com[^}]*\}/g, '')
      return { code: `@layer nv-components {\n${css}\n}`, map: null }
    },
  }
}

<script setup lang="ts">
// Mobile component doc layout (Arco Design Mobile style): documentation prose +
// code on the LEFT, a sticky phone simulator on the RIGHT showing the live
// components. Use `layout: page` so the two columns have room.
//   <MobileDoc>
//     <template #phone> …live components… </template>
//     …markdown prose / code / props… (default slot)
//   </MobileDoc>
// The frame is skinned per real device (see DEVICES below) — notch/island/punch
// hole, bezel, corner radius, aspect. Pick one via the selector under the frame.
import { computed, provide, ref } from 'vue'
import { MOBILE_OVERLAY_TARGET } from '@nerv-ui/ui-mobile'
import SceneBadge from './SceneBadge.vue'

// Keep mobile overlays (NvBottomSheet, NvPicker, DatePicker, NvActionSheet, Dialog,
// NvNumberKeyboard, Toast) inside the phone frame instead of covering the page.
// `.nv-mdoc-screen` is given a containing block (transform) below so their
// `position: fixed` anchors to the phone, not the viewport.
provide(MOBILE_OVERLAY_TARGET, '.nv-mdoc-screen')

interface Device {
  id: string
  name: string
  /** CSS class suffix for the skin */
  skin: string
  /** screen logical resolution shown in the spec line */
  spec: string
  /** logical screen aspect ratio (px height / px width) */
  ratio: number
  /** device shell width in px (smaller phones render a narrower frame) */
  shellW: number
}
const DEVICES: Device[] = [
  { id: 'iphone15pro', name: 'iPhone 15 Pro', skin: 'iphone15pro', spec: '6.1″ · 灵动岛 · 2556×1179', ratio: 2556 / 1179, shellW: 360 },
  { id: 'iphonese', name: 'iPhone SE', skin: 'iphonese', spec: '4.7″ · Home 键 · 1334×750', ratio: 1334 / 750, shellW: 300 },
  { id: 'pixel8', name: 'Pixel 8', skin: 'pixel8', spec: '6.2″ · 打孔 · 2400×1080', ratio: 2400 / 1080, shellW: 368 },
  { id: 'galaxy-s24', name: 'Galaxy S24', skin: 'galaxy-s24', spec: '6.2″ · 打孔 · 2340×1080', ratio: 2340 / 1080, shellW: 364 },
]
const device = ref<Device>(DEVICES[0])
const skinClass = computed(() => `nv-mdoc-skin-${device.value.skin}`)
function pick(d: Device) {
  device.value = d
}
</script>

<template>
  <div class="nv-mdoc">
    <div class="nv-mdoc-main vp-doc">
      <!-- 移动 pages are `layout: page`, so the Layout `#doc-before` badge doesn't
           fire here — render the scene-availability badge at the top of the prose
           column instead. Auto-detects the mobile family from the route. -->
      <SceneBadge />
      <slot />
    </div>
    <aside class="nv-mdoc-aside">
      <div class="nv-mdoc-sticky">
        <ClientOnly>
          <div class="nv-mdoc-devicebar">
            <button
              v-for="d in DEVICES"
              :key="d.id"
              type="button"
              class="nv-mdoc-device"
              :class="{ 'is-active': d.id === device.id }"
              @click="pick(d)"
            >
              {{ d.name }}
            </button>
          </div>
          <!-- `vp-raw` isolates the phone preview from VitePress base/vp-doc
               resets (ADR 0020 §4.2); the prose column keeps its `vp-doc`. -->
          <div
            class="nv-mdoc-phone vp-raw"
            :class="skinClass"
            :style="{
              '--nv-mdoc-ratio': String(device.ratio),
              '--nv-mdoc-shell-w': `${device.shellW}px`,
            }"
          >
            <div class="nv-mdoc-statusbar">
              <span class="nv-mdoc-time font-semibold tabular-nums">9:41</span>
              <span class="nv-mdoc-battery" aria-hidden="true">
                <span class="nv-mdoc-battery-fill" />
              </span>
            </div>
            <div class="nv-mdoc-screen">
              <slot name="phone" />
            </div>
            <div class="nv-mdoc-homebar" aria-hidden="true" />
          </div>
          <p class="nv-mdoc-spec">{{ device.spec }}</p>
        </ClientOnly>
      </div>
    </aside>
  </div>
</template>

<style>
.nv-mdoc {
  display: grid;
  gap: 2.5rem;
  align-items: start;
  padding: 1.75rem 2rem 3rem;
}
@media (min-width: 1200px) {
  .nv-mdoc {
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 3.5rem;
    padding: 2.25rem 3rem 3.5rem;
  }
}
@media (min-width: 1600px) {
  .nv-mdoc {
    padding: 2.5rem 4rem 4rem;
  }
}
.nv-mdoc-main {
  min-width: 0;
}
.nv-mdoc-sticky {
  position: static;
}
@media (min-width: 1200px) {
  .nv-mdoc-sticky {
    position: sticky;
    top: 5.5rem;
  }
}

/* ── device selector ─────────────────────────────────────────────────── */
.nv-mdoc-devicebar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
  margin-bottom: 0.875rem;
}
.nv-mdoc-device {
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: transparent;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
  cursor: pointer;
  transition:
    border-color 0.15s var(--nv-ease-out-quart, ease-out),
    color 0.15s var(--nv-ease-out-quart, ease-out),
    background 0.15s var(--nv-ease-out-quart, ease-out);
}
.nv-mdoc-device:hover {
  color: var(--foreground);
  border-color: var(--foreground);
}
.nv-mdoc-device.is-active {
  color: var(--nv-brand);
  border-color: var(--nv-brand);
  background: color-mix(in oklch, var(--nv-brand) 8%, transparent);
}

/* ── shared phone shell ──────────────────────────────────────────────── */
.nv-mdoc-phone {
  width: var(--nv-mdoc-shell-w, 360px);
  max-width: 100%;
  margin-inline: auto;
  border: 1px solid var(--border);
  border-radius: 28px;
  background: var(--background);
  overflow: hidden;
  box-shadow:
    0 1px 0 0 color-mix(in oklch, white 6%, transparent) inset,
    0 20px 50px -20px color-mix(in oklch, black 60%, transparent);
}
.nv-mdoc-statusbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 2.5rem;
  padding-inline: 1.5rem;
  font-size: 0.75rem;
  color: var(--foreground);
}
.nv-mdoc-battery {
  display: inline-block;
  width: 1.5rem;
  height: 0.7rem;
  border-radius: 0.2rem;
  border: 1.5px solid color-mix(in oklch, var(--foreground) 55%, transparent);
  padding: 1px;
}
.nv-mdoc-battery-fill {
  display: block;
  height: 100%;
  width: 70%;
  border-radius: 0.1rem;
  background: color-mix(in oklch, var(--foreground) 70%, transparent);
}
.nv-mdoc-screen {
  /* screen height follows the device's real aspect ratio: height = shell width
     × (device px height / device px width), passed via --nv-mdoc-ratio, but
     never taller than the viewport minus the chrome around it. */
  height: min(calc(var(--nv-mdoc-shell-w, 360px) * var(--nv-mdoc-ratio, 2.17)), calc(100vh - 11rem));
  overflow-y: auto;
  background: var(--background);
  scrollbar-width: thin;
  /* Reserve the scrollbar gutter permanently. Bottom overlays (NvBottomSheet,
     NvActionSheet, NvPicker, Dialog, Toast) teleport here and animate up from
     translateY(100%); mid-animation they briefly extend past the bottom, which
     would pop a scrollbar and squeeze the content width, then release it. A
     stable gutter keeps the width fixed so there's no reflow flash. */
  scrollbar-gutter: stable;
  /* containing block for overlays teleported here (MOBILE_OVERLAY_TARGET): a
     transform makes this element the containing block for `position: fixed`
     descendants, so sheets/dialogs/keypads/toasts anchor to the phone screen
     (clipped by overflow) instead of the viewport. */
  transform: translateZ(0);
}
.nv-mdoc-homebar {
  height: 1.1rem;
  position: relative;
}
.nv-mdoc-homebar::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0.3rem;
  transform: translateX(-50%);
  width: 7rem;
  height: 0.28rem;
  border-radius: 9999px;
  background: color-mix(in oklch, var(--foreground) 55%, transparent);
}
/* tidy default rhythm for stacked demos inside the phone */
.nv-mdoc-screen :where(section) {
  padding: 1rem;
}
.nv-mdoc-screen :where(section) + :where(section) {
  border-top: 1px solid var(--border);
}
.nv-mdoc-label {
  margin-bottom: 0.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--muted-foreground);
}
.nv-mdoc-spec {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

/* ── iPhone 15 Pro — Dynamic Island, stainless band, rounded corners ─── */
.nv-mdoc-skin-iphone15pro {
  border-radius: 2.75rem;
  border-width: 3px;
  border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
}
.nv-mdoc-skin-iphone15pro .nv-mdoc-statusbar::after {
  /* Dynamic Island */
  content: '';
  position: absolute;
  left: 50%;
  top: 0.55rem;
  transform: translateX(-50%);
  width: 6rem;
  height: 1.6rem;
  border-radius: 9999px;
  background: oklch(0.05 0 0);
}
.nv-mdoc-skin-iphone15pro .nv-mdoc-time {
  padding-left: 0.5rem;
}

/* ── iPhone SE — Home button bezel, squared top/bottom, thicker frame ── */
.nv-mdoc-skin-iphonese {
  border-radius: 0.9rem;
  border-width: 2px;
  border-color: color-mix(in oklch, var(--foreground) 25%, transparent);
}
.nv-mdoc-skin-iphonese .nv-mdoc-statusbar {
  height: 2rem;
  justify-content: center;
}
.nv-mdoc-skin-iphonese .nv-mdoc-time {
  font-size: 0.7rem;
}
.nv-mdoc-skin-iphonese .nv-mdoc-battery {
  position: absolute;
  right: 1.25rem;
}
.nv-mdoc-skin-iphonese .nv-mdoc-homebar {
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nv-mdoc-skin-iphonese .nv-mdoc-homebar::after {
  /* circular Home button with a subtle ring */
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0.45rem;
  transform: translateX(-50%);
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 9999px;
  border: 2px solid color-mix(in oklch, var(--foreground) 32%, transparent);
  background: color-mix(in oklch, var(--foreground) 6%, transparent);
  box-shadow: inset 0 1px 1px color-mix(in oklch, black 8%, transparent);
}
.nv-mdoc-skin-iphonese .nv-mdoc-screen {
  height: 500px;
}

/* ── Pixel 8 — centered punch hole, slim bezel, tall ratio ────────────── */
.nv-mdoc-skin-pixel8 {
  border-radius: 2rem;
  border-width: 2px;
  border-color: color-mix(in oklch, var(--foreground) 20%, transparent);
}
.nv-mdoc-skin-pixel8 .nv-mdoc-statusbar::after {
  /* centered punch hole camera */
  content: '';
  position: absolute;
  left: 50%;
  top: 0.65rem;
  transform: translateX(-50%);
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 9999px;
  background: oklch(0.08 0 0);
}
.nv-mdoc-skin-pixel8 .nv-mdoc-statusbar {
  height: 2.5rem;
  padding-inline: 1.25rem;
}

/* ── Galaxy S24 — centered punch hole, flatter sides, taller ratio ────── */
.nv-mdoc-skin-galaxy-s24 {
  border-radius: 1.5rem;
  border-width: 2px;
  border-color: color-mix(in oklch, var(--foreground) 22%, transparent);
}
.nv-mdoc-skin-galaxy-s24 .nv-mdoc-statusbar::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0.6rem;
  transform: translateX(-50%);
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 9999px;
  background: oklch(0.08 0 0);
}
.nv-mdoc-skin-galaxy-s24 .nv-mdoc-statusbar {
  height: 2.4rem;
  padding-inline: 1.25rem;
}
.nv-mdoc-skin-galaxy-s24 .nv-mdoc-homebar {
  height: 0.9rem;
}
</style>

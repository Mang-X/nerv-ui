<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import ScreenButton from './ScreenButton.vue'
defineProps<{
  open: boolean
  title: string
  description: string
  state: 'data' | 'pending' | 'error' | 'empty'
  statusText?: string
}>()
defineEmits<{ 'update:open': [open: boolean] }>()
</script>
<template>
  <DialogRoot :open="open" @update:open="$emit('update:open', $event)">
    <DialogTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></DialogTrigger>
    <DialogPortal v-if="open" to="body">
      <div class="nv-scr-detail-layer" data-slot="nv-screen-detail-layer">
        <DialogOverlay class="nv-scr-detail-mask" data-slot="nv-screen-detail-mask" />
        <DialogContent class="nv-scr-detail text-sm" data-slot="nv-dialog-content">
          <header class="flex items-start gap-4">
            <div class="min-w-0 flex-1">
              <DialogTitle class="text-lg font-semibold">{{ title }}</DialogTitle
              ><DialogDescription class="text-sm">{{ description }}</DialogDescription>
            </div>
            <DialogClose as-child
              ><ScreenButton aria-label="关闭详情">关闭</ScreenButton></DialogClose
            >
          </header>
          <div class="nv-scr-detail-body nv-scr-scroll">
            <p
              v-if="state !== 'data'"
              :role="state === 'error' ? 'alert' : 'status'"
              :aria-busy="state === 'pending'"
            >
              {{
                statusText ??
                (state === 'pending' ? '读取中…' : state === 'error' ? '读取失败' : '暂无数据')
              }}
            </p>
            <template v-else
              ><section><slot name="info" /></section>
              <section class="nv-scr-detail-parameters"><slot name="parameter" /></section>
              <section><slot name="history" /></section
            ></template>
          </div>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
<style scoped>
@layer nv-components {
  .nv-scr-detail-layer {
    position: fixed;
    inset: 0;
    z-index: 60;
    isolation: isolate;
  }
  .nv-scr-detail-mask {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: color-mix(in srgb, var(--nv-scr-bg) 70%, transparent);
  }
  /* 进出场 — 遮罩淡入；本体居中缩放淡入（scale 收缩、无回弹，与全系统动效契约一致）。
     动画挂在元素自身而非 `[data-state]`：teleport 后的 `[data-state=open]` 会被宿主
     `tw-animate`/`animate-in` 的 data-state 选择器抢走。`v-if` 每次开合都重新挂载，
     进场动画随挂载触发；卸载即消失（组件即插即卸的设计边界，非本轮结构改动范围）。 */
  .nv-scr-detail-mask {
    animation: nv-scr-detail-fade var(--nv-duration-fade, 160ms) linear both;
  }
  .nv-scr-detail {
    animation: nv-scr-detail-in var(--nv-duration-fast-invoke, 187ms)
      var(--nv-scr-ease-emphasized) both;
  }
  @keyframes nv-scr-detail-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes nv-scr-detail-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-detail-mask,
    .nv-scr-detail {
      animation: none;
    }
  }
  /* Glass material (translucent fill + backdrop blur) comes from the shared
     overrides.css `data-slot='nv-dialog-content'` rule; the opaque fill below
     is the no-blur fallback. */
  .nv-scr-detail {
    position: fixed;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(1120px, 94vw);
    max-height: 92dvh;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background-color: var(--nv-scr-bg-accent);
    color: var(--nv-scr-text);
    overflow-wrap: anywhere;
  }
  .nv-scr-detail header {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--nv-scr-divider);
  }
  .nv-scr-detail-body {
    min-height: 0;
    overflow: auto;
    padding-top: 14px;
    display: grid;
    gap: 16px;
  }
  .nv-scr-detail-parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 12px;
  }
}
</style>

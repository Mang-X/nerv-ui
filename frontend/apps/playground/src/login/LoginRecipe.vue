<script setup lang="ts">
import { computed, shallowRef, watch, onBeforeUnmount, nextTick } from 'vue'
import {
  NvButton,
  NvCard,
  NvCardContent,
  NvSidebarBrand,
  NvScreenLoginStage,
  NvScreenButton,
} from '@nerv-iip/ui'
import { NvMobileButton } from '@nerv-iip/ui-mobile'
import reading from '../assets/login-reading.svg'
import type { LoginDraft, LoginMode, LoginSurface, SubmitLogin } from './contract'
const props = defineProps<{
  modelValue: LoginDraft
  surface: LoginSurface
  mode: LoginMode
  context: string
  brand: string
  submit?: SubmitLogin
  readonly?: boolean
  disabled?: boolean
  logoutNotice?: 'failed' | 'timed-out' | ''
}>()
const emit = defineEmits<{
  'update:modelValue': [value: LoginDraft]
  confirmed: []
  cancel: []
}>()
const pending = shallowRef(false)
const error = shallowRef('')
const confirmed = shallowRef(false)
let revision = 0
let alive = true
function invalidate() {
  revision++
  pending.value = false
  error.value = ''
  confirmed.value = false
}
watch(
  () => [
    props.context,
    props.surface,
    props.mode,
    props.readonly,
    props.disabled,
    props.submit,
    props.modelValue,
  ],
  invalidate,
  { flush: 'sync', deep: true },
)
onBeforeUnmount(() => {
  alive = false
  revision++
})
const blocked = computed(() => pending.value || props.readonly || props.disabled)
const title = computed(() => (props.mode === 'login' ? '欢迎回来' : '修改密码'))
const notice = computed(() =>
  props.logoutNotice === 'failed'
    ? '当前设备已退出，但服务器会话撤销失败。'
    : props.logoutNotice === 'timed-out'
      ? '服务器会话撤销超时，当前设备已安全退出。'
      : '',
)
const fields = computed(() =>
  props.mode === 'login'
    ? [
        { key: 'loginName' as const, label: '账号', type: 'text', autocomplete: 'username' },
        {
          key: 'password' as const,
          label: '密码',
          type: 'password',
          autocomplete: 'current-password',
        },
      ]
    : [
        {
          key: 'currentPassword' as const,
          label: '当前密码',
          type: 'password',
          autocomplete: 'current-password',
        },
        {
          key: 'newPassword' as const,
          label: '新密码',
          type: 'password',
          autocomplete: 'new-password',
        },
        {
          key: 'confirmPassword' as const,
          label: '确认新密码',
          type: 'password',
          autocomplete: 'new-password',
        },
      ],
)
async function input(key: keyof LoginDraft, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', { ...props.modelValue, [key]: target.value })
  await nextTick()
  if (alive) target.value = props.modelValue[key]
}
function cancel() {
  invalidate()
  emit('cancel')
}
async function submit() {
  if (blocked.value || !alive) return
  const own = ++revision
  const context = props.context
  const callback = props.submit
  const mode = props.mode
  const surface = props.surface
  const draft = { ...props.modelValue }
  // Read current props as well as the synchronous watch: stale callbacks cannot
  // commit success, error or finally into a replacement request.
  const current = () =>
    alive &&
    revision === own &&
    props.context === context &&
    props.submit === callback &&
    props.mode === mode &&
    props.surface === surface &&
    !props.readonly &&
    !props.disabled
  pending.value = true
  error.value = ''
  confirmed.value = false
  try {
    const receipt = await callback?.({
      ...draft,
      mode,
      loginName: surface.includes('console') ? draft.loginName.trim() : draft.loginName,
    })
    if (!current()) return
    if (
      !receipt ||
      typeof receipt !== 'object' ||
      !('accepted' in receipt) ||
      receipt.accepted !== true
    ) {
      error.value = '未能完成，请重试。'
      return
    }
    confirmed.value = true
    emit('confirmed')
  } catch {
    if (current()) error.value = '未能完成，请重试。'
  } finally {
    if (current()) pending.value = false
  }
}
</script>
<template>
  <section
    :class="[
      'login-recipe',
      { 'login-pda': surface === 'pda', 'login-pc': surface.includes('console') },
    ]"
  >
    <aside
      v-if="surface.includes('console')"
      class="login-brand hidden lg:flex flex-col items-center justify-center gap-6 bg-primary p-8 text-primary-foreground"
    >
      <NvSidebarBrand :name="brand" as="div" :caret="false" />
      <p class="text-sm">给今天的相遇留一个位置。</p>
    </aside>
    <div :class="surface === 'screen' ? '' : 'login-body p-6 md:p-10'">
      <NvSidebarBrand
        v-if="surface !== 'screen'"
        :name="brand"
        as="div"
        :caret="false"
        :class="surface.includes('console') ? 'lg:hidden' : ''"
      />
      <component
        :is="surface === 'screen' ? NvScreenLoginStage : 'div'"
        v-bind="
          surface === 'screen'
            ? {
                title,
                brand,
                imageSrc: reading,
                imageWidth: 1000,
                imageHeight: 600,
                pending,
                disabled: readonly || disabled,
                error,
              }
            : {}
        "
        @submit="submit"
      >
        <component
          :is="surface === 'screen' ? 'div' : 'form'"
          :novalidate="mode === 'change-password'"
          @submit.prevent="surface !== 'screen' && submit()"
        >
          <component
            :is="
              surface === 'console' || surface === 'pda' || surface === 'screen' ? 'div' : NvCard
            "
          >
            <component
              :is="surface === 'business-console' ? NvCardContent : 'div'"
              class="flex flex-col gap-4"
            >
              <h1 v-if="surface !== 'screen'" class="text-2xl font-semibold tracking-tight">
                {{ title }}
              </h1>
              <p class="text-sm">此处为演示，不建立真实会话，也不保存密码。</p>
              <p v-if="surface === 'pda' && notice" data-notice role="status" class="text-sm">
                {{ notice }}
              </p>
              <p v-if="error && surface !== 'screen'" role="alert" class="text-sm text-destructive">
                {{ error }}
              </p>
              <label
                v-for="field in fields"
                :key="field.key"
                class="flex flex-col gap-2 text-sm font-medium"
              >
                {{ field.label }}
                <input
                  :name="field.key"
                  :type="field.type"
                  :autocomplete="field.autocomplete"
                  :required="mode === 'login' && surface.includes('console') ? true : undefined"
                  :autocapitalize="
                    surface === 'pda' && field.key === 'loginName' ? 'off' : undefined
                  "
                  :spellcheck="surface === 'pda' && field.key === 'loginName' ? false : undefined"
                  :value="modelValue[field.key]"
                  :disabled="blocked"
                  :aria-invalid="!!error"
                  :class="
                    surface === 'screen'
                      ? 'login-screen-input'
                      : surface === 'pda'
                        ? 'min-h-12 rounded-lg border border-border bg-card px-4 text-foreground focus-visible:outline-ring'
                        : 'h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-ring'
                  "
                  @input="input(field.key, $event)"
                />
                <span
                  v-if="surface === 'business-console' && field.key === 'loginName'"
                  class="text-sm text-muted-foreground"
                  >使用你的空间账号。</span
                >
              </label>
              <component
                :is="
                  surface === 'screen'
                    ? NvScreenButton
                    : surface === 'pda'
                      ? NvMobileButton
                      : NvButton
                "
                type="submit"
                :disabled="blocked"
                >{{ pending ? '正在提交…' : mode === 'login' ? '继续' : '确认修改' }}</component
              >
              <slot name="hint" />
              <p v-if="confirmed" role="status" class="text-sm">
                演示请求已确认；未建立会话或保存密码。
              </p>
            </component>
          </component>
        </component>
      </component>
      <NvButton data-cancel variant="outline" type="button" @click="cancel">取消本次请求</NvButton>
    </div>
  </section>
</template>
<style scoped>
@layer app {
  .login-screen-input {
    min-height: 3rem;
    padding: 0.75rem;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
  .login-screen-input:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 2px;
  }
  .login-recipe {
    min-width: 0;
  }
  .login-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 28rem;
    margin: auto;
  }
  .login-pda {
    min-height: 100dvh;
    padding: max(1.5rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right))
      max(1.5rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left));
  }
  .login-pda .login-body {
    padding: 0;
  }
  @media (min-width: 1024px) {
    .login-pc {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100svh;
    }
  }
}
</style>

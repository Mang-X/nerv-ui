import { createApp, h, ref, shallowRef } from 'vue'
import { NvApp, NvButton, NvScheduleTimeline } from '@nerv-iip/ui'
import '@nerv-iip/ui/styles.css'
import {
  useSchedulingPlan,
  useSchedulingEdits,
  evaluateDraft,
  toModel,
} from '@nerv-iip/scheduling/host'
import type { ScheduleModel, ScheduleVisualModel } from '@nerv-iip/scheduling/model'
import { readingPlan, walkingPlan } from './models'
import './style.css'

createApp({
  setup() {
    const id = ref<string | undefined>('reading-A'),
      context = ref({ space: 'club' })
    type Gate = {
      key: string
      resolve: (model: ScheduleModel) => void
      reject: (cause: unknown) => void
      signal: AbortSignal
    }
    const requests = shallowRef<Gate[]>([]),
      previewGates = shallowRef<Gate[]>([]),
      releaseGates = shallowRef<Gate[]>([])
    const supplied = (key: string) =>
      key.startsWith('walking')
        ? { ...walkingPlan, meta: { ...walkingPlan.meta, planId: key } }
        : readingPlan(key)
    const plan = useSchedulingPlan(id, context, {
      load: (request, control) =>
        new Promise<ScheduleModel>((resolve, reject) => {
          requests.value = [
            ...requests.value,
            { key: request.planId, resolve, reject, signal: control.signal },
          ]
        }),
      adapt: (source) => toModel(source, (value) => value),
    })
    const draft = shallowRef(readingPlan()),
      previewCount = ref(0),
      releaseCount = ref(0),
      message = ref('尚未提交')
    const edits = useSchedulingEdits(draft, () => ({
      context: context.value,
      preview: (snapshot, control) =>
        new Promise<ScheduleModel>((resolve, reject) => {
          previewCount.value++
          previewGates.value = [
            ...previewGates.value,
            { key: snapshot.meta.planId, resolve, reject, signal: control.signal },
          ]
        }),
      release: (planId, control) =>
        new Promise<void>((resolve, reject) => {
          releaseCount.value++
          releaseGates.value = [
            ...releaseGates.value,
            { key: planId, resolve: () => resolve(), reject, signal: control.signal },
          ]
        }),
    }))
    const button = (text: string, action: () => void, disabled = false) =>
      h(NvButton, { variant: 'outline', onClick: action, disabled }, () => text)
    async function action(kind: 'preview' | 'release') {
      try {
        const accepted = await (kind === 'preview' ? edits.repreview() : edits.release())
        if (accepted) message.value = kind === 'preview' ? '预览已接收' : '发布已接收'
      } catch {
        message.value = '提交失败，可重试'
      }
    }
    const visual = (model: ScheduleModel): ScheduleVisualModel => ({
      horizon: { start: model.horizon.startUtc, end: model.horizon.endUtc },
      timezones: ['UTC'],
      links: [],
      groups: [{ id: 'activity', label: '活动' }],
      tasks: model.tasks.map((t) => ({
        id: t.id,
        groupId: 'activity',
        timezone: 'UTC',
        label: t.text,
        start: t.startUtc,
        end: t.endUtc,
        locked: t.locked,
      })),
    })
    return () =>
      h(NvApp, {}, () =>
        h('main', { class: 'host-page' }, [
          h('h1', '活动安排'),
          h('p', '共读与出行由宿主提供，确认结果后再更新安排。'),
          h('section', [
            h('h2', '读取安排'),
            h('div', { class: 'actions' }, [
              button('选择散步', () => {
                id.value = 'walking-B'
              }),
              button('重新读取', () => {
                void plan.reload()
              }),
              button('返回共读', () => {
                requests.value.find((x) => x.key === 'reading-A')?.resolve(supplied('reading-A'))
              }),
              button('共读读取失败', () => {
                requests.value.find((x) => x.key === 'reading-A')?.reject(Error('旧读取失败'))
              }),
              button('返回散步', () => {
                requests.value
                  .findLast((x) => x.key === 'walking-B')
                  ?.resolve(supplied('walking-B'))
              }),
              button('取消读取', () => plan.cancel()),
            ]),
            h(
              'p',
              { 'data-testid': 'load-state' },
              `读取：${plan.status.value}；当前：${plan.model.value?.meta.planId ?? '未知'}；错误：${plan.error.value instanceof Error ? plan.error.value.message : '无'}`,
            ),
            plan.model.value
              ? h(NvScheduleTimeline, { model: visual(plan.model.value) })
              : h('p', '等待宿主返回安排'),
          ]),
          h('section', [
            h('h2', '调整安排'),
            h('div', { class: 'actions' }, [
              button('锁定共读', () => edits.setLocked('read', true), edits.busy.value),
              button('撤销', () => edits.undo(), !edits.canUndo.value),
              button('重做', () => edits.redo(), !edits.canRedo.value),
              button(
                '重新预览',
                () => {
                  void action('preview')
                },
                edits.busy.value,
              ),
              button(
                '发布安排',
                () => {
                  void action('release')
                },
                edits.busy.value,
              ),
              button('预览失败', () => previewGates.value.at(-1)?.reject(Error('网络断开'))),
              button('预览返回', () => previewGates.value.at(-1)?.resolve(readingPlan('accepted'))),
              button('发布失败', () => releaseGates.value.at(-1)?.reject(Error('服务拒绝'))),
              button('发布返回', () => releaseGates.value.at(-1)?.resolve(draft.value)),
              button('取消提交', () => edits.cancel()),
              button('更换场地', () => {
                context.value = { space: 'park' }
                draft.value = { ...walkingPlan }
              }),
            ]),
            h(
              'p',
              { 'data-testid': 'edit-state' },
              `草案：${draft.value.meta.planId}；${edits.dirty.value ? '已修改' : '未修改'}；状态：${edits.status.value}；预览请求：${previewCount.value}；发布请求：${releaseCount.value}`,
            ),
            h('p', { 'data-testid': 'message' }, message.value),
            h(
              'p',
              { 'data-testid': 'validation' },
              evaluateDraft(draft.value).tasks[draft.value.tasks[0]!.id]?.issues[0]?.message ??
                '未提供依据',
            ),
            h(NvScheduleTimeline, { model: visual(draft.value) }),
          ]),
        ]),
      )
  },
}).mount('#app')

import { createApp, h, shallowRef, computed } from 'vue'
import { NvScheduleTimeline, NvButton, NvApp } from '@nerv-iip/ui'
import '@nerv-iip/ui/styles.css'
import {
  withWorkOrderFacts,
  withFactoryTimeContext,
  taskFactRows,
  factoryTimeInput,
  factoryTimeInstant,
  freezeWindow,
  type ScheduleFact,
  type ScheduleVisualModel,
} from '@nerv-iip/scheduling/model'
import { reading, travel } from './models'

createApp({
  setup() {
    const source = shallowRef<ScheduleVisualModel>(reading)
    const zone = shallowRef('UTC')
    const facts = shallowRef<readonly ScheduleFact[] | undefined>([
      { label: '余票', state: 'known', value: 0 },
      { label: '天气', state: 'unknown' },
      { label: '成员', state: 'forbidden' },
      { label: '路线', state: 'unavailable' },
      { label: '备注', state: 'known', value: '' },
    ])
    const instant = shallowRef(reading.tasks[0]!.start)
    const wall = shallowRef(factoryTimeInput(instant.value, zone.value))
    const saved = shallowRef('尚未保存')
    const end = shallowRef('2026-01-15T08:00:00+02:00')
    const model = computed(() => {
      const base = { ...source.value, tasks: [{ ...source.value.tasks[0]!, start: instant.value }] }
      const timed = withFactoryTimeContext(base, [{ taskId: 'read', timezone: zone.value }])
      const projected = withWorkOrderFacts(timed, [{ taskId: 'read', facts: facts.value }])
      const window = freezeWindow(
        {
          windows: [
            { workCenterId: 'space', startUtc: '2026-01-15T04:00:00+02:00', endUtc: end.value },
          ],
        },
        'space',
      )
      return {
        ...projected,
        windows: window
          ? [
              {
                id: 'host-window',
                laneId: 'space',
                label: '宿主保留时段',
                start: window.startUtc,
                end: window.endUtc,
              },
            ]
          : [],
      }
    })
    const button = (label: string, onClick: () => void) =>
      h(NvButton, { variant: 'outline', onClick }, () => label)
    const field = (label: string, value: string, onInput: (value: string) => void) =>
      h('label', { class: 'grid gap-1' }, [
        label,
        h('input', {
          class: 'rounded border bg-background p-2',
          'aria-label': label,
          value,
          onInput: (e: Event) => onInput((e.target as HTMLInputElement).value),
        }),
      ])
    return () =>
      h(NvApp, {}, () =>
        h('main', { class: 'm-6 space-y-4 text-sm' }, [
          h('h1', { class: 'text-2xl font-semibold' }, '时间与事实'),
          h('p', '中性宿主提供事实、时区和保留窗口。时间轴只负责展示。'),
          h('div', { class: 'flex flex-wrap gap-3' }, [
            button('替换为出行安排', () => {
              saved.value = '尚未保存'
              source.value = travel
              instant.value = travel.tasks[0]!.start
              zone.value = ''
              wall.value = ''
              facts.value = undefined
              end.value = ''
            }),
            button('未知事实', () => {
              facts.value = undefined
            }),
            button('空事实', () => {
              facts.value = []
            }),
            button('零与无权', () => {
              facts.value = [
                { label: '余票', state: 'known', value: 0 },
                { label: '成员', state: 'forbidden' },
              ]
            }),
          ]),
          h('div', { class: 'flex flex-wrap gap-3' }, [
            field('展示时区', zone.value, (v) => {
              zone.value = v
              wall.value = factoryTimeInput(instant.value, v)
            }),
            field('墙上时间', wall.value, (v) => {
              wall.value = v
            }),
            field('保留结束实刻', end.value, (v) => {
              end.value = v
            }),
            button('保存墙上时间', () => {
              const next = factoryTimeInstant(wall.value, zone.value, instant.value)
              saved.value = next ?? '时间无效或有歧义'
              if (next) instant.value = next
            }),
          ]),
          h('output', { 'data-instant': '', class: 'block' }, instant.value),
          h('output', { 'data-save': '', class: 'block' }, saved.value),
          h(
            'pre',
            { 'data-facts': '' },
            JSON.stringify(taskFactRows(model.value.tasks[0]!), null, 2),
          ),
          h(NvScheduleTimeline, { model: model.value, scale: 'day' }),
        ]),
      )
  },
}).mount('#app')

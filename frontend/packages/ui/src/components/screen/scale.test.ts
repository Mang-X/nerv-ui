import { describe, expect, it } from 'vitest'
import { computeScale } from './scale'

describe('computeScale', () => {
  it('fit：视口比设计更高时按宽度定标，整屏完整（上下留边）', () => {
    expect(computeScale(1920, 1200, 1920, 1080, 'fit')).toEqual({ x: 1, y: 1 })
  })

  it('fit：视口比设计更宽时按高度定标（左右留边）', () => {
    expect(computeScale(2560, 1080, 1920, 1080, 'fit')).toEqual({ x: 1, y: 1 })
  })

  it('fit：小视口等比缩小', () => {
    expect(computeScale(960, 540, 1920, 1080, 'fit')).toEqual({ x: 0.5, y: 0.5 })
  })

  it('width：仅按宽度等比缩放', () => {
    expect(computeScale(960, 1080, 1920, 1080, 'width')).toEqual({ x: 0.5, y: 0.5 })
  })

  it('stretch：宽高各自拉伸（非等比）', () => {
    expect(computeScale(960, 1080, 1920, 1080, 'stretch')).toEqual({ x: 0.5, y: 1 })
  })

  it('非法尺寸回退到 1（不崩）', () => {
    expect(computeScale(0, 0, 1920, 1080)).toEqual({ x: 1, y: 1 })
    expect(computeScale(1920, 1080, 0, 0)).toEqual({ x: 1, y: 1 })
  })

  it('默认 mode 为 fit', () => {
    expect(computeScale(960, 540, 1920, 1080)).toEqual({ x: 0.5, y: 0.5 })
  })

  it.each([
    { name: 'nonfinite viewport width', values: [NaN, 540, 1920, 1080] },
    { name: 'nonfinite viewport height', values: [960, Infinity, 1920, 1080] },
    { name: 'nonfinite design width', values: [960, 540, Infinity, 1080] },
    { name: 'nonfinite design height', values: [960, 540, 1920, NaN] },
    { name: 'negative viewport', values: [-1, 540, 1920, 1080] },
    { name: 'negative design', values: [960, 540, 1920, -1] },
  ])('returns a safe identity for $name in every mode', ({ values }) => {
    for (const mode of ['fit', 'width', 'stretch'] as const) {
      expect(computeScale(values[0]!, values[1]!, values[2]!, values[3]!, mode)).toEqual({
        x: 1,
        y: 1,
      })
    }
  })
})

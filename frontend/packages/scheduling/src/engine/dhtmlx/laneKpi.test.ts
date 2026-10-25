import { describe, expect, it } from 'vitest'
import { hasAnyLaneKpi, resolveLaneKpiVisibility } from './DhtmlxEngine'

// P05: supplied zero is known; missing/non-finite is unknown. Older all-zero hiding
// assertions are retained in Git history and superseded by the approved public contract.
describe('resolveLaneKpiVisibility', () => {
  it('字段在所有泳道都缺失时不上屏', () => {
    const v = resolveLaneKpiVisibility([
      { utilization: 0.74 },
      { utilization: 0.77 },
      { utilization: 0.69 },
    ])
    expect(v.utilization).toBe(true)
    expect(v.oee).toBe(false)
    expect(v.changeoverCount).toBe(false)
    expect(v.materialRisk).toBe(false)
  })

  it('字段在所有泳道都是真实 0 时仍然上屏', () => {
    const v = resolveLaneKpiVisibility([
      { utilization: 0.74, oee: 0, changeoverCount: 0, materialRisk: 0 },
      { utilization: 0.55, oee: 0, changeoverCount: 0, materialRisk: 0 },
    ])
    expect(v.oee).toBe(true)
    expect(v.changeoverCount).toBe(true)
    expect(v.materialRisk).toBe(true)
  })

  it('只要有一条泳道有非零值就整列上屏——其余泳道的真 0 是有意义的读数,不能连坐隐藏', () => {
    const v = resolveLaneKpiVisibility([
      { changeoverCount: 0, materialRisk: 0 },
      { changeoverCount: 6, materialRisk: 0 },
    ])
    expect(v.changeoverCount).toBe(true)
    expect(v.materialRisk).toBe(true)
  })

  it('NaN / Infinity 不算有效值', () => {
    const v = resolveLaneKpiVisibility([{ oee: Number.NaN }, { oee: Number.POSITIVE_INFINITY }])
    expect(v.oee).toBe(false)
  })

  it('没有任何泳道时全部不上屏', () => {
    const v = resolveLaneKpiVisibility([])
    expect(hasAnyLaneKpi(v)).toBe(false)
  })

  it('四项全无数据时整列「产能指标」都不该出现', () => {
    expect(hasAnyLaneKpi(resolveLaneKpiVisibility([{}, undefined]))).toBe(false)
    expect(hasAnyLaneKpi(resolveLaneKpiVisibility([{ utilization: 0.9 }]))).toBe(true)
  })
})

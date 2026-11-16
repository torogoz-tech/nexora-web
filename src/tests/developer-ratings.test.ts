import { describe, expect, it } from 'vitest'
import { parseDeveloperRatings } from '../utils/parseDeveloperRatings'
describe('developer rating history', () => {
  const report = { actor_id: 'developer', year: 2026, annual: 0, can_rate: false, daily: [{ date: '2026-11-06', score: 0, push: false, excluded: false, entries: [{ id: 'activity', source: 'activity', score: 0, reason: 'No push', created_by: null, project_id: null, created_at: '2026-11-07T00:00:00Z' }] }], weekly: [{ period: '2026-W45', score: 0 }], monthly: [{ period: '2026-11', score: 0 }] }
  it('preserves zero, distinct from missing or excluded scores', () => {
    const result = parseDeveloperRatings(report)
    expect(result.annual).toBe(0)
    expect(result.daily[0]?.score).toBe(0)
    expect(parseDeveloperRatings({ ...report, annual: null, daily: [{ ...report.daily[0], excluded: true, score: null }] }).daily[0]?.score).toBeNull()
  })
  it('rejects invalid scales and contradictory excluded-day averages', () => {
    expect(() => parseDeveloperRatings({ ...report, annual: 5.01 })).toThrow()
    expect(() => parseDeveloperRatings({ ...report, annual: -1 })).toThrow()
    expect(() => parseDeveloperRatings({ ...report, daily: [{ ...report.daily[0], excluded: true }] })).toThrow()
  })
  it('rejects impossible and duplicate dates', () => {
    expect(() => parseDeveloperRatings({ ...report, daily: [{ ...report.daily[0], date: '2026-02-30' }] })).toThrow()
    expect(() => parseDeveloperRatings({ ...report, daily: [report.daily[0], report.daily[0]] })).toThrow()
  })
  it('never turns an unsafe evidence URL into a navigable link', () => {
    const day = report.daily[0]!
    const entry = { ...day.entries[0], evidence_url: 'javascript:alert(1)' }
    expect(parseDeveloperRatings({ ...report, daily: [{ ...day, entries: [entry] }] }).daily[0]?.entries[0]?.evidence_url).toBeNull()
  })
})

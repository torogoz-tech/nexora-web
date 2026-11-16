import { describe, expect, it } from 'vitest'
import { Wrench, Bug } from 'lucide-react'
import { getTaskTypeIcon } from '../src/utils/getTaskTypeIcon'
import { parseTaskTypeIcon } from '../src/utils/parseTaskTypeIcon'
import { parseCatalogTaskTypePage } from '../src/utils/parseCatalogTaskTypePage'
describe('configured task type icons', () => {
  it('uses the persisted icon instead of inferring it from the code', () => {
    expect(getTaskTypeIcon('bug', 'wrench')).toBe(Wrench)
    expect(getTaskTypeIcon('custom', 'bug')).toBe(Bug)
  })
  it('keeps legacy responses readable and rejects arbitrary icon names', () => {
    expect(parseTaskTypeIcon(undefined)).toBeUndefined()
    expect(getTaskTypeIcon('bug')).toBe(Bug)
    expect(() => parseTaskTypeIcon('arbitrary-svg')).toThrow()
  })
  it('retains the icon from the catalog response', () => {
    const page = parseCatalogTaskTypePage({
      items: [
        {
          code: 'custom',
          name: 'Prueba',
          description: null,
          color: null,
          archived: false,
          revision: 1,
          icon: 'flask-conical',
        },
      ],
    })
    expect(page.items[0].icon).toBe('flask-conical')
  })
})

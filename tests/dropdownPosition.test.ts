import { expect, it } from 'vitest'
import { getDropdownPosition } from '../src/utils/getDropdownPosition'
it('opens upwards when a modal control is close to the bottom of the screen', () => {
  const position = getDropdownPosition(
    { left: 200, top: 700, bottom: 732, width: 220 },
    1000,
    760,
    200,
  )
  expect(position.top).toBeLessThan(700)
  expect(position.top + 200).toBeLessThanOrEqual(700)
})
it('keeps a dropdown inside a narrow viewport even at its right edge', () => {
  const position = getDropdownPosition(
    { left: 300, top: 100, bottom: 132, width: 320 },
    390,
    844,
    500,
  )
  expect(position.left).toBeGreaterThanOrEqual(8)
  expect(position.left + position.width).toBeLessThanOrEqual(382)
  expect(position.maxHeight).toBeLessThanOrEqual(280)
})

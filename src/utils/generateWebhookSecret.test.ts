import { afterEach, expect, it, vi } from 'vitest'
import { generateWebhookSecret } from './generateWebhookSecret'
afterEach(() => vi.unstubAllGlobals())
it('uses 32 cryptographically random bytes and encodes every byte without truncation', () => {
  const getRandomValues = vi.fn((bytes: Uint8Array) => {
    expect(bytes).toHaveLength(32)
    bytes.set(Array.from({ length: 32 }, (_, index) => index))
    return bytes
  })
  vi.stubGlobal('crypto', { getRandomValues })
  expect(generateWebhookSecret()).toBe('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f')
  expect(getRandomValues).toHaveBeenCalledOnce()
  expect(getRandomValues.mock.calls[0][0].every(value => value === 0)).toBe(true)
})
it('never falls back to predictable randomness when secure randomness fails', () => {
  vi.stubGlobal('crypto', { getRandomValues: () => { throw Error('unavailable') } })
  expect(generateWebhookSecret).toThrow('unavailable')
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DebouncedFieldSave } from './DebouncedFieldSave'
const create = (
  commit: (value: string) => Promise<boolean> = async () => true,
) => {
  const callbacks = {
    onCommit: vi.fn(commit),
    onSaved: vi.fn(),
    onSaving: vi.fn(),
    onError: vi.fn(),
    shouldSave: () => true,
    isValid: () => true,
  }
  return { field: new DebouncedFieldSave(callbacks), ...callbacks }
}
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())
describe('debounced settings saves', () => {
  it('saves only the latest text after 800ms without typing', async () => {
    const test = create()
    test.field.edit('a')
    await vi.advanceTimersByTimeAsync(600)
    test.field.edit('ab')
    await vi.advanceTimersByTimeAsync(799)
    expect(test.onCommit).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(test.onCommit).toHaveBeenCalledExactlyOnceWith('ab')
    expect(test.onSaved).toHaveBeenCalledWith('ab')
    test.field.dispose()
  })
  it('does not save unfinished IME composition', async () => {
    const test = create()
    test.field.setComposing(true)
    test.field.edit('日')
    await vi.advanceTimersByTimeAsync(2000)
    test.field.flush()
    expect(test.onCommit).not.toHaveBeenCalled()
    test.field.edit('日本')
    test.field.setComposing(false)
    await vi.advanceTimersByTimeAsync(800)
    expect(test.onCommit).toHaveBeenCalledExactlyOnceWith('日本')
    test.field.dispose()
  })
  it('retains new typing while an earlier request is in flight', async () => {
    let finish: ((saved: boolean) => void) | undefined
    const commit = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            finish = resolve
          }),
      )
      .mockResolvedValue(true)
    const test = create(commit)
    test.field.edit('first')
    await vi.advanceTimersByTimeAsync(800)
    test.field.edit('second')
    await vi.advanceTimersByTimeAsync(1000)
    expect(commit).toHaveBeenCalledTimes(1)
    finish!(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(commit.mock.calls.map((call) => call[0])).toEqual([
      'first',
      'second',
    ])
    expect(test.onSaved).not.toHaveBeenCalledWith('first')
    expect(test.onSaved).toHaveBeenCalledWith('second')
    test.field.dispose()
  })
  it('waits for another service update to finish without losing the edit', async () => {
    const test = create()
    test.field.setPaused(true)
    test.field.edit('waiting')
    await vi.advanceTimersByTimeAsync(2000)
    expect(test.onCommit).not.toHaveBeenCalled()
    test.field.setPaused(false)
    await vi.advanceTimersByTimeAsync(0)
    expect(test.onCommit).toHaveBeenCalledExactlyOnceWith('waiting')
    test.field.dispose()
  })
  it('flushes on blur and never repeatedly retries a rejected value', async () => {
    const test = create(async () => false)
    test.field.edit('rejected')
    test.field.flush()
    await vi.advanceTimersByTimeAsync(0)
    expect(test.onCommit).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(30000)
    expect(test.onCommit).toHaveBeenCalledTimes(1)
    test.field.flush()
    await vi.advanceTimersByTimeAsync(0)
    expect(test.onCommit).toHaveBeenCalledTimes(2)
    test.field.dispose()
  })
  it('cancels pending saves and callbacks on disposal', async () => {
    const test = create()
    test.field.edit('discarded')
    test.field.dispose()
    await vi.advanceTimersByTimeAsync(1000)
    expect(test.onCommit).not.toHaveBeenCalled()
    let finish: ((saved: boolean) => void) | undefined
    const active = create(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    active.field.edit('in flight')
    await vi.advanceTimersByTimeAsync(800)
    active.field.dispose()
    finish!(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(active.onSaved).not.toHaveBeenCalled()
  })
  it('keeps explicit save behavior available outside General', async () => {
    const callbacks = create(),
      manual = new DebouncedFieldSave(callbacks, null)
    manual.edit('manual')
    await vi.advanceTimersByTimeAsync(3000)
    expect(callbacks.onCommit).not.toHaveBeenCalled()
    manual.flush()
    await vi.advanceTimersByTimeAsync(0)
    expect(callbacks.onCommit).toHaveBeenCalledExactlyOnceWith('manual')
    manual.dispose()
    callbacks.field.dispose()
  })
})

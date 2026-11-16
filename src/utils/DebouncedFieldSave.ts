import type { DebouncedFieldSaveOptions } from '../types/DebouncedFieldSaveOptions'
/** One debounced field, with serialized writes and a retained latest edit. */
export class DebouncedFieldSave {
  private timer: ReturnType<typeof setTimeout> | undefined
  private pending: { value: string; version: number; due: number } | null = null
  private failed: { value: string; version: number; due: number } | null = null
  private version = 0
  private active = false
  private paused = false
  private composing = false
  private disposed = false
  private options: DebouncedFieldSaveOptions
  private delay: number | null
  constructor(options: DebouncedFieldSaveOptions, delay: number | null = 800) {
    this.options = options
    this.delay = delay
  }
  edit(value: string) {
    if (this.disposed) return
    this.pending = {
      value,
      version: ++this.version,
      due: this.delay === null ? Infinity : Date.now() + this.delay,
    }
    this.failed = null
    this.arm()
  }
  setPaused(value: boolean) {
    this.paused = value
    this.arm()
  }
  setComposing(value: boolean) {
    this.composing = value
    if (!value && this.pending && this.delay !== null)
      this.pending.due = Date.now() + this.delay
    this.arm()
  }
  flush() {
    if (this.disposed || this.composing) return
    if (!this.pending && this.failed) this.pending = this.failed
    this.failed = null
    if (this.pending) this.pending.due = Date.now()
    clearTimeout(this.timer)
    if (!this.paused && !this.active) void this.run()
    else this.arm()
  }
  dispose() {
    this.disposed = true
    clearTimeout(this.timer)
    this.pending = null
    this.failed = null
  }
  private arm() {
    clearTimeout(this.timer)
    if (
      this.disposed ||
      this.active ||
      this.paused ||
      this.composing ||
      !this.pending ||
      !Number.isFinite(this.pending.due)
    )
      return
    this.timer = setTimeout(
      () => void this.run(),
      Math.max(0, this.pending.due - Date.now()),
    )
  }
  private async run() {
    if (
      this.disposed ||
      this.active ||
      this.paused ||
      this.composing ||
      !this.pending
    )
      return
    const submitted = this.pending
    this.pending = null
    if (!this.options.shouldSave(submitted.value)) return
    if (!this.options.isValid()) {
      this.options.onInvalid?.()
      return
    }
    this.active = true
    this.options.onSaving(true)
    let saved = false
    try {
      saved = await this.options.onCommit(submitted.value)
    } catch (error) {
      if (!this.disposed) this.options.onError(error)
    } finally {
      this.active = false
      if (!this.disposed) {
        this.options.onSaving(false)
        if (saved && this.version === submitted.version)
          this.options.onSaved(submitted.value)
        if (!saved && this.version === submitted.version)
          this.failed = submitted
        this.arm()
      }
    }
  }
}

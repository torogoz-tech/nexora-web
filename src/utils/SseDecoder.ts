/** Incremental UTF-8 SSE framing, including CRLF, comments and multiline data. */
export class SseDecoder {
  private decoder = new TextDecoder()
  private buffer = ''
  feed(chunk: Uint8Array): { event: string; data: string }[] {
    this.buffer += this.decoder.decode(chunk, { stream: true })
    const events: { event: string; data: string }[] = []
    let end: number
    while ((end = this.buffer.search(/\r\n\r\n|\n\n|\r\r/)) >= 0) {
      const frame = this.buffer.slice(0, end)
      const separator = this.buffer
        .slice(end)
        .match(/^(\r\n\r\n|\n\n|\r\r)/)![0]
      this.buffer = this.buffer.slice(end + separator.length)
      let event = 'message'
      const data: string[] = []
      for (const line of frame.split(/\r\n|\n|\r/)) {
        if (line.startsWith(':')) continue
        const colon = line.indexOf(':')
        const field = colon < 0 ? line : line.slice(0, colon)
        const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '')
        if (field === 'event') event = value
        else if (field === 'data') data.push(value)
      }
      if (data.length) events.push({ event, data: data.join('\n') })
    }
    if (this.buffer.length > 65536) throw Error('SSE frame too large')
    return events
  }
}

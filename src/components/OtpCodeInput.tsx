import { useRef } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import type { OtpCodeInputProps } from '../types/OtpCodeInputProps'

export default function OtpCodeInput({ value, onChange, disabled, invalid }: OtpCodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const { language } = useTranslation()
  const en = language === 'en'
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')
  function focus(index: number) { refs.current[Math.max(0, Math.min(5, index))]?.focus() }
  function insert(raw: string, index: number) {
    const numbers = raw.replace(/\D/g, '').slice(0, 6)
    if (raw && !numbers) return
    const start = numbers.length === 6 ? 0 : index
    const next = [...digits]
    if (!numbers) next[index] = ' '
    else numbers.split('').forEach((digit, offset) => { if (start + offset < 6) next[start + offset] = digit })
    onChange(next.join('').trimEnd())
    if (numbers) focus(start + numbers.length)
  }
  return <div role="group" aria-label={en ? 'Six-digit verification code' : 'Código de verificación de seis dígitos'} className="grid grid-cols-6 gap-2">
    {digits.map((digit, index) => <input
      key={index}
      ref={element => { refs.current[index] = element }}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      autoFocus={index === 0}
      spellCheck={false}
      maxLength={6}
      aria-label={en ? `Digit ${index + 1} of 6` : `Dígito ${index + 1} de 6`}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      className="input h-12 w-full min-w-0 px-0 text-center font-mono text-xl"
      value={digit.trim()}
      onFocus={event => event.currentTarget.select()}
      onChange={event => insert(event.target.value, index)}
      onPaste={event => { event.preventDefault(); insert(event.clipboardData.getData('text'), index) }}
      onKeyDown={event => {
        if (event.key === 'Backspace') {
          event.preventDefault()
          const next = [...digits]; next[index] = ' '
          onChange(next.join('').trimEnd()); focus(index - 1)
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); focus(index + (event.key === 'ArrowLeft' ? -1 : 1))
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault(); focus(event.key === 'Home' ? 0 : 5)
        }
      }}
    />)}
  </div>
}

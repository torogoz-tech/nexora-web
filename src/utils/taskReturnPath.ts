export function taskReturnPath(value: string | null | undefined) {
  if (!value || value.length > 4096 || value.includes('\\') || !/^\/(?:tasks|boards|profile)(?:\/|\?|$)/.test(value)) return '/tasks'
  const url = new URL(value, 'https://nexora.invalid')
  return url.origin === 'https://nexora.invalid' && /^\/(?:tasks|boards|profile)(?:\/|$)/.test(url.pathname) ? `${url.pathname}${url.search}${url.hash}` : '/tasks'
}

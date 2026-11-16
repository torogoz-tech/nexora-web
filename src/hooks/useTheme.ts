import { useEffect, useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.theme !== 'corporate')
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(document.documentElement.dataset.theme !== 'corporate'))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'corporate' ? 'black' : 'corporate'
    document.documentElement.dataset.theme = theme
    setIsDark(theme === 'black')
    try { localStorage.setItem('nexora-theme', theme) } catch { /* Theme works without storage. */ }
  }
  return { isDark, toggleTheme }
}

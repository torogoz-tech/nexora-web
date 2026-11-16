import { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
export default function MarkdownDiagram({ code }: { code: string }) {
  const { t } = useTranslation()
  const [result, setResult] = useState<{
    code: string
    html: string
    height: number
  } | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const container = document.createElement('div')
    container.style.cssText =
      'position:fixed;left:-10000px;top:0;width:1000px;visibility:hidden;pointer-events:none'
    document.body.append(container)
    void import('mermaid')
      .then(async ({ default: mermaid }) => {
        if (cancelled) return
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          htmlLabels: false,
          suppressErrorRendering: true,
          theme: 'neutral',
          maxTextSize: 50000,
          maxEdges: 500,
          secure: [
            'securityLevel',
            'startOnLoad',
            'maxTextSize',
            'maxEdges',
            'htmlLabels',
            'themeCSS',
            'dompurifyConfig',
            'suppressErrorRendering',
          ],
        })
        const { svg } = await mermaid.render(
          `diagram-${crypto.randomUUID()}`,
          code,
          container,
        )
        if (cancelled) return
        const documentSvg = new DOMParser().parseFromString(
          svg,
          'image/svg+xml',
        ).documentElement
        const box = documentSvg
          .getAttribute('viewBox')
          ?.split(/[ ,]+/)
          .map(Number)
        const height =
          box?.length === 4 && box[2] > 0
            ? Math.min(560, Math.max(180, (box[3] / box[2]) * 800 + 24))
            : 320
        const html = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><style>body{margin:0;padding:8px;background:white}svg{display:block;max-width:100%;height:auto;margin:auto}</style></head><body>${svg}</body></html>`
        setResult({ code, html, height })
      })
      .catch(() => {
        if (!cancelled) setFailed(code)
      })
      .finally(() => container.remove())
    return () => {
      cancelled = true
      container.remove()
    }
  }, [code])
  if (failed === code)
    return (
      <p role="alert" className="my-4 text-sm text-error">
        {t('No se pudo dibujar el diagrama. Revisa su sintaxis Mermaid.')}
      </p>
    )
  return result?.code === code ? (
    <iframe
      sandbox=""
      title={t('Diagrama')}
      srcDoc={result.html}
      className="my-4 w-full rounded-xl border border-base-300 bg-white"
      style={{ height: result.height }}
    />
  ) : (
    <p role="status" className="my-4 text-sm text-base-content/50">
      {t('Preparando diagrama…')}
    </p>
  )
}

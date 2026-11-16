import RequestAttachmentImage from './RequestAttachmentImage'
import TaskEvidenceImage from './TaskEvidenceImage'
import { lazy, memo, Suspense } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { WikiMarkdownProps } from '../types/WikiMarkdownProps'
const MarkdownDiagram = lazy(() => import('./MarkdownDiagram'))
const MonacoCodeViewer = lazy(() => import('./MonacoCodeViewer'))
function WikiMarkdown({ text, idPrefix, allowImages = false }: WikiMarkdownProps) {
  return (
    <div className="wiki-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        disallowedElements={allowImages ? [] : ['img']}
        components={{
          pre: ({children}) => <div className="my-4">{children}</div>,
          code: ({children, className}) => {
            const source = String(children ?? '')
            if(className === 'language-mermaid')return <Suspense fallback={<p>…</p>}><MarkdownDiagram code={source.trimEnd()}/></Suspense>
            return source.endsWith('\n') ? <Suspense fallback={<pre className="overflow-auto rounded-xl p-4">{source}</pre>}><MonacoCodeViewer code={source.trimEnd()} language={className?.replace('language-','') ?? 'plaintext'}/></Suspense> : <code>{children}</code>
          },
          img: ({src, alt}) => typeof src === 'string' && /^\/api\/v1\/requests\/srq_[A-Za-z0-9_]+\/attachments\/sra_[A-Za-z0-9_]+$/.test(src) ? <RequestAttachmentImage src={src} alt={alt??''}/> : typeof src === 'string' && /^\/api\/v1\/(?:knowledge\/images\/kim_|task-evidence\/tev_|rating-evidence\/rev_|stickers\/stk_)[a-zA-Z0-9_]+\/content$/.test(src) ? <TaskEvidenceImage src={src} alt={alt ?? ''} compact={src.startsWith('/api/v1/stickers/')}/> : typeof src === 'string' && /^https?:\/\//i.test(src) ? <img src={src} alt={alt ?? ''} loading="lazy" referrerPolicy="no-referrer" className="my-4 max-h-[32rem] max-w-full rounded-xl object-contain"/> : null,
          h1: ({ children, node }) => (
            <h3
              id={
                idPrefix
                  ? `${idPrefix}-line-${node?.position?.start.line}`
                  : undefined
              }
            >
              {children}
            </h3>
          ),
          h2: ({ children, node }) => (
            <h3
              id={
                idPrefix
                  ? `${idPrefix}-line-${node?.position?.start.line}`
                  : undefined
              }
            >
              {children}
            </h3>
          ),
          h3: ({ children, node }) => (
            <h4
              id={
                idPrefix
                  ? `${idPrefix}-line-${node?.position?.start.line}`
                  : undefined
              }
            >
              {children}
            </h4>
          ),
          a: ({ children, href }) =>
            href ? (
              <a href={href} rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}

export default memo(WikiMarkdown)

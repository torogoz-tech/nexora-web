import { useTranslation } from '../hooks/useTranslation'
import WikiMarkdown from './WikiMarkdown'
import { toMarkdownList } from '../utils/toMarkdownList'
import WikiArticleOutline from './WikiArticleOutline'
import type { WikiArticleProps } from '../types/WikiArticleProps'
export default function WikiArticle({
  title,
  category,
  sections,
  metadata,
  notices = [],
  children,
  toolbar,
}: WikiArticleProps) {
  const { t } = useTranslation()
  return (
    <article aria-labelledby="wiki-title" className="wiki-article min-w-0">
      <div className="grid min-w-0 items-start gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">

        <details className="sticky top-0 z-10 bg-base-100 p-3 md:hidden">
          <summary className="cursor-pointer text-xs font-semibold">
            {' '}
            {t('Contenido y detalles')}{' '}
          </summary>
          <div className="mt-4">
            <WikiArticleOutline sections={sections} metadata={metadata} />
          </div>
        </details>
        <aside className="hidden min-w-0 border-r border-base-300 pr-5 py-2 md:sticky md:top-6 md:block md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto">
          <p className="mb-4 text-xs font-semibold">{t('Contenido')}</p>
          <WikiArticleOutline sections={sections} metadata={metadata} />
        </aside>
        <div className="min-w-0">
      <header className="mb-7 border-b border-base-300 pb-5">
        {toolbar && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{toolbar}</div>}
        <p className="mb-2 text-xs text-base-content/45">{category}</p>
        <h1
          id="wiki-title"
          tabIndex={-1}
          className="break-words font-serif text-3xl leading-tight text-base-content outline-none sm:text-4xl"
        >
          {title}
        </h1>
      </header>
      {notices.map((notice) => (
        <p
          key={t(notice)}
          role="status"
          className="mb-4 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 text-sm leading-relaxed text-base-content/70"
        >
          {t(notice)}
        </p>
      ))}
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mb-8 scroll-mt-6"
            >
              <h2 className="mb-4 border-b border-base-300 pb-2 font-serif text-xl text-base-content">
                {t(section.title)}
              </h2>
              {section.text && (
                <WikiMarkdown allowImages text={section.text} idPrefix={section.id} />
              )}
              {section.items && <WikiMarkdown allowImages text={toMarkdownList(section.items)} />}
            </section>
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-base-content/50">
              {' '}
              {t('Este artículo todavía no tiene contenido.')}{' '}
            </p>
          )}
          {children}
        </div>
      </div>
    </article>
  )
}

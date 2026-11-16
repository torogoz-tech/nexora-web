import { useTranslation } from '../hooks/useTranslation'
import { getWikiHeadings } from '../utils/getWikiHeadings'
import type { WikiOutlineProps } from '../types/WikiOutlineProps'
export default function WikiArticleOutline({
  sections,
  metadata,
}: WikiOutlineProps) {
  const { t } = useTranslation()
  return (
    <>
      <nav
        aria-label={t('Contenido del artículo')}
        className="flex flex-col gap-3"
      >
        {sections.map((section, index) => (
          <div key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-xs leading-relaxed text-base-content/65 hover:text-base-content"
            >
              <span className="mr-2 text-base-content/35">{index + 1}</span>
              {t(section.title)}
            </a>
            {section.text && (
              <div className="mt-2 flex flex-col gap-2 border-l border-base-300 pl-3">
                {getWikiHeadings(section.text, section.id).map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className="text-xs leading-relaxed text-base-content/45 hover:text-base-content"
                  >
                    {heading.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <dl className="mt-5 space-y-3 border-t border-base-300 pt-4 text-xs">
        {metadata
          .filter((item) => item.value)
          .map((item) => (
            <div key={item.label}>
              <dt className="text-base-content/40">{t(item.label)}</dt>
              <dd className="mt-1 break-words leading-relaxed text-base-content/75">
                {item.value}
              </dd>
            </div>
          ))}
      </dl>
    </>
  )
}

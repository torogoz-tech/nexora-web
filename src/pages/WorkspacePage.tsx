import { useTranslation } from '../hooks/useTranslation'
import RowAction from '../components/RowAction'
import { ChevronLeft } from 'lucide-react'
import type { WorkspacePageProps } from '../types/WorkspacePageProps'

export default function WorkspacePage({ section }: WorkspacePageProps) {
  const { t } = useTranslation()
  const Icon = section.icon
  return (
    <section className="flex flex-1 flex-col" aria-labelledby="section-title">
      <h1 id="section-title" className="text-2xl font-semibold tracking-tight">
        {t(section.label)}
      </h1>
      <p className="mt-2 text-sm text-base-content/55">
        {t(section.description)}
      </p>
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="max-w-sm text-center">
          <Icon
            size={30}
            strokeWidth={1.5}
            className="mx-auto mb-5 text-base-content/35"
            aria-hidden="true"
          />
          <h2 className="font-medium">
            {' '}
            {t('Un lugar para')} {t(section.label).toLocaleLowerCase()}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-base-content/50">
            {' '}
            {t(
              'La estructura de esta sección está preparada. Su contenido se conectará a Nexora en la siguiente etapa.',
            )}{' '}
          </p>
          <RowAction to="/settings/projects" label={t('Volver a proyectos')}>
            <ChevronLeft size={16} aria-hidden="true" />
          </RowAction>
        </div>
      </div>
    </section>
  )
}

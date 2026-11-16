import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import IntegrationProviderCard from '../components/IntegrationProviderCard'
export default function IntegrationsPage() {
  const { t } = useTranslation()
  const [version, setVersion] = useState(0)
  return (
    <section aria-label={t('Integraciones Git')} className="flex flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold">{t('Integraciones Git')}</h1>
        <IconButton
          type="button"
          variant="ghost"
          onClick={() => setVersion((v) => v + 1)}
          label={t('Actualizar integraciones')}
        >
          <RefreshCw size={15} />
        </IconButton>
      </div>
      <div className="grid gap-4">
        <IntegrationProviderCard key={`github-${version}`} provider="github" />
        <IntegrationProviderCard key={`gitlab-${version}`} provider="gitlab" />
      </div>
    </section>
  )
}

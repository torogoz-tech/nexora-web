import OidcSettings from '../components/OidcSettings'
import { useTranslation } from '../hooks/useTranslation'

export default function OidcPage() {
  const { t } = useTranslation()

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h1 className="mb-7 text-xl font-semibold">{t('Acceso corporativo')}</h1>
      <OidcSettings />
    </section>
  )
}

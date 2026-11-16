import { useTranslation } from '../hooks/useTranslation'
import IntegrationDialog from './IntegrationDialog'
import AccountProviderConnector from './AccountProviderConnector'
import type { ConnectAccountModalProps } from '../types/ConnectAccountModalProps'
export default function ConnectAccountModal({
  onClose,
  onConnected,
}: ConnectAccountModalProps) {
  const { t } = useTranslation()
  return (
    <IntegrationDialog title={t('Conectar cuenta')} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <AccountProviderConnector provider="github" onConnected={onConnected} />
        <AccountProviderConnector provider="gitlab" onConnected={onConnected} />
      </div>
    </IntegrationDialog>
  )
}

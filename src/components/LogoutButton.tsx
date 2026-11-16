import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
export default function LogoutButton() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  return (
    <IconButton
      type="button"
      variant="ghost"
      onClick={() => void logout()}
      label={t('Cerrar sesión')}
    >
      <LogOut size={19} aria-hidden="true" />
    </IconButton>
  )
}

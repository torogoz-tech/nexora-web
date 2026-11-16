import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { useTheme } from '../hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const Icon = isDark ? Sun : Moon

  return (
    <IconButton
      type="button"
      variant="ghost"
      onClick={toggleTheme}
      label={isDark ? t('Activar tema claro') : t('Activar tema oscuro')}
    >
      <Icon size={19} aria-hidden="true" />
    </IconButton>
  )
}

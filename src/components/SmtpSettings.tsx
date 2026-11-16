import { UsersRound } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import ServiceSettingsEditor from './ServiceSettingsEditor'
import SmtpTest from './SmtpTest'
import SettingsRow from './SettingsRow'
import RowAction from './RowAction'
export default function SmtpSettings() {
  const { t } = useTranslation()
  return (
    <ServiceSettingsEditor
      kind="smtp"
      title="Correo electrónico"
      description="Configura SMTP para las asignaciones de tareas y solicitudes de aprobación. Se requiere TLS o STARTTLS. Al cambiar el servidor o el usuario, introduce de nuevo la contraseña."
      fields={[
        { key: 'host', label: 'Servidor SMTP' },
        { key: 'port', label: 'Puerto' },
        { key: 'username', label: 'Usuario SMTP' },
        { key: 'sender_email', label: 'Correo del remitente', type: 'email' },
        { key: 'sender_name', label: 'Nombre del remitente' },
      ]}
    >
      <SettingsRow
        label={t('Comprobar entrega')}
        description={t(
          'Envía un correo de prueba antes de activar las notificaciones.',
        )}
      >
        <div className="flex justify-end">
          <SmtpTest />
        </div>
      </SettingsRow>
      <SettingsRow
        label={t('Destinatarios y preferencias')}
        description={t(
          'Configura el correo de cada miembro y los eventos que desea recibir.',
        )}
      >
        <div className="flex justify-end">
          <RowAction
            to="/settings/notifications"
            label={t('Configurar destinatarios')}
          >
            <UsersRound size={16} />
          </RowAction>
        </div>
      </SettingsRow>
    </ServiceSettingsEditor>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import { readApiJson } from '../services/readApiJson'
import IconButton from './IconButton'
import TextButton from './TextButton'
export default function SmtpTest() {
  const { t } = useTranslation(),
    dialog = useRef<HTMLDialogElement>(null),
    mutation = useIntegrationMutation()
  const [email, setEmail] = useState(''),
    [job, setJob] = useState<{ id: string; status: string } | null>(null)
  useEffect(() => {
    if (!job || !['pending', 'delivering'].includes(job.status)) return
    const controller = new AbortController()
    const timer = setInterval(() => {
      void readApiJson(
        `/api/v1/settings/smtp/tests/${encodeURIComponent(job.id)}`,
        controller.signal,
      )
        .then((value) => {
          const next = value as { id: string; status: string }
          if (
            !controller.signal.aborted &&
            next.id === job.id &&
            ['pending', 'delivering', 'sent', 'skipped', 'failed'].includes(
              next.status,
            )
          )
            setJob(next)
        })
        .catch(() => {})
    }, 2500)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [job])
  return (
    <>
      <IconButton
        label={t('Enviar correo de prueba')}
        onClick={() => dialog.current?.showModal()}
      >
        <Mail size={16} />
      </IconButton>
      <dialog ref={dialog} className="modal" aria-labelledby="smtp-test-title">
        <div className="modal-box max-w-md">
          <header className="mb-5 flex items-center justify-between">
            <h2 id="smtp-test-title" className="font-semibold">
              {t('Enviar correo de prueba')}
            </h2>
            <IconButton
              label={t('Cerrar')}
              onClick={() => dialog.current?.close()}
            >
              <X size={18} />
            </IconButton>
          </header>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void mutation.run({ email }, async (signal, key) => {
                const value = (await writeGeneralSettings(
                  '/api/v1/settings/smtp/tests',
                  'POST',
                  { recipient: email },
                  signal,
                  key,
                )) as { id: string; status: string }
                if (typeof value.id !== 'string' || value.status !== 'pending')
                  throw Error('La configuración recibida no es válida.')
                setJob(value)
              })
            }}
          >
            <label className="flex flex-col gap-2 text-sm">
              {t('Correo del destinatario')}
              <input
                className="input w-full"
                type="email"
                required
                maxLength={320}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={mutation.busy}
              />
            </label>
            {mutation.error && (
              <p className="mt-4 text-sm text-error" role="alert">
                {t(mutation.error)}
              </p>
            )}
            {job && (
              <p className="mt-4 text-sm" role="status">
                {t(
                  job.status === 'sent'
                    ? 'Correo entregado al servidor SMTP.'
                    : job.status === 'failed' || job.status === 'skipped'
                      ? 'No pudimos entregar el correo de prueba. Revisa SMTP.'
                      : 'Correo en cola. Comprobando la entrega…',
                )}
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <TextButton
                type="submit"
                variant="primary"
                disabled={
                  mutation.busy ||
                  (!!job && ['pending', 'delivering'].includes(job.status))
                }
                aria-busy={mutation.busy}
                label={t('Enviar prueba')}
              >
                <Mail size={16} />
              </TextButton>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label={t('Cerrar')}>{t('Cerrar')}</button>
        </form>
      </dialog>
    </>
  )
}

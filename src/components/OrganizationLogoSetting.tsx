import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useOrganizationSetting } from '../hooks/useOrganizationSetting'
import { prepareOrganizationLogo } from '../utils/prepareOrganizationLogo'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import type { OrganizationSettingProps } from '../types/OrganizationSettingProps'
export default function OrganizationLogoSetting(
  props: OrganizationSettingProps,
) {
  const { t } = useTranslation(),
    mutation = useOrganizationSetting(props),
    upload = useRef<HTMLInputElement>(null),
    options = useRef<HTMLDialogElement>(null),
    preparation = useRef<AbortController | null>(null)
  const [preparing, setPreparing] = useState(false),
    [imageError, setImageError] = useState<string | null>(null)
  useEffect(() => () => preparation.current?.abort(), [])
  const busy = preparing || mutation.busy,
    profile = props.profile
  async function select(file: File) {
    if (preparation.current || mutation.busy) return
    const controller = new AbortController()
    preparation.current = controller
    setPreparing(true)
    setImageError(null)
    try {
      const value = await prepareOrganizationLogo(file, controller.signal)
      controller.signal.throwIfAborted()
      await mutation.save({ field: 'logo', value })
    } catch (error) {
      if (!controller.signal.aborted)
        setImageError(
          error instanceof Error
            ? error.message
            : 'No pudimos preparar la imagen. Vuelve a intentarlo.',
        )
    } finally {
      preparation.current = null
      if (!controller.signal.aborted) setPreparing(false)
    }
  }
  return (
    <form
      aria-label={t('Logo de la organización')}
      onSubmit={(event) => event.preventDefault()}
    >
      <SettingsRow
        label={t('Logo de la organización')}
        description={t(
          'PNG, JPEG o WebP de hasta 2 MB y 4096 píxeles por lado. Se adapta a 512 × 512 sin recortar ni deformar.',
        )}
      >
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            aria-label={t(profile.has_logo ? 'Cambiar logo' : 'Subir logo')}
            title={t(profile.has_logo ? 'Cambiar logo' : 'Subir logo')}
            disabled={busy}
            aria-busy={busy}
            onClick={() => profile.has_logo ? options.current?.showModal() : upload.current?.click()}
            className="group relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-200 hover:border-base-content/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait"
          >
            {profile.has_logo ? (
              <img
                src={`/api/v1/public/organization/logo?revision=${profile.revision}`}
                alt={profile.name}
                className="size-full object-contain p-3"
              />
            ) : (
              <ImagePlus size={24} className="text-base-content/35" />
            )}
            {busy && <span className="absolute inset-0 flex items-center justify-center bg-base-200/80"><span className="loading loading-spinner loading-sm" /></span>}
            {!busy && profile.has_logo && <span className="absolute inset-0 flex items-center justify-center bg-base-100/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><ImagePlus size={22} aria-hidden="true" /></span>}
          </button>
          <input
            ref={upload}
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            className="hidden"
            aria-label={t('Subir logo')}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void select(file)
              event.target.value = ''
            }}
          />

        </div>
        <SettingsSaveStatus busy={busy} error={imageError ?? mutation.error} />
      </SettingsRow>
      <dialog ref={options} className="modal" aria-labelledby="organization-logo-options-title">
        <div className="modal-box max-w-sm rounded-2xl border border-base-300 bg-base-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 id="organization-logo-options-title" className="font-semibold">{t('Logo de la organización')}</h2>
            <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={t('Cerrar')} onClick={() => options.current?.close()}><X size={18} aria-hidden="true" /></button>
          </div>
          <p className="mt-3 text-sm text-base-content/60">{t('¿Qué quieres hacer con el logo actual?')}</p>
          <div className="mt-5 flex flex-col gap-2">
            <button type="button" className="btn justify-start" onClick={() => { options.current?.close(); upload.current?.click() }}>
              <ImagePlus size={18} aria-hidden="true" />{t('Reemplazar logo')}
            </button>
            <button type="button" className="btn btn-ghost justify-start text-error" onClick={() => {
              options.current?.close()
              setImageError(null)
              void mutation.save({ field: 'logo', value: null })
            }}><Trash2 size={18} aria-hidden="true" />{t('Eliminar logo')}</button>
          </div>
        </div>
        <button type="button" className="modal-backdrop" aria-label={t('Cerrar')} onClick={() => options.current?.close()} />
      </dialog>
    </form>
  )
}

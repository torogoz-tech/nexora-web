import { useEffect, useRef, useState } from 'react'
import { FileUp, Upload, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { readAnalysisProfileFile } from '../services/readAnalysisProfileFile'
import { importAnalysisProfile } from '../services/importAnalysisProfile'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
import type { AnalysisProfilePackage } from '../types/AnalysisProfilePackage'
import type { ImportAnalysisProfileModalProps } from '../types/ImportAnalysisProfileModalProps'
export default function ImportAnalysisProfileModal({ onClose, onImported }: ImportAnalysisProfileModalProps) {
 const { t } = useTranslation(), mutation = useIntegrationMutation(), generation = useRef(0)
 const [pack, setPack] = useState<AnalysisProfilePackage | null>(null), [reading, setReading] = useState(false), [error, setError] = useState<string | null>(null)
 useEffect(() => () => { generation.current += 1 }, [])
 return <IntegrationDialog title={t('Importar perfil de análisis')} onClose={onClose} busy={mutation.busy || reading}>
  <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (pack && !reading) void mutation.run(pack, async (signal, key) => { const result = await importAnalysisProfile(pack, key, signal); onImported(result.id) }) }}>
   <p className="text-sm leading-relaxed text-base-content/60">{t('Selecciona un paquete JSON de Nexora. Se validarán sus modelos y dependencias antes de guardarlo como una versión inmutable.')}</p>
   <label className="flex flex-col gap-2 text-sm"><span className="flex items-center gap-2"><FileUp size={16}/>{t('Paquete del perfil')}</span><input type="file" accept=".json,application/json" className="file-input w-full" disabled={mutation.busy || reading} onChange={event => { const file = event.target.files?.[0], current = ++generation.current; setPack(null); setError(null); mutation.clearError(); if (!file) return; setReading(true); void readAnalysisProfileFile(file).then(value => { if (generation.current === current) setPack(value) }).catch(failure => { if (generation.current === current) setError(failure instanceof Error ? failure.message : 'No pudimos leer el paquete seleccionado.') }).finally(() => { if (generation.current === current) setReading(false) }) }}/><span className="text-xs text-base-content/45">{t('Formato .nexora-profile.json, hasta 16 MiB.')}</span></label>
   {pack && <dl className="grid grid-cols-2 gap-4 text-sm"><div className="col-span-2"><dt className="text-xs text-base-content/45">{t('Perfil')}</dt><dd className="mt-1 break-words font-medium">{pack.name}</dd></div><div><dt className="text-xs text-base-content/45">{t('Versión')}</dt><dd className="mt-1">{pack.version}</dd></div><div><dt className="text-xs text-base-content/45">{t('Lenguaje principal')}</dt><dd className="mt-1 break-all">{pack.language_id}</dd></div><div><dt className="text-xs text-base-content/45">{t('Modelos incluidos')}</dt><dd className="mt-1">{pack.models.length}</dd></div></dl>}
   {(error || mutation.error) && <p role="alert" className="text-sm text-error">{t(error ?? mutation.error)}</p>}
   <footer className="flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy || reading} onClick={onClose}><X size={16}/></TextButton><TextButton type="submit" label={t(mutation.busy ? 'Validando e importando…' : 'Importar perfil')} variant="primary" disabled={!pack || reading || mutation.busy}><Upload size={16}/></TextButton></footer>
  </form>
 </IntegrationDialog>
}

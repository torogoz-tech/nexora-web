import {useTranslation} from '../hooks/useTranslation'
import Dropdown from './Dropdown'
import type {WorkflowState} from '../types/WorkflowState'
export default function WorkflowStatePolicyEditor({state,disabled,onChange}:{state:WorkflowState;disabled?:boolean;onChange:(patch:Partial<WorkflowState>)=>void}){
 const {t}=useTranslation()
 return <div className="space-y-4 border-t border-base-300 pt-4">
  <h3 className="text-sm font-medium">{t('Reglas del estado')}</h3>
  <label className="flex flex-col gap-2 text-xs">{t('Rama base del trabajo')}
   <Dropdown label={t('Rama base del trabajo')} value={state.required_base_branch??''} disabled={disabled} options={[{value:'',label:t('Sin restricción')},{value:'develop',label:'develop'},{value:'stage',label:'stage'},{value:'preprod',label:'preprod'},{value:'main',label:'main'}]} onChange={value=>onChange({required_base_branch:value||undefined})}/>
  </label>
  <p className="text-xs leading-relaxed text-base-content/50">{t('La rama de trabajo debe partir de esta base. Nexora comprobará las ramas publicadas; no creará develop ni stage automáticamente.')}</p>
  <label className="flex flex-col gap-2 text-xs">{t('Orden de avance')}
   <input type="text" inputMode="numeric" className="input input-sm w-full" value={state.progress_order??''} disabled={disabled} placeholder="0" onChange={e=>{const value=e.target.value;if(/^\d{0,5}$/.test(value))onChange({progress_order:value===''?undefined:Number(value)})}}/>
  </label>
  <label className="flex items-center justify-between gap-4 text-sm"><span>{t('Impedir retroceso desde este estado')}</span><input type="checkbox" className="toggle toggle-sm" checked={!!state.prevent_backtracking} disabled={disabled} onChange={e=>onChange({prevent_backtracking:e.target.checked})}/></label>
  <p className="text-xs leading-relaxed text-base-content/50">{t('Un número menor representa una etapa anterior. La posición del estado en el lienzo no afecta este orden.')}</p>
 </div>
}

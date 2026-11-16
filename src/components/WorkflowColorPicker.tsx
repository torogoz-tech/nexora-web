import { useState } from 'react'
import { Palette } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { WorkflowColorPickerProps } from '../types/WorkflowColorPickerProps'
import IconButton from './IconButton'
import IntegrationDialog from './IntegrationDialog'
import WorkflowStateColorPicker from './WorkflowStateColorPicker'
import TextButton from './TextButton'
export default function WorkflowColorPicker({value,disabled,onChange}:WorkflowColorPickerProps) {
  const {t}=useTranslation()
  const [open,setOpen]=useState(false)
  return <><IconButton label={t('Color del workflow')} disabled={disabled} onClick={()=>setOpen(true)}><Palette size={19} style={{color:value}}/></IconButton>
    {open&&<IntegrationDialog title={t('Color del workflow')} onClose={()=>setOpen(false)}><WorkflowStateColorPicker label="Color del workflow" value={value} onChange={onChange}/><div className="mt-5 flex justify-end"><TextButton label={t('Listo')} onClick={()=>setOpen(false)}/></div></IntegrationDialog>}
  </>
}

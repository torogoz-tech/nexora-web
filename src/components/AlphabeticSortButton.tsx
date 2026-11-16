import {ArrowDownAZ,ArrowUpZA} from 'lucide-react'
import {useTranslation} from '../hooks/useTranslation'
import IconButton from './IconButton'
export default function AlphabeticSortButton({descending,onChange}:{descending:boolean;onChange:(value:boolean)=>void}){
 const {t}=useTranslation()
 return <IconButton label={t(descending?'Ordenar de A a Z':'Ordenar de Z a A')} aria-pressed={descending} onClick={()=>onChange(!descending)}>{descending?<ArrowUpZA size={17}/>:<ArrowDownAZ size={17}/>}</IconButton>
}

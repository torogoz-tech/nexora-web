import {useTranslation} from '../hooks/useTranslation'
import type {ProfileProject} from '../types/ProfileProject'
export default function PeerRatingAction(_props:{actorId:string;projects:ProfileProject[];canRate:boolean}){
 const {t}=useTranslation()
 return <section><p className="text-sm text-base-content/55">{t('Las evaluaciones individuales son confidenciales.')}</p></section>
}

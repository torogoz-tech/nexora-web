import { parseWeeklyRating } from '../utils/parseWeeklyRating'
import { Star } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseDeveloperRatings } from '../utils/parseDeveloperRatings'
import { currentRatingWeek } from '../utils/currentRatingWeek'
import type { MemberWeeklyRatingProps } from '../types/MemberWeeklyRatingProps'
export default function MemberWeeklyRating({memberId,today,own=false}:MemberWeeklyRatingProps){
 const {t,dateLocale}=useTranslation(),year=Number(today.slice(0,4)),weekStart=currentRatingWeek(today,[]).start
 const current=useApiData(own?null:`/api/v1/members/${encodeURIComponent(memberId)}/ratings?year=${year}`,parseDeveloperRatings)
 const previous=useApiData(!own&&weekStart.slice(0,4)!==String(year)?`/api/v1/members/${encodeURIComponent(memberId)}/ratings?year=${year-1}`:null,parseDeveloperRatings)
 const personal=useApiData(own?'/api/v1/me/weekly-rating':null,parseWeeklyRating)
 const week=personal.data??currentRatingWeek(today,[...(previous.data?.daily??[]),...(current.data?.daily??[])])
 const error=personal.error??current.error??previous.error
 return <section aria-label={t('Calificación semanal')} className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Star size={15}/>{t('Calificación semanal')}</h2>{personal.loading||current.loading||previous.loading?<p className="text-xs text-base-content/45">{t('Cargando…')}</p>:error?<p role="alert" className="text-xs text-error">{t(error)}</p>:<><p className="text-2xl font-semibold">{week.score===null?t('Sin calificación'):`${week.score.toLocaleString(dateLocale,{maximumFractionDigits:2})} / 5`}</p><p className="mt-1 text-xs text-base-content/45">{new Date(`${week.start}T12:00:00Z`).toLocaleDateString(dateLocale,{timeZone:'UTC',month:'short',day:'numeric'})} — {new Date(`${week.end}T12:00:00Z`).toLocaleDateString(dateLocale,{timeZone:'UTC',month:'short',day:'numeric'})}</p></>}</section>
}

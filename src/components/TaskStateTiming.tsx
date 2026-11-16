import { useEffect, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
export default function TaskStateTiming({date}: {date?: string | null}) {
 const {t,dateLocale} = useTranslation(), [now,setNow] = useState(Date.now)
 useEffect(() => {const timer = window.setInterval(()=>setNow(Date.now()),60000); return()=>window.clearInterval(timer)},[])
 const stamp = date ? Date.parse(date):NaN
 if (!Number.isFinite(stamp)) return <><td>—</td><td>—</td></>
 const minutes = Math.max(0,Math.floor((now-stamp)/60000)), hours = Math.floor(minutes/60), days = Math.floor(hours/24)
 return <><td className="whitespace-nowrap text-xs text-base-content/60"><time dateTime={date!}>{new Intl.DateTimeFormat(dateLocale,{dateStyle:'medium',timeStyle:'short'}).format(stamp)}</time></td><td className="whitespace-nowrap text-xs tabular-nums text-base-content/60">{days ? `${days} ${t('días')} ${hours%24} h` : hours ? `${hours} h ${minutes%60} min` : `${minutes} min`}</td></>
}

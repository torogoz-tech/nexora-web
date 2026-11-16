import {useState} from 'react'
import {useTranslation} from './useTranslation'
export function useAlphabeticOrder(){
 const [descending,setDescending]=useState(false),{dateLocale}=useTranslation()
 const collator=new Intl.Collator(dateLocale,{numeric:true,sensitivity:'base'})
 return {descending,setDescending,compare:(left:string,right:string)=>collator.compare(left,right)*(descending?-1:1)}
}

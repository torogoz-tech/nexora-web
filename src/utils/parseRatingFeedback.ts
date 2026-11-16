import {requireRecord} from './requireRecord'
export function parseRatingFeedback(value:unknown){
 const data=requireRecord(value)
 if(data.report===null)return {report:null}
 const report=requireRecord(data.report)
 if(typeof report.summary!=='string'||!['strengths','improvements','actions'].every(key=>Array.isArray(report[key])&&(report[key] as unknown[]).every(v=>typeof v==='string')))throw Error('El registro de calificaciones no es válido.')
 return {report:{summary:report.summary,strengths:report.strengths as string[],improvements:report.improvements as string[],actions:report.actions as string[]}}
}

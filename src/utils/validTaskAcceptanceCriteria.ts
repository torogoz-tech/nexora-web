export function validTaskAcceptanceCriteria(criteria: string[]) {
 const lengths=criteria.map(value=>new TextEncoder().encode(value.trim()).length)
 return lengths.length<=100&&lengths.every(length=>length>0&&length<=4000)&&lengths.reduce((total,length)=>total+length,0)<=32000
}

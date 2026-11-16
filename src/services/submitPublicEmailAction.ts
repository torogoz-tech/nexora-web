export async function submitPublicEmailAction(path:string,input:unknown,signal:AbortSignal):Promise<unknown>{
  if(!['/api/v1/auth/invitations/inspect','/api/v1/auth/invitations/accept','/api/v1/auth/password/request','/api/v1/auth/password/complete'].includes(path))throw Error('invalid-email-action-path')
  const response=await fetch(path,{method:'POST',credentials:'omit',signal:AbortSignal.any([signal,AbortSignal.timeout(20000)]),headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(input)})
  if(response.status===409)throw Error('Ese usuario o correo ya está registrado. Revisa los datos o inicia sesión.')
  if(response.status===422){
    const problem=await response.json().catch(()=>null)
    if(String(problem?.title).includes('password must contain'))throw Error('La contraseña debe tener entre 12 y 1024 bytes.')
    if(String(problem?.title).includes('username')||String(problem?.title).includes('name contains')||String(problem?.title).includes('text empty'))throw Error('Revisa tu nombre y nombre de usuario.')
    throw Error('El enlace no es válido, venció o ya fue utilizado. Solicita uno nuevo.')
  }
  if(!response.ok)throw Error('No pudimos completar la solicitud. Vuelve a intentarlo.')
  return response.status===204||response.status===202?null:response.json()
}

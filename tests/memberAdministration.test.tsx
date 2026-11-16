// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import MemberEmail from '../src/components/MemberEmail'
import MemberArchiveAction from '../src/components/MemberArchiveAction'
import { parseOrganizationMembers } from '../src/utils/parseOrganizationMembers'
const mocks=vi.hoisted(()=>({request:vi.fn(),reload:vi.fn()}))
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'person'}})}))
vi.mock('../src/services/apiFetch',()=>({apiFetch:(...args:unknown[])=>mocks.request(...args)}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({data:{email:'old@example.com',suggested_email:'suggested@example.com',pending_email:null},reload:mocks.reload})}))
const member=parseOrganizationMembers([{id:'person',name:'Ana',username:'ana',email:'old@example.com',active:true,archived:false,lifecycle_revision:0}])[0]
beforeEach(()=>{mocks.request.mockReset();mocks.reload.mockReset();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')}})
afterEach(cleanup)
it('verifies an email code before completing a self-service email edit',async()=>{
 mocks.request.mockResolvedValueOnce(new Response(null,{status:202})).mockResolvedValueOnce(new Response(null,{status:204}))
 render(<dl><MemberEmail member={member}/></dl>)
 fireEvent.click(screen.getByRole('button',{name:'Editar correo'}))
 fireEvent.change(screen.getByRole('textbox',{name:'Correo electrónico'}),{target:{value:'new@example.com'}})
 fireEvent.click(screen.getByRole('button',{name:'Enviar código'}))
 await waitFor(()=>expect(mocks.request).toHaveBeenCalledTimes(1))
 await screen.findByRole('group',{name:'Código de verificación de seis dígitos'})
 expect(screen.queryByRole('textbox',{name:'Correo electrónico'})).toBeNull()
 expect(screen.getByRole('dialog',{name:'Verifica tu correo'})).toBeTruthy()
 fireEvent.change(screen.getAllByRole('textbox')[0],{target:{value:'123456'}})
 fireEvent.click(screen.getByRole('button',{name:'Verificar correo'}))
 await waitFor(()=>expect(mocks.request).toHaveBeenCalledTimes(2))
 expect(mocks.request.mock.calls[0][1].method).toBe('POST')
 expect(JSON.parse(mocks.request.mock.calls[0][1].body)).toEqual({email:'new@example.com'})
 expect(mocks.request.mock.calls[1][1].method).toBe('PUT')
 expect(JSON.parse(mocks.request.mock.calls[1][1].body)).toEqual({code:'123456'})
})
it('never offers email editing for somebody else',()=>{
 render(<dl><MemberEmail member={{...member,id:'other'}}/></dl>)
 expect(screen.queryByRole('button',{name:'Editar correo'})).toBeNull()
})
it('archives a member with the current revision after a clear confirmation',async()=>{
 const saved=vi.fn();mocks.request.mockResolvedValue(new Response('{}'))
 render(<MemberArchiveAction member={{...member,id:'other',lifecycle_revision:3}} onSaved={saved}/>)
 fireEvent.click(screen.getByRole('button',{name:'Archivar usuario'}))
 expect(screen.getByText(/Sus tareas, contribuciones e historial se conservarán/)).toBeTruthy()
 fireEvent.click(screen.getAllByRole('button',{name:'Archivar usuario'}).at(-1)!)
 await waitFor(()=>expect(saved).toHaveBeenCalledOnce())
 expect(JSON.parse(mocks.request.mock.calls[0][1].body)).toEqual({archived:true,expected_revision:3})
})
it('does not offer archiving the current user or bootstrap superadministrator',()=>{
 const view=render(<MemberArchiveAction member={member} onSaved={vi.fn()}/>)
 expect(screen.queryByRole('button')).toBeNull()
 view.rerender(<MemberArchiveAction member={{...member,id:'other',role:'super_admin'}} onSaved={vi.fn()}/>)
 expect(screen.queryByRole('button')).toBeNull()
})

// @vitest-environment jsdom
import ServiceRequestTypesPage from '../pages/ServiceRequestTypesPage'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import RequestTypeGlyph from '../components/RequestTypeGlyph'
import { describe,it,expect,vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { render,screen,fireEvent,cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import RequestSlaIndicator from '../components/RequestSlaIndicator'
import ServiceRequestTypeForm from '../components/ServiceRequestTypeForm'
import ServiceRequestReportsPage from '../pages/ServiceRequestReportsPage'
import { parseServiceRequestReport } from '../utils/parseServiceRequestReport'
import type { ServiceRequest } from '../types/ServiceRequest'
vi.mock('../hooks/useApiData',()=>({useApiData:(path:string)=>({loading:false,error:null,reload:()=>{},data:path.includes('/reports?')?{total:1,summary:{new:1,in_progress:0,completed:0,response_breached:0,resolution_breached:1,sla_count:1,response_average_minutes:null,resolution_average_minutes:null},products:[{product_id:'p1',name:'Portal',total:1,pending:1}],types:[],requesters:[],oldest_pending:[],items:[]}:path.endsWith('/products')?{items:[]}:{can_manage:true,items:[{id:'support',name:'Soporte',revision:1,archived:false,sla:{}}]}})}))
afterEach(cleanup)
describe('request SLA',()=>{
 it('displays the request clock, deadlines and compliance',()=>{
 const request={sla:{clock:'continuous',response_due_at:'2026-11-14T12:00:00Z',resolution_due_at:'2026-11-14T14:00:00Z',response_status:'met',resolution_status:'breached'}} as ServiceRequest
 const html=renderToStaticMarkup(<RequestSlaIndicator request={request}/>);expect(html).toContain('24/7');expect(html).toContain('Cumplido');expect(html).toContain('Vencido')
 })
 it('defaults critical to 24/7 and medium to working hours, with separate targets',()=>{
 render(<ServiceRequestTypeForm onSaved={()=>{}}/>)
 fireEvent.click(screen.getByRole('checkbox',{name:'Crítica'}));expect(screen.getByRole('combobox',{name:'Cómputo del tiempo · Crítica'}).textContent).toContain('24/7')
 fireEvent.click(screen.getByRole('checkbox',{name:'Media'}));expect(screen.getByRole('combobox',{name:'Cómputo del tiempo · Media'}).textContent).toContain('Horario laboral')
 expect(screen.getAllByRole('textbox').filter(input=>input.getAttribute('inputmode')==='numeric')).toHaveLength(4)
 })
 it('renders report filters and export actions outside technical administration',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><ServiceRequestReportsPage/></MemoryRouter>)
 for(const label of ['Desde','Hasta','Producto','Tipo de solicitud','Criticidad','Estado','Solicitante','Exportar CSV (Excel)','Imprimir o guardar PDF'])expect(html).toContain(label)
 expect(html).toContain('Portal');expect(html).not.toContain('Repositorio')
 })
 it('rejects incomplete report responses',()=>expect(()=>parseServiceRequestReport({items:[]})).toThrow())
 it('persists presentation metadata in parsing and uses its color in the glyph',()=>{
   const type=parseServiceRequestTypes({can_manage:true,items:[{id:'support',name:'Support',revision:2,archived:false,icon:'headset',color:'#A78BFA'}]}).items[0]!
   expect(type.icon).toBe('headset');expect(type.color).toBe('#A78BFA')
   expect(renderToStaticMarkup(<RequestTypeGlyph icon={type.icon} color={type.color}/>)).toContain('color:#A78BFA')
 })
 it('opens type editing on a dedicated route with title links',()=>{
   const html=renderToStaticMarkup(<MemoryRouter><ServiceRequestTypesPage/></MemoryRouter>)
   expect(html).toContain('/settings/request-types/support/edit')
   expect(html).toContain('/settings/request-types/new')
   expect(html).not.toContain('<form')
 })

})
